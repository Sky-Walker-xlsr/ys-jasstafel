"use client";

import { formatPoints } from "@/lib/format";
import type { Marks } from "@/lib/scoring";
import type { Side } from "@/lib/types";
import { IconPencil, IconStar, IconTrophy } from "./Icons";
import Tally from "./Tally";

interface Props {
  side: Side;
  name: string;
  total: number;
  marks: Marks;
  target: number;
  /** Top half: rotated 180° for the player on the other side of the table */
  rotated?: boolean;
  winner: Side | null;
  onPoints: () => void;
  onMatch: () => void;
  /** Winner banner: start the next Partie (rounds reset, Striche stay) */
  onNewPartie: () => void;
  /** Tap on the Z adds 100/50/20 (e.g. Weis) */
  onAdd: (value: number) => void;
  /** Tap on the team name */
  onRename: () => void;
  /** Rendered over the half (input pad), inherits the rotation */
  overlay?: React.ReactNode;
}

/** One team's half of the board. Local top = midline, local bottom = the player's edge. */
export default function TeamHalf({ side, name, total, marks, target, rotated, winner, onPoints, onMatch, onNewPartie, onAdd, onRename, overlay }: Props) {
  const remaining = Math.max(0, target - total);
  const finished = winner !== null;
  const won = winner === side;
  const edgePad = { paddingBottom: `env(safe-area-inset-${rotated ? "top" : "bottom"})` };

  return (
    <section
      className={`chalkboard relative flex min-h-0 flex-1 flex-col ${rotated ? "rotate-180" : ""}`}
      aria-label={`Team ${name}`}
    >
      <div
        className="safe-x flex min-h-0 flex-1 flex-col pt-3"
        style={{ paddingBottom: `calc(${edgePad.paddingBottom} + 12px)` }}
      >
        {/* header at the midline */}
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="min-w-0">
              <button
                type="button"
                onClick={onRename}
                className="press -mx-1 flex max-w-full items-center gap-1.5 rounded-lg px-1 text-lg font-semibold text-chalk active:bg-surface"
                aria-label={`Teamname ${name} ändern`}
              >
                <span className="truncate">{name}</span>
                <IconPencil width={14} height={14} className="shrink-0 text-muted" />
              </button>
            </h2>
            <p className="text-sm text-muted">
              {won ? (
                <span className="font-semibold text-gold">Ziel erreicht</span>
              ) : (
                <>
                  noch <span className="font-semibold text-mint">{formatPoints(remaining)}</span>
                </>
              )}
              <span className="mx-1.5 opacity-50">·</span>Ziel {formatPoints(target)}
            </p>
          </div>
          <div
            className={`text-[2.75rem] leading-none font-bold tabular-nums ${won ? "text-gold" : "text-chalk"}`}
            aria-label={`${total} Punkte`}
          >
            {formatPoints(total)}
          </div>
        </header>

        {/* chalk marks */}
        <div className="min-h-0 flex-1 pt-3 pb-1">
          <Tally marks={marks} onAdd={finished ? undefined : onAdd} />
        </div>

        {/* actions at the player's edge */}
        {finished ? (
          won ? (
            <div className="flex h-14 items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4">
              <IconTrophy className="text-gold" />
              <span className="flex-1 text-lg font-bold text-gold">Gewonnen!</span>
              <button
                type="button"
                onClick={onNewPartie}
                className="press h-11 rounded-xl bg-gold px-4 font-semibold text-black"
              >
                Neue Partie
              </button>
            </div>
          ) : (
            <div className="flex h-14 items-center justify-center rounded-2xl bg-black/20 text-muted">
              Spiel beendet
            </div>
          )
        ) : (
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <button
              type="button"
              onClick={onPoints}
              className="press h-14 rounded-2xl bg-chalk text-lg font-semibold text-tiber-lo active:bg-white"
            >
              Punkte schreiben
            </button>
            <button
              type="button"
              onClick={onMatch}
              className="press flex h-14 items-center gap-2 rounded-2xl border-2 border-gold/70 px-4 font-semibold text-gold active:bg-gold/10"
            >
              <IconStar width={20} height={20} />
              Match
            </button>
          </div>
        )}
      </div>

      {overlay && (
        <div className="absolute inset-0 z-20 bg-bg" style={edgePad}>
          {overlay}
        </div>
      )}
    </section>
  );
}
