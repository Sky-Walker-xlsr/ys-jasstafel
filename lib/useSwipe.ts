"use client";

import { useRef } from "react";

const MIN_DISTANCE = 80; // px
const MAX_SLOPE = 0.6; // |dy| / |dx|

/** Touch handlers for a large horizontal swipe. `disabled` ignores swipes (e.g. while a dialog is open). */
export function useSwipe({ onLeft, onRight, disabled }: { onLeft?: () => void; onRight?: () => void; disabled?: boolean }) {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      start.current = e.touches.length === 1 && !disabled ? { x: t.clientX, y: t.clientY } : null;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const s = start.current;
      start.current = null;
      if (!s || disabled) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x;
      const dy = t.clientY - s.y;
      if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dy) > Math.abs(dx) * MAX_SLOPE) return;
      if (dx < 0) onLeft?.();
      else onRight?.();
    },
  };
}
