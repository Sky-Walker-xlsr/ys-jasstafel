"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { IconBack, IconCloud, IconPlus, IconTrash, IconTrophy, IconUser } from "@/components/Icons";
import Logo from "@/components/Logo";
import NewGameDialog from "@/components/NewGameDialog";
import { formatDateTime, formatPoints } from "@/lib/format";
import { strokes, totals, winner } from "@/lib/scoring";
import { createGame, deleteGame, useStore } from "@/lib/store";
import type { Game } from "@/lib/types";
import { markEntered } from "@/lib/visit";

export default function Games() {
  const router = useRouter();
  const store = useStore();
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState<Game | null>(null);

  useEffect(() => markEntered(), []);

  const games = [...store.games].sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));

  return (
    <main className="safe-top safe-x mx-auto flex min-h-dvh max-w-xl flex-col">
      <header className="flex items-center justify-between pt-5 pb-4">
        <Link href="/?info" className="press -ml-1 flex items-center gap-3 rounded-xl px-1 py-1 active:bg-surface" aria-label="YS-Jasstafel – zur Startseite">
          <Logo />
          <h1 className="text-2xl font-bold tracking-tight">YS-Jasstafel</h1>
        </Link>
        {store.cloud && (
          <Link
            href="/konto"
            className="press grid size-11 place-items-center rounded-full bg-surface text-muted"
            aria-label="Konto"
          >
            <IconUser width={22} height={22} />
          </Link>
        )}
      </header>

      <button
        type="button"
        onClick={() => setCreating(true)}
        className="press flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-tiber text-lg font-semibold text-chalk ring-1 ring-mint/30 active:bg-tiber-hi"
      >
        <IconPlus className="text-mint" />
        Neues Spiel
      </button>

      <section className="mt-8 flex-1" aria-labelledby="games-title">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="games-title" className="text-sm font-semibold tracking-wide text-muted uppercase">
            Spiele
          </h2>
          {store.user && store.pending > 0 && (
            <span className="text-xs text-muted">{store.pending} Änderung{store.pending === 1 ? "" : "en"} nicht synchronisiert</span>
          )}
        </div>

        {!store.ready || (store.loadingRemote && games.length === 0) ? (
          <div className="space-y-3" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface" />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line px-6 py-10 text-center text-muted">
            Noch keine Spiele. Starte oben ein neues Spiel.
          </div>
        ) : (
          <ul className="space-y-3">
            {games.map((g) => (
              <GameCard key={g.id} game={g} onDelete={() => setRemoving(g)} />
            ))}
          </ul>
        )}
      </section>

      <section id="konto" className="safe-bottom mt-10 mb-6" aria-labelledby="account-title">
        <h2 id="account-title" className="mb-3 text-sm font-semibold tracking-wide text-muted uppercase">
          Konto
        </h2>
        <div className="rounded-2xl bg-surface p-4">
          {!store.cloud ? (
            <p className="text-sm text-muted">Spiele werden auf diesem Gerät gespeichert.</p>
          ) : store.user ? (
            <Link href="/konto" className="press -m-2 flex items-center gap-3 rounded-xl p-2 active:bg-surface-2" aria-label="Konto verwalten">
              <IconCloud className="shrink-0 text-mint" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{store.user.email}</div>
                <div className="text-xs text-muted">Spiele werden in der Cloud gespeichert</div>
              </div>
              <IconBack width={20} height={20} className="shrink-0 rotate-180 text-muted" />
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <p className="flex-1 text-sm text-muted">Nicht angemeldet – Spiele werden nur auf diesem Gerät gespeichert.</p>
              <Link href="/login" className="press grid h-11 place-items-center rounded-xl bg-mint px-4 text-sm font-semibold text-tiber-lo">
                Anmelden
              </Link>
            </div>
          )}
          {store.error && <p className="mt-3 text-xs text-danger">{store.error}</p>}
        </div>
        <nav className="mt-4 flex items-center justify-center gap-1 text-sm text-muted" aria-label="Info">
          <Link href="/?info" className="flex h-11 items-center px-2 underline-offset-4 hover:underline">
            Über
          </Link>
          ·
          <Link href="/impressum" className="flex h-11 items-center px-2 underline-offset-4 hover:underline">
            Impressum
          </Link>
          ·
          <Link href="/datenschutz" className="flex h-11 items-center px-2 underline-offset-4 hover:underline">
            Datenschutz
          </Link>
        </nav>
      </section>

      {creating && (
        <NewGameDialog
          onClose={() => setCreating(false)}
          onCreate={(a, b, target) => {
            const id = createGame(a, b, target);
            router.push(`/spiel?id=${id}`);
          }}
        />
      )}

      {removing && (
        <ConfirmDialog
          title="Spiel löschen?"
          confirmLabel="Löschen"
          danger
          onCancel={() => setRemoving(null)}
          onConfirm={() => {
            deleteGame(removing.id);
            setRemoving(null);
          }}
        >
          {removing.teamA} gegen {removing.teamB} wird endgültig gelöscht.
        </ConfirmDialog>
      )}
    </main>
  );
}

function GameCard({ game, onDelete }: { game: Game; onDelete: () => void }) {
  const t = totals(game);
  const win = winner(game);
  const st = strokes(game);
  const row = (name: string, pts: number, isWinner: boolean) => (
    <div className="flex items-baseline justify-between gap-3">
      <span className={`flex min-w-0 items-center gap-1.5 truncate ${isWinner ? "font-semibold text-gold" : "text-chalk"}`}>
        {isWinner && <IconTrophy width={16} height={16} className="shrink-0" />}
        <span className="truncate">{name}</span>
      </span>
      <span className={`text-lg font-bold tabular-nums ${isWinner ? "text-gold" : ""}`}>{formatPoints(pts)}</span>
    </div>
  );

  return (
    <li className="flex items-stretch overflow-hidden rounded-2xl bg-surface">
      <Link href={`/spiel?id=${game.id}`} className="press min-w-0 flex-1 px-4 py-3 active:bg-surface-2">
        {row(game.teamA, t.a, win === "a")}
        {row(game.teamB, t.b, win === "b")}
        <div className="mt-1.5 text-xs text-muted">
          {formatDateTime(game.updatedAt)} · {game.rounds.length} Runden · Ziel {formatPoints(game.target)}
          {(st.a > 0 || st.b > 0) && (
            <>
              {" · "}
              <span className="font-semibold text-chalk/80">
                Striche {st.a} : {st.b}
              </span>
            </>
          )}
        </div>
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className="press grid w-14 shrink-0 place-items-center border-l border-line text-muted active:bg-surface-2 active:text-danger"
        aria-label={`Spiel ${game.teamA} gegen ${game.teamB} löschen`}
      >
        <IconTrash width={20} height={20} />
      </button>
    </li>
  );
}
