"use client";

import { useState } from "react";
import { formatPoints } from "@/lib/format";
import { totals, winner } from "@/lib/scoring";
import { deleteRound, resetPartie, updateRound } from "@/lib/store";
import type { Game, Round } from "@/lib/types";
import ConfirmDialog from "./ConfirmDialog";
import { IconPencil, IconTrash, IconX } from "./Icons";
import ScoreInput from "./ScoreInput";

export default function RoundsSheet({ game, onClose }: { game: Game; onClose: () => void }) {
  const [editing, setEditing] = useState<Round | null>(null);
  const [removing, setRemoving] = useState<Round | null>(null);
  const [resetting, setResetting] = useState(false);
  const sum = totals(game);

  // Running totals after each round
  const rows = game.rounds.reduce<{ r: Round; i: number; runA: number; runB: number }[]>((acc, r, i) => {
    const prev = acc.at(-1);
    acc.push({ r, i: i + 1, runA: (prev?.runA ?? 0) + r.pointsA, runB: (prev?.runB ?? 0) + r.pointsB });
    return acc;
  }, []);

  return (
    <div className="anim-sheet safe-top fixed inset-0 z-40 flex flex-col bg-bg" role="dialog" aria-modal="true" aria-label="Verlauf">
      <header className="flex items-center gap-2 border-b border-line px-3 py-2">
        <button type="button" onClick={onClose} className="press grid size-11 place-items-center rounded-full text-muted active:bg-surface" aria-label="Schliessen">
          <IconX />
        </button>
        <h2 className="flex-1 text-lg font-semibold">Verlauf</h2>
        <span className="pr-1 text-sm text-muted">{game.rounds.length} Runden</span>
        {game.rounds.length > 0 && (
          <button type="button" onClick={() => setResetting(true)} className="press h-11 rounded-xl px-3 text-sm font-semibold text-danger active:bg-surface">
            Zurücksetzen
          </button>
        )}
      </header>

      <div className="grid grid-cols-[2rem_1fr_1fr_5.5rem] items-center gap-2 border-b border-line px-4 py-2 text-xs font-semibold tracking-wide text-muted uppercase">
        <span>#</span>
        <span className="truncate text-right">{game.teamA}</span>
        <span className="truncate text-right">{game.teamB}</span>
        <span />
      </div>

      <ol className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {rows.length === 0 && <li className="px-4 py-10 text-center text-muted">Noch keine Runden geschrieben.</li>}
        {/* newest first */}
        {[...rows].reverse().map(({ r, i, runA, runB }) => (
          <li key={r.id} className="grid grid-cols-[2rem_1fr_1fr_5.5rem] items-center gap-2 border-b border-line px-4 py-2.5">
            <span className="text-sm text-muted tabular-nums">{i}</span>
            {(["a", "b"] as const).map((s) => {
              const pts = s === "a" ? r.pointsA : r.pointsB;
              const run = s === "a" ? runA : runB;
              return (
                <div key={s} className="text-right tabular-nums">
                  <div className={`font-semibold ${r.side === s ? "text-chalk" : "text-chalk/80"}`}>
                    {r.side === s && r.isMatch && <span className="mr-1 text-xs font-bold text-gold">MATCH</span>}+{formatPoints(pts)}
                  </div>
                  <div className="text-xs text-muted">{formatPoints(run)}</div>
                </div>
              );
            })}
            <div className="flex justify-end gap-1">
              {!r.isManual && (
                <button type="button" onClick={() => setEditing(r)} className="press grid size-11 place-items-center rounded-full text-muted active:bg-surface" aria-label={`Runde ${i} bearbeiten`}>
                  <IconPencil width={20} height={20} />
                </button>
              )}
              <button type="button" onClick={() => setRemoving(r)} className="press grid size-11 place-items-center rounded-full text-danger/90 active:bg-surface" aria-label={`Runde ${i} löschen`}>
                <IconTrash width={20} height={20} />
              </button>
            </div>
            <div className="col-span-4 -mt-1 text-xs text-muted">
              {r.side === "a" ? game.teamA : game.teamB}: {r.isManual ? `Manuell +${r.input}` : `${r.isMatch ? "Match" : `${r.input} Punkte`} × ${r.multiplier}`}
            </div>
          </li>
        ))}
      </ol>

      <footer className="safe-bottom grid grid-cols-[2rem_1fr_1fr_5.5rem] gap-2 border-t border-line bg-surface px-4 pt-3 pb-3 font-bold tabular-nums">
        <span className="text-muted">Σ</span>
        <span className="text-right">{formatPoints(sum.a)}</span>
        <span className="text-right">{formatPoints(sum.b)}</span>
        <span />
      </footer>

      {editing && (
        <div className="safe-top safe-bottom fixed inset-0 z-50 bg-bg">
          <ScoreInput
            side={editing.side}
            isMatch={editing.isMatch}
            teamA={game.teamA}
            teamB={game.teamB}
            initial={{ input: editing.input, multiplier: editing.multiplier }}
            title={`Runde ${game.rounds.indexOf(editing) + 1} bearbeiten · ${editing.side === "a" ? game.teamA : game.teamB}`}
            onClose={() => setEditing(null)}
            onSubmit={(input) => {
              updateRound(game.id, editing.id, input);
              setEditing(null);
            }}
          />
        </div>
      )}

      {resetting && (
        <ConfirmDialog
          title="Partie zurücksetzen?"
          confirmLabel="Zurücksetzen"
          danger
          onCancel={() => setResetting(false)}
          onConfirm={() => {
            resetPartie(game.id);
            setResetting(false);
            onClose();
          }}
        >
          Alle {game.rounds.length} Runden werden gelöscht und die Partie beginnt bei 0.
          {winner(game) ? " Die Striche bleiben." : " Bereits erzielte Striche (z. B. Bergpreis) bleiben."}
        </ConfirmDialog>
      )}

      {removing && (
        <ConfirmDialog
          title={`Runde ${game.rounds.indexOf(removing) + 1} löschen?`}
          confirmLabel="Löschen"
          danger
          onCancel={() => setRemoving(null)}
          onConfirm={() => {
            deleteRound(game.id, removing.id);
            setRemoving(null);
          }}
        >
          {game.teamA} +{formatPoints(removing.pointsA)} · {game.teamB} +{formatPoints(removing.pointsB)}
        </ConfirmDialog>
      )}
    </div>
  );
}
