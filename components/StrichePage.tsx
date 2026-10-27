"use client";

import { useState } from "react";
import { BERGPREIS_STROKES, liveStrokeEntries, strokeEntries, strokes, WIN_STROKES } from "@/lib/scoring";
import { addStroke } from "@/lib/store";
import type { Game, Side } from "@/lib/types";
import { useSwipe } from "@/lib/useSwipe";
import { IconBack, IconList, IconPlus } from "./Icons";
import StrokesSheet from "./StrokesSheet";

const W = 300;
const H_STROKE = 34;
const U = 11; // stroke spacing
const GROUP = 6 * U; // four strokes + gap
const PER_ROW = 4 * 5;
const ROW_GAP = 16;

/** Striche as tally marks: groups of five (fifth crosses), four groups per row. */
function StrokeTally({ count }: { count: number }) {
  const rows = Math.max(1, Math.ceil(count / PER_ROW));
  const height = rows * H_STROKE + (rows - 1) * ROW_GAP + 8;
  const start = (W - (4 * GROUP - 3 * U)) / 2;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="max-h-full w-full" aria-hidden="true">
      <g stroke="var(--color-chalk)" strokeWidth={4} strokeLinecap="round">
        {Array.from({ length: count }, (_, i) => {
          const row = Math.floor(i / PER_ROW);
          const j = i % PER_ROW;
          const k = j % 5;
          const x = start + Math.floor(j / 5) * GROUP;
          const y0 = 4 + row * (H_STROKE + ROW_GAP);
          return k < 4 ? (
            <line key={i} x1={x + k * U} y1={y0} x2={x + k * U} y2={y0 + H_STROKE} />
          ) : (
            <line key={i} x1={x - U} y1={y0 + H_STROKE - 6} x2={x + 4 * U} y2={y0 + 6} />
          );
        })}
      </g>
      {count === 0 && (
        <line x1={W / 2 - 20} y1={height / 2} x2={W / 2 + 20} y2={height / 2} stroke="var(--color-chalk)" strokeOpacity={0.2} strokeWidth={3} strokeLinecap="round" />
      )}
    </svg>
  );
}

function StricheHalf({ game, side }: { game: Game; side: Side }) {
  const count = strokes(game)[side];
  const live = liveStrokeEntries(game).filter((e) => e.side === side);
  const win = live.some((e) => e.kind === "win");
  const berg = live.some((e) => e.kind === "berg");
  const rotated = side === "b";
  const name = side === "a" ? game.teamA : game.teamB;

  return (
    <section className={`chalkboard relative flex min-h-0 flex-1 flex-col ${rotated ? "rotate-180" : ""}`} aria-label={`Striche ${name}`}>
      <div className="safe-x flex min-h-0 flex-1 flex-col pt-3" style={{ paddingBottom: `calc(env(safe-area-inset-${rotated ? "top" : "bottom"}) + 16px)` }}>
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{name}</h2>
            <p className="text-sm text-muted">Striche</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                addStroke(game.id, side);
                navigator.vibrate?.(10);
              }}
              className="press grid size-11 place-items-center rounded-full bg-tiber text-chalk active:bg-tiber-hi"
              aria-label={`Strich für ${name} hinzufügen`}
            >
              <IconPlus />
            </button>
            <div className="min-w-[2ch] text-right text-[2.75rem] leading-none font-bold tabular-nums">{count}</div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 items-center justify-center py-3">
          <StrokeTally count={count} />
        </div>

        {/* what the running Partie has earned so far */}
        <div className="flex min-h-11 flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Laufende Partie:</span>
          {!win && !berg && <span className="text-muted/70">noch keine Striche</span>}
          {berg && <span className="rounded-full bg-mint/15 px-3 py-1 font-semibold text-mint">Bergpreis +{BERGPREIS_STROKES}</span>}
          {win && <span className="rounded-full bg-gold/15 px-3 py-1 font-semibold text-gold">Sieg +{WIN_STROKES}</span>}
        </div>
      </div>
    </section>
  );
}

export default function StrichePage({ game, onClose }: { game: Game; onClose: () => void }) {
  const [history, setHistory] = useState(false);
  const swipe = useSwipe({ onRight: onClose, disabled: history });
  const entries = strokeEntries(game).length;

  return (
    <div className="anim-slide board-lock z-30 flex flex-col bg-bg" role="dialog" aria-modal="true" aria-label="Striche" {...swipe}>
      <StricheHalf game={game} side="b" />

      <nav className="relative z-10 flex h-14 shrink-0 items-center justify-between px-3" aria-label="Striche">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-chalk/15" />
        <button type="button" onClick={onClose} className="press relative flex h-11 items-center gap-1 rounded-full bg-bg pr-4 pl-2 text-chalk/80 active:bg-surface" aria-label="Zurück zur Tafel">
          <IconBack />
          <span className="text-sm font-semibold">Tafel</span>
        </button>
        <span className="relative rounded-full bg-bg px-3 text-xs text-muted">Sieg {WIN_STROKES} · Bergpreis {BERGPREIS_STROKES}</span>
        <button type="button" onClick={() => setHistory(true)} className="press relative flex h-11 items-center gap-2 rounded-full bg-bg px-3 text-chalk/80 active:bg-surface" aria-label="Striche-Verlauf">
          <IconList />
          <span className="text-sm font-semibold tabular-nums">{entries}</span>
        </button>
      </nav>

      <StricheHalf game={game} side="a" />

      {history && <StrokesSheet game={game} onClose={() => setHistory(false)} />}
    </div>
  );
}
