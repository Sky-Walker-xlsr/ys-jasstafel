import type { Game, Round, RoundInput, Side, StrokeEntry, StrokeKind } from "./types";

export const ROUND_POINTS = 157;
export const MATCH_POINTS = 257;
export const DEFAULT_TARGET = 2500;

export function isValidPoints(n: number) {
  return Number.isInteger(n) && n >= 0 && n <= ROUND_POINTS;
}

export function isValidMultiplier(n: number) {
  return Number.isInteger(n) && n >= 1;
}

/** Values that can be tapped on the Z */
export const MANUAL_VALUES = [100, 50, 20] as const;

/**
 * Own side gets input × m, the other side (157 − input) × m. Match: 257 × m vs. 0.
 * Manual (tapped on the Z): input × m vs. 0.
 */
export function computeRound({ side, input, isMatch, isManual, multiplier }: RoundInput) {
  const own = (isMatch ? MATCH_POINTS : input) * multiplier;
  const other = isMatch || isManual ? 0 : (ROUND_POINTS - input) * multiplier;
  return side === "a" ? { pointsA: own, pointsB: other } : { pointsA: other, pointsB: own };
}

export function totals(game: Pick<Game, "rounds">) {
  let a = 0;
  let b = 0;
  for (const r of game.rounds) {
    a += r.pointsA;
    b += r.pointsB;
  }
  return { a, b };
}

/** Team that reached the target. If both crossed in the same round, the higher total wins. */
export function winner(game: Game): Side | null {
  const { a, b } = totals(game);
  if (a < game.target && b < game.target) return null;
  if (a === b) return game.rounds.at(-1)?.side ?? "a";
  return a > b ? "a" : "b";
}

export const WIN_STROKES = 2;
export const BERGPREIS_STROKES = 1;

/** Round in which a team first reached `limit`. If both crossed in the same round, the higher total. */
function crossing(game: Game, limit: number): { side: Side; round: Round } | null {
  let a = 0;
  let b = 0;
  for (const r of game.rounds) {
    a += r.pointsA;
    b += r.pointsB;
    if (a >= limit || b >= limit) {
      const side: Side = a >= limit && b >= limit ? (a === b ? r.side : a > b ? "a" : "b") : a >= limit ? "a" : "b";
      return { side, round: r };
    }
  }
  return null;
}

/** First team to reach half the target. */
export function bergpreis(game: Game): Side | null {
  return crossing(game, game.target / 2)?.side ?? null;
}

/**
 * Striche earned in the running Partie: 2 for the win, 1 for the Bergpreis.
 * The id names the round that earned it, so a deleted (skipped) Strich comes back
 * only if that round is undone and the Strich is earned again by another round.
 */
export function liveStrokeEntries(game: Game): StrokeEntry[] {
  const out: StrokeEntry[] = [];
  const berg = crossing(game, game.target / 2);
  if (berg) {
    out.push({ id: `berg:${berg.side}:${berg.round.id}`, side: berg.side, kind: "berg", count: BERGPREIS_STROKES, createdAt: berg.round.createdAt, live: true });
  }
  const win = winner(game);
  const round = crossing(game, game.target)?.round ?? game.rounds.at(-1);
  if (win && round) {
    out.push({ id: `win:${win}:${round.id}`, side: win, kind: "win", count: WIN_STROKES, createdAt: round.createdAt, live: true });
  }
  const skip = new Set(game.strokeSkip ?? []);
  return out.filter((e) => !skip.has(e.id));
}

/** All Striche entries, oldest first: legacy Übertrag, stored log, running Partie. */
export function strokeEntries(game: Game): StrokeEntry[] {
  const carry = (["a", "b"] as const).flatMap((side): StrokeEntry[] => {
    const count = (side === "a" ? game.strokesA : game.strokesB) ?? 0;
    return count > 0 ? [{ id: `carry:${side}`, side, kind: "carry", count, createdAt: game.createdAt }] : [];
  });
  return [...carry, ...(game.strokeLog ?? []), ...liveStrokeEntries(game)];
}

/** Striche per team. */
export function strokes(game: Game) {
  // negative legacy values came from the old "clear" which offset the running Partie
  const sum = { a: Math.min(0, game.strokesA ?? 0), b: Math.min(0, game.strokesB ?? 0) };
  for (const e of strokeEntries(game)) sum[e.side] += e.count;
  return { a: Math.max(0, sum.a), b: Math.max(0, sum.b) };
}

export const STROKE_LABELS: Record<StrokeKind, string> = {
  win: "Sieg",
  berg: "Bergpreis",
  manual: "Manuell",
  carry: "Übertrag",
};

export interface Marks {
  hundreds: number;
  fifties: number;
  twenties: number;
  /** Points not (yet) shown as a stroke, always < 20 */
  rest: number;
}

/**
 * Strokes on a team's Z, built up round by round like on a real board:
 * each round's points (plus the carried rest) are written as new 100/50/20 strokes,
 * taps on the Z land exactly on the tapped line. Existing strokes are never merged
 * (two 50er stay two 50er).
 */
export function tallyMarks(rounds: Round[], side: Side): Marks {
  const m: Marks = { hundreds: 0, fifties: 0, twenties: 0, rest: 0 };
  for (const r of rounds) {
    const pts = side === "a" ? r.pointsA : r.pointsB;
    if (!pts) continue;
    if (r.isManual) {
      if (r.input === 100) m.hundreds++;
      else if (r.input === 50) m.fifties++;
      else if (r.input === 20) m.twenties++;
      continue;
    }
    let v = pts + m.rest;
    m.hundreds += Math.floor(v / 100);
    v %= 100;
    m.fifties += Math.floor(v / 50);
    v %= 50;
    m.twenties += Math.floor(v / 20);
    m.rest = v % 20;
  }
  return m;
}
