"use client";

import { useEffect, useState } from "react";
import type { Marks } from "@/lib/scoring";

// Square Jasstafel "Z": top line = 100er, bottom line = 20er, 50er as X halves
// in a horizontal row through the middle (one 50er = one stroke, X = 100).
// Everything starts at the left.
const W = 200;
const X0 = 16;
const X1 = W - 16;
const TOP = 16;
const BOT = TOP + (X1 - X0); // square
const MARK = 20; // stroke length
const ROW = MARK + 8; // distance between stroke rows
const U = (X1 - X0 - 12) / (4 * 6 - 3); // stroke spacing: four groups of five fit on a line
const PER_ROW = 20;
const HIT = 22; // tap zone reaches this far inside the Z from each line

type Zone = 100 | 50 | 20;
type Vec = [number, number];

/** start point, direction along the line, stroke direction, overflow row direction */
const LINES: Record<100 | 20, { p0: Vec; d: Vec; n: Vec; out: Vec; offset: number }> = {
  100: { p0: [X0, TOP], d: [1, 0], n: [0, 1], out: [0, -1], offset: 6 },
  20: { p0: [X0, BOT], d: [1, 0], n: [0, 1], out: [0, 1], offset: 6 },
};

/** Tally strokes along a line: groups of five, the fifth crossing the other four. */
function strokes(count: number, zone: 100 | 20) {
  const { p0, d, n, out, offset } = LINES[zone];
  const at = (along: number, across: number, row: number): Vec => [
    p0[0] + d[0] * along + n[0] * across + out[0] * row * ROW,
    p0[1] + d[1] * along + n[1] * across + out[1] * row * ROW,
  ];
  const h = MARK / 2;
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / PER_ROW);
    const j = i % PER_ROW;
    const k = j % 5;
    const g = offset + Math.floor(j / 5) * 6 * U;
    const [a, b] = k < 4 ? [at(g + k * U, -h, row), at(g + k * U, h, row)] : [at(g - 0.8 * U, h - 3, row), at(g + 3.8 * U, -h + 3, row)];
    return <line key={`${zone}-${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
  });
}

const CROSS = 7; // half size of an X
const CROSS_PITCH = 20;
const MID = (TOP + BOT) / 2;

const CROSS_PER_ROW = Math.floor((X1 - X0 - 6 - CROSS * 2) / CROSS_PITCH) + 1;

/**
 * 50er: each one is one stroke of an X ("\" then "/"), X after X from the left,
 * in a row through the middle that simply runs across the diagonal to the right edge.
 * Only a full row continues in a new row above.
 */
function crosses(count: number) {
  const out: React.ReactElement[] = [];
  let i = 0;
  for (let row = 0; i < count; row++) {
    const cy = MID - row * (CROSS * 2 + 10);
    for (let c = 0; c < CROSS_PER_ROW && i < count; c++) {
      const cx = X0 + 6 + CROSS + c * CROSS_PITCH;
      for (let half = 0; half < 2 && i < count; half++, i++) {
        out.push(
          half === 0 ? (
            <line key={`f${i}`} x1={cx - CROSS} y1={cy - CROSS} x2={cx + CROSS} y2={cy + CROSS} />
          ) : (
            <line key={`f${i}`} x1={cx - CROSS} y1={cy + CROSS} x2={cx + CROSS} y2={cy - CROSS} />
          ),
        );
      }
    }
  }
  return out;
}

const rows = (n: number) => Math.max(1, Math.ceil(n / PER_ROW));

interface Props {
  marks: Marks;
  /** Tap on a line adds its value; omit to make the Z read-only */
  onAdd?: (value: Zone) => void;
}

export default function Tally({ marks, onAdd }: Props) {
  const { hundreds, fifties, twenties, rest } = marks;
  const [flash, setFlash] = useState<{ zone: Zone; id: number } | null>(null);
  const [hover, setHover] = useState<Zone | null>(null);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [flash]);

  const minY = TOP - MARK / 2 - 4 - (rows(hundreds) - 1) * ROW;
  const maxY = BOT + MARK / 2 + 4 + (rows(twenties) - 1) * ROW;

  function add(zone: Zone) {
    if (!onAdd) return;
    onAdd(zone);
    navigator.vibrate?.(10);
    setFlash((f) => ({ zone, id: (f?.id ?? 0) + 1 })); // new key restarts the animation
  }

  const zoneProps = (zone: Zone) =>
    onAdd && {
      role: "button",
      tabIndex: 0,
      "aria-label": `${zone} dazuzählen`,
      onClick: () => add(zone),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          add(zone);
        }
      },
      // highlight only for a real mouse, touch would leave it stuck
      onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && setHover(zone),
      onPointerLeave: () => setHover(null),
      onFocus: () => setHover(zone),
      onBlur: () => setHover(null),
      className: "cursor-pointer outline-none",
    };

  const lineStyle = (zone: Zone) => ({
    strokeOpacity: flash?.zone === zone ? 0.8 : hover === zone && onAdd ? 0.55 : 0.22,
    strokeWidth: hover === zone && onAdd ? 3 : 2,
  });

  // where the "+100" feedback appears: inside the empty triangles of the Z
  const flashPos: Record<Zone, [number, number, "start" | "end"]> = {
    100: [X0 + 4, TOP + 34, "start"],
    50: [X0 + 4, MID + CROSS + 22, "start"], // below the X row, left of the diagonal
    20: [X1 - 4, BOT - 32, "end"],
  };

  return (
    <svg
      viewBox={`0 ${minY} ${W} ${maxY - minY}`}
      className="h-full w-full"
      role="group"
      aria-label={`${hundreds} Hunderter, ${fifties} Fünfziger, ${twenties} Zwanziger, Rest ${rest}`}
    >
      {/* the Z, drawn per line so a hovered/tapped line can light up */}
      <g stroke="var(--color-chalk)" strokeLinecap="round" style={{ transition: "stroke-opacity 150ms, stroke-width 150ms" }}>
        <line x1={X0} y1={TOP} x2={X1} y2={TOP} {...lineStyle(100)} />
        <line x1={X1} y1={TOP} x2={X0} y2={BOT} {...lineStyle(50)} />
        <line x1={X0} y1={BOT} x2={X1} y2={BOT} {...lineStyle(20)} />
      </g>

      {/* strokes */}
      <g stroke="var(--color-chalk)" strokeWidth={3} strokeLinecap="round" pointerEvents="none">
        {strokes(hundreds, 100)}
        {crosses(fifties)}
        {strokes(twenties, 20)}
      </g>

      {rest > 0 && (
        <text x={X1} y={BOT - 12} textAnchor="end" fill="var(--color-muted)" fontSize={13} fontWeight={600} pointerEvents="none">
          +{rest}
        </text>
      )}

      {/* tap zones: diagonal first, so the lines win at the corners */}
      {onAdd && (
        <g fill="transparent" stroke="transparent">
          <line x1={X1} y1={TOP} x2={X0} y2={BOT} strokeWidth={HIT * 2} pointerEvents="stroke" {...zoneProps(50)} />
          <rect x={0} y={minY} width={W} height={TOP + HIT - minY} pointerEvents="all" {...zoneProps(100)} />
          <rect x={0} y={BOT - HIT} width={W} height={maxY - BOT + HIT} pointerEvents="all" {...zoneProps(20)} />
        </g>
      )}

      {flash && (
        <text
          key={flash.id}
          x={flashPos[flash.zone][0]}
          y={flashPos[flash.zone][1]}
          textAnchor={flashPos[flash.zone][2]}
          fill="var(--color-mint)"
          fontSize={18}
          fontWeight={700}
          pointerEvents="none"
          className="anim-pop"
        >
          +{flash.zone}
        </text>
      )}
    </svg>
  );
}
