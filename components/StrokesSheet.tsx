"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/format";
import { STROKE_LABELS, strokeEntries, strokes } from "@/lib/scoring";
import { clearStrokes, deleteStroke } from "@/lib/store";
import type { Game, StrokeEntry } from "@/lib/types";
import ConfirmDialog from "./ConfirmDialog";
import { IconTrash, IconX } from "./Icons";

const BADGE: Record<StrokeEntry["kind"], string> = {
  win: "bg-gold/15 text-gold",
  berg: "bg-mint/15 text-mint",
  manual: "bg-surface-2 text-chalk/80",
  carry: "bg-surface-2 text-muted",
};

export default function StrokesSheet({ game, onClose }: { game: Game; onClose: () => void }) {
  const [removing, setRemoving] = useState<StrokeEntry | null>(null);
  const [clearing, setClearing] = useState(false);
  const entries = strokeEntries(game);
  const total = strokes(game);
  const team = (e: StrokeEntry) => (e.side === "a" ? game.teamA : game.teamB);

  return (
    <div className="anim-sheet safe-top fixed inset-0 z-40 flex flex-col bg-bg" role="dialog" aria-modal="true" aria-label="Striche-Verlauf">
      <header className="flex items-center gap-2 border-b border-line px-3 py-2">
        <button type="button" onClick={onClose} className="press grid size-11 place-items-center rounded-full text-muted active:bg-surface" aria-label="Schliessen">
          <IconX />
        </button>
        <h2 className="flex-1 text-lg font-semibold">Striche</h2>
        {entries.length > 0 && (
          <button type="button" onClick={() => setClearing(true)} className="press h-11 rounded-xl px-3 text-sm font-semibold text-danger active:bg-surface">
            Alle löschen
          </button>
        )}
      </header>

      <ol className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {entries.length === 0 && <li className="px-4 py-10 text-center text-muted">Noch keine Striche.</li>}
        {/* newest first */}
        {[...entries].reverse().map((e) => (
          <li key={e.id} className="flex items-center gap-3 border-b border-line py-2.5 pr-2 pl-4">
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{team(e)}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                <span className={`rounded-full px-2 py-0.5 font-semibold ${BADGE[e.kind]}`}>{STROKE_LABELS[e.kind]}</span>
                {e.live ? <span>laufende Partie</span> : <span className="tabular-nums">{formatDateTime(e.createdAt)}</span>}
              </div>
            </div>
            <span className="text-lg font-bold tabular-nums">+{e.count}</span>
            <button type="button" onClick={() => setRemoving(e)} className="press grid size-11 place-items-center rounded-full text-danger/90 active:bg-surface" aria-label={`${STROKE_LABELS[e.kind]} von ${team(e)} löschen`}>
              <IconTrash width={20} height={20} />
            </button>
          </li>
        ))}
      </ol>

      <footer className="safe-bottom grid grid-cols-2 gap-2 border-t border-line bg-surface px-4 pt-3 pb-3 font-bold tabular-nums">
        <span className="truncate">
          {game.teamA} <span className="text-chalk/80">{total.a}</span>
        </span>
        <span className="truncate text-right">
          {game.teamB} <span className="text-chalk/80">{total.b}</span>
        </span>
      </footer>

      {removing && (
        <ConfirmDialog
          title={removing.count === 1 ? "Strich löschen?" : "Striche löschen?"}
          confirmLabel="Löschen"
          danger
          onCancel={() => setRemoving(null)}
          onConfirm={() => {
            deleteStroke(game.id, removing);
            setRemoving(null);
          }}
        >
          {team(removing)}: {STROKE_LABELS[removing.kind]} +{removing.count}
          {removing.live && " – wird in dieser Partie nicht mehr gezählt. Die Punkte bleiben."}
        </ConfirmDialog>
      )}

      {clearing && (
        <ConfirmDialog
          title="Alle Striche löschen?"
          confirmLabel="Löschen"
          danger
          onCancel={() => setClearing(false)}
          onConfirm={() => {
            clearStrokes(game.id);
            setClearing(false);
          }}
        >
          {game.teamA} {total.a} · {game.teamB} {total.b} – beide werden auf 0 gesetzt. Die Punkte der laufenden Partie bleiben.
        </ConfirmDialog>
      )}
    </div>
  );
}
