"use client";

/**
 * Game store.
 *
 * All reads/writes go to a localStorage cache first, so the board works offline.
 * - Without login: the cache *is* the storage (key `…:local`).
 * - With login: the cache is per user, and every change is also queued in an
 *   outbox that is flushed to Supabase in order whenever we're online. Once the
 *   outbox is empty the cache is refreshed from Supabase.
 * - On login, games stored without an account are moved into the user's outbox
 *   and therefore uploaded.
 */

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { computeRound, liveStrokeEntries } from "./scoring";
import { getSupabase } from "./supabase";
import type { Game, Round, RoundInput, Side, StrokeEntry } from "./types";
import { forgetLastGame } from "./visit";

const PREFIX = "jasstafel:v1";
const LOCAL = "local";

interface GameRow {
  id: string;
  user_id: string;
  team_a_name: string;
  team_b_name: string;
  target_points: number;
  strokes_a: number;
  strokes_b: number;
  stroke_log: StrokeEntry[];
  stroke_skip: string[];
  created_at: string;
  updated_at: string;
}

interface RoundRow {
  id: string;
  game_id: string;
  round_no: number;
  input_side: "a" | "b";
  input_points: number;
  is_match: boolean;
  is_manual: boolean;
  multiplier: number;
  points_a: number;
  points_b: number;
  created_at: string;
}

type Op =
  | { t: "game"; row: GameRow }
  | { t: "delGame"; id: string }
  | { t: "round"; row: RoundRow }
  | { t: "clearRounds"; gameId: string }
  | { t: "delRound"; id: string };

export interface StoreState {
  /** Local cache loaded (false during SSR / first hydration render) */
  ready: boolean;
  /** Supabase configured */
  cloud: boolean;
  user: { id: string; email: string | null } | null;
  games: Game[];
  /** Changes not yet saved to Supabase */
  pending: number;
  /** First remote load for this user still running */
  loadingRemote: boolean;
  error: string | null;
}

const serverState: StoreState = {
  ready: false,
  cloud: false,
  user: null,
  games: [],
  pending: 0,
  loadingRemote: false,
  error: null,
};

let state: StoreState = serverState;
let outbox: Op[] = [];
let initialized = false;
let syncing = false;
let syncAgain = false;
let version = 0;
const listeners = new Set<() => void>();

function set(patch: Partial<StoreState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

// ── persistence ─────────────────────────────────────────────────────────

const gamesKey = (uid: string | null) => `${PREFIX}:games:${uid ?? LOCAL}`;
const outboxKey = (uid: string) => `${PREFIX}:outbox:${uid}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota / private mode – keep in memory
  }
}

function persist() {
  const uid = state.user?.id ?? null;
  write(gamesKey(uid), state.games);
  if (uid) write(outboxKey(uid), outbox);
}

// ── mapping ─────────────────────────────────────────────────────────────

function gameRow(g: Game, userId: string): GameRow {
  return {
    id: g.id,
    user_id: userId,
    team_a_name: g.teamA,
    team_b_name: g.teamB,
    target_points: g.target,
    strokes_a: g.strokesA ?? 0,
    strokes_b: g.strokesB ?? 0,
    stroke_log: g.strokeLog ?? [],
    stroke_skip: g.strokeSkip ?? [],
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  };
}

function roundRow(gameId: string, r: Round): RoundRow {
  return {
    id: r.id,
    game_id: gameId,
    round_no: r.no,
    input_side: r.side,
    input_points: r.input,
    is_match: r.isMatch,
    is_manual: !!r.isManual,
    multiplier: r.multiplier,
    points_a: r.pointsA,
    points_b: r.pointsB,
    created_at: r.createdAt,
  };
}

/** jsonb may arrive as a string from some environments */
function jsonArray<T>(v: unknown): T[] {
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      return [];
    }
  }
  return Array.isArray(v) ? (v as T[]) : [];
}

function fromRows(g: GameRow & { rounds: RoundRow[] }): Game {
  return {
    id: g.id,
    teamA: g.team_a_name,
    teamB: g.team_b_name,
    target: g.target_points,
    strokesA: g.strokes_a ?? 0,
    strokesB: g.strokes_b ?? 0,
    strokeLog: jsonArray<StrokeEntry>(g.stroke_log),
    strokeSkip: jsonArray<string>(g.stroke_skip),
    createdAt: g.created_at,
    updatedAt: g.updated_at,
    rounds: [...g.rounds]
      .sort((x, y) => x.round_no - y.round_no)
      .map((r) => ({
        id: r.id,
        no: r.round_no,
        side: r.input_side,
        input: r.input_points,
        isMatch: r.is_match,
        isManual: r.is_manual,
        multiplier: r.multiplier,
        pointsA: r.points_a,
        pointsB: r.points_b,
        createdAt: r.created_at,
      })),
  };
}

// ── sync ────────────────────────────────────────────────────────────────

/** PostgREST/auth errors without a Postgres SQLSTATE (network, expired JWT, …) are retried later. */
function isRetryable(err: { code?: string } | null) {
  return !err?.code || !/^[0-9A-Z]{5}$/.test(err.code);
}

async function apply(op: Op) {
  const sb = getSupabase()!;
  switch (op.t) {
    case "game":
      return (await sb.from("games").upsert(op.row)).error;
    case "delGame":
      return (await sb.from("games").delete().eq("id", op.id)).error;
    case "round":
      return (await sb.from("rounds").upsert(op.row)).error;
    case "clearRounds":
      return (await sb.from("rounds").delete().eq("game_id", op.gameId)).error;
    case "delRound":
      return (await sb.from("rounds").delete().eq("id", op.id)).error;
  }
}

async function flush(uid: string) {
  while (outbox.length && state.user?.id === uid) {
    const err = await apply(outbox[0]).catch((e: Error) => ({ code: undefined, message: e.message }));
    if (err) {
      if (isRetryable(err)) {
        set({ error: navigator.onLine ? "Synchronisierung fehlgeschlagen" : null });
        return false;
      }
      console.error("Dropping op that Supabase rejected", outbox[0], err);
      set({ error: `Änderung abgelehnt: ${err.message}` });
    }
    outbox = outbox.slice(1);
    persist();
    set({ pending: outbox.length });
  }
  return true;
}

async function fetchRemote(uid: string) {
  const sb = getSupabase()!;
  const before = version;
  const { data, error } = await sb
    .from("games")
    .select("*, rounds(*)")
    .order("updated_at", { ascending: false });
  if (error) return;
  // Don't overwrite changes made while the request was running
  if (version !== before || outbox.length || state.user?.id !== uid) return;
  set({ games: (data as (GameRow & { rounds: RoundRow[] })[]).map(fromRows), error: null });
  persist();
}

export async function sync() {
  const uid = state.user?.id;
  if (!uid || !getSupabase()) return;
  if (syncing) {
    syncAgain = true;
    return;
  }
  syncing = true;
  try {
    do {
      syncAgain = false;
      if ((await flush(uid)) && !syncAgain) await fetchRemote(uid);
    } while (syncAgain);
  } finally {
    syncing = false;
    if (state.loadingRemote) set({ loadingRemote: false });
  }
}

// ── auth ────────────────────────────────────────────────────────────────

function setUser(user: User | null) {
  const next = user ? { id: user.id, email: user.email ?? null } : null;
  if (next?.id === state.user?.id) {
    if (next && next.email !== state.user?.email) set({ user: next });
    return;
  }

  if (next) {
    let games = read<Game[]>(gamesKey(next.id), []);
    outbox = read<Op[]>(outboxKey(next.id), []);

    // First login on this device: upload games stored without an account
    const anon = read<Game[]>(gamesKey(null), []);
    if (anon.length) {
      const known = new Set(games.map((g) => g.id));
      const moved = anon.filter((g) => !known.has(g.id));
      for (const g of moved) {
        outbox.push({ t: "game", row: gameRow(g, next.id) });
        for (const r of g.rounds) outbox.push({ t: "round", row: roundRow(g.id, r) });
      }
      games = [...moved, ...games];
    }

    set({ user: next, games, pending: outbox.length, loadingRemote: true, error: null });
    persist();
    if (anon.length) {
      try {
        localStorage.removeItem(gamesKey(null));
      } catch {}
    }
    void sync();
  } else {
    outbox = [];
    set({ user: null, games: read<Game[]>(gamesKey(null), []), pending: 0, loadingRemote: false, error: null });
  }
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
  setUser(null);
}

// ── init / subscribe ────────────────────────────────────────────────────

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const sb = getSupabase();
  state = { ...state, ready: true, cloud: !!sb, games: read<Game[]>(gamesKey(null), []) };

  if (sb) {
    // Restore the user's cache synchronously when a session is stored, to avoid a flash of local games
    sb.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    sb.auth.onAuthStateChange((_event, session) => {
      // Defer: calling Supabase inside this callback can deadlock the auth lock
      setTimeout(() => setUser(session?.user ?? null), 0);
    });
    window.addEventListener("online", () => void sync());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void sync();
    });
  }
}

function subscribe(listener: () => void) {
  init();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, () => state, () => serverState);
}

// ── mutations ───────────────────────────────────────────────────────────

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  // Fallback for non-secure contexts (e.g. LAN dev over http)
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
  );
}

function mutate(games: Game[], ops: Op[]) {
  version++;
  set({ games });
  if (state.user) {
    outbox = [...outbox, ...ops];
    set({ pending: outbox.length });
  }
  persist();
  void sync();
}

/** Returns the edited copy of a game (not yet stored), with a fresh updatedAt. */
function edit(gameId: string, fn: (g: Game) => Game): Game | undefined {
  const game = state.games.find((g) => g.id === gameId);
  return game && { ...fn(game), updatedAt: new Date().toISOString() };
}

function replace(next: Game) {
  return [next, ...state.games.filter((g) => g.id !== next.id)];
}

export function createGame(teamA: string, teamB: string, target: number) {
  const now = new Date().toISOString();
  const game: Game = { id: uuid(), teamA, teamB, target, createdAt: now, updatedAt: now, rounds: [] };
  mutate([game, ...state.games], state.user ? [{ t: "game", row: gameRow(game, state.user.id) }] : []);
  return game.id;
}

export function deleteGame(id: string) {
  forgetLastGame(id);
  mutate(
    state.games.filter((g) => g.id !== id),
    [{ t: "delGame", id }],
  );
}

export function addRound(gameId: string, input: RoundInput) {
  const round: Round = {
    id: uuid(),
    no: 0,
    ...input,
    ...computeRound(input),
    createdAt: new Date().toISOString(),
  };
  const next = edit(gameId, (g) => {
    round.no = Math.max(0, ...g.rounds.map((r) => r.no)) + 1;
    return { ...g, rounds: [...g.rounds, round] };
  });
  if (next) mutate(replace(next), [{ t: "round", row: roundRow(gameId, round) }]);
}

export function updateRound(gameId: string, roundId: string, input: RoundInput) {
  let updated: Round | undefined;
  const next = edit(gameId, (g) => ({
    ...g,
    rounds: g.rounds.map((r) => (r.id === roundId ? (updated = { ...r, ...input, ...computeRound(input) }) : r)),
  }));
  if (next && updated) mutate(replace(next), [{ t: "round", row: roundRow(gameId, updated) }]);
}

export function deleteRound(gameId: string, roundId: string) {
  const next = edit(gameId, (g) => ({ ...g, rounds: g.rounds.filter((r) => r.id !== roundId) }));
  if (next) mutate(replace(next), [{ t: "delRound", id: roundId }]);
}

export function undoLastRound(gameId: string) {
  const last = state.games.find((g) => g.id === gameId)?.rounds.at(-1);
  if (last) deleteRound(gameId, last.id);
}

/** Game meta changed (Striche): queue an upsert of the game row */
function gameOps(game: Game, extra: Op[] = []): Op[] {
  return state.user ? [{ t: "game", row: gameRow(game, state.user.id) }, ...extra] : [];
}

/**
 * Start a new Partie in the same game: the Striche of the running Partie are written
 * to the Striche log, all rounds are deleted.
 */
export function resetPartie(gameId: string) {
  const next = edit(gameId, (g) => {
    const banked = liveStrokeEntries(g).map(({ side, kind, count, createdAt }) => ({ id: uuid(), side, kind, count, createdAt }));
    return { ...g, strokeLog: [...(g.strokeLog ?? []), ...banked], strokeSkip: [], rounds: [] };
  });
  if (next) mutate(replace(next), gameOps(next, [{ t: "clearRounds", gameId }]));
}

export function renameTeam(gameId: string, side: Side, name: string) {
  const next = edit(gameId, (g) => (side === "a" ? { ...g, teamA: name } : { ...g, teamB: name }));
  if (next) mutate(replace(next), gameOps(next));
}

export function addStroke(gameId: string, side: Side, count = 1) {
  const entry: StrokeEntry = { id: uuid(), side, kind: "manual", count, createdAt: new Date().toISOString() };
  const next = edit(gameId, (g) => ({ ...g, strokeLog: [...(g.strokeLog ?? []), entry] }));
  if (next) mutate(replace(next), gameOps(next));
}

/** Delete one Striche entry. An auto Strich of the running Partie is skipped instead. */
export function deleteStroke(gameId: string, entry: StrokeEntry) {
  const next = edit(gameId, (g) => {
    if (entry.live) return { ...g, strokeSkip: [...(g.strokeSkip ?? []), entry.id] };
    if (entry.kind === "carry") return entry.side === "a" ? { ...g, strokesA: 0 } : { ...g, strokesB: 0 };
    return { ...g, strokeLog: (g.strokeLog ?? []).filter((e) => e.id !== entry.id) };
  });
  if (next) mutate(replace(next), gameOps(next));
}

/** Remove all Striche, including those of the running Partie. */
export function clearStrokes(gameId: string) {
  const next = edit(gameId, (g) => ({
    ...g,
    strokesA: 0,
    strokesB: 0,
    strokeLog: [],
    strokeSkip: [...(g.strokeSkip ?? []), ...liveStrokeEntries(g).map((e) => e.id)],
  }));
  if (next) mutate(replace(next), gameOps(next));
}
