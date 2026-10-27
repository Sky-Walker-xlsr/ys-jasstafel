"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPoints } from "@/lib/format";
import { tallyMarks, totals, winner } from "@/lib/scoring";
import { addRound, renameTeam, resetPartie, undoLastRound } from "@/lib/store";
import type { Game, Side } from "@/lib/types";
import { useSwipe } from "@/lib/useSwipe";
import { useWakeLock } from "@/lib/useWakeLock";
import { markEntered } from "@/lib/visit";
import ConfirmDialog from "./ConfirmDialog";
import { IconHome, IconList, IconRestart, IconStrokes, IconUndo } from "./Icons";
import RenameTeam from "./RenameTeam";
import RoundsSheet from "./RoundsSheet";
import ScoreInput from "./ScoreInput";
import StrichePage from "./StrichePage";
import TeamHalf from "./TeamHalf";

type Pad = { isMatch: boolean } | { rename: true } | null;

export default function Board({ game }: { game: Game }) {
  useWakeLock();
  useEffect(() => markEntered(game.id), [game.id]);
  const [pads, setPads] = useState<Record<Side, Pad>>({ a: null, b: null });
  const [history, setHistory] = useState(false);
  const [striche, setStriche] = useState(false);
  const [confirm, setConfirm] = useState<"undo" | "partie" | null>(null);

  const sum = totals(game);
  const win = winner(game);
  const last = game.rounds.at(-1);

  // Big right-to-left swipe opens the Striche page (not while an input or dialog is open)
  const swipe = useSwipe({
    onLeft: () => setStriche(true),
    disabled: !!(pads.a || pads.b || history || striche || confirm),
  });

  const openPad = (side: Side, pad: Pad) => setPads((p) => ({ ...p, [side]: pad }));
  const closePad = (side: Side) => setPads((p) => ({ ...p, [side]: null }));

  function half(side: Side) {
    const pad = pads[side];
    const name = side === "a" ? game.teamA : game.teamB;
    return (
      <TeamHalf
        side={side}
        name={name}
        total={side === "a" ? sum.a : sum.b}
        marks={tallyMarks(game.rounds, side)}
        target={game.target}
        rotated={side === "b"}
        winner={win}
        onPoints={() => openPad(side, { isMatch: false })}
        onMatch={() => openPad(side, { isMatch: true })}
        onNewPartie={() => setConfirm("partie")}
        onAdd={(value) => addRound(game.id, { side, input: value, isMatch: false, isManual: true, multiplier: 1 })}
        onRename={() => openPad(side, { rename: true })}
        overlay={
          pad &&
          ("rename" in pad ? (
            <RenameTeam
              name={name}
              fallback={side === "a" ? "Team A" : "Team B"}
              onClose={() => closePad(side)}
              onSave={(next) => {
                if (next !== name) renameTeam(game.id, side, next);
                closePad(side);
              }}
            />
          ) : (
            <ScoreInput
              side={side}
              isMatch={pad.isMatch}
              teamA={game.teamA}
              teamB={game.teamB}
              onClose={() => closePad(side)}
              onSubmit={(input) => {
                addRound(game.id, input);
                closePad(side);
              }}
            />
          ))
        }
      />
    );
  }

  const midBtn = "press relative grid size-11 place-items-center rounded-full bg-bg text-chalk/80 active:bg-surface disabled:opacity-30";

  return (
    <main className="board-lock flex flex-col bg-bg" {...swipe}>
      {/* Team B – top, rotated */}
      {half("b")}

      {/* Midline */}
      <nav className="relative z-10 flex h-14 shrink-0 items-center justify-between gap-2 px-3" aria-label="Spiel">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-chalk/15" />
        <div className="flex items-center gap-1">
          <Link href="/spiele" className={midBtn} aria-label="Menü">
            <IconHome />
          </Link>
          <button type="button" onClick={() => setHistory(true)} className="press relative flex h-11 items-center gap-2 rounded-full bg-bg px-3 text-chalk/80 active:bg-surface" aria-label="Verlauf">
            <IconList />
            <span className="text-sm font-semibold tabular-nums">{game.rounds.length}</span>
          </button>
        </div>

        {win && (
          <button
            type="button"
            onClick={() => setConfirm("partie")}
            className="press relative flex h-11 items-center gap-2 rounded-full bg-gold px-4 text-sm font-semibold text-black"
          >
            <IconRestart width={18} height={18} />
            Neue Partie
          </button>
        )}

        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setConfirm("undo")} disabled={!last} className={midBtn} aria-label="Letzte Runde rückgängig">
            <IconUndo />
          </button>
          <button type="button" onClick={() => setStriche(true)} className={midBtn} aria-label="Striche anzeigen">
            <IconStrokes />
          </button>
        </div>
      </nav>

      {/* Team A – bottom */}
      {half("a")}

      {history && <RoundsSheet game={game} onClose={() => setHistory(false)} />}
      {striche && <StrichePage game={game} onClose={() => setStriche(false)} />}

      {confirm === "undo" && last && (
        <ConfirmDialog
          title="Letzte Runde löschen?"
          confirmLabel="Löschen"
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            undoLastRound(game.id);
            setConfirm(null);
          }}
        >
          {game.teamA} +{formatPoints(last.pointsA)} · {game.teamB} +{formatPoints(last.pointsB)}
        </ConfirmDialog>
      )}

      {confirm === "partie" && (
        <ConfirmDialog
          title="Neue Partie starten?"
          confirmLabel="Neue Partie"
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            resetPartie(game.id);
            setConfirm(null);
          }}
        >
          Alle Runden werden gelöscht. Die Striche bleiben.
        </ConfirmDialog>
      )}
    </main>
  );
}
