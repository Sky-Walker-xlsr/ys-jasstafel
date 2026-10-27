"use client";

import { useState } from "react";
import { computeRound, isValidMultiplier, isValidPoints, MATCH_POINTS, ROUND_POINTS } from "@/lib/scoring";
import type { RoundInput, Side } from "@/lib/types";
import { formatPoints } from "@/lib/format";
import { IconBack, IconBackspace, IconCheck, IconX } from "./Icons";

type Step = "points" | "multiplier";

interface Props {
  side: Side;
  isMatch: boolean;
  teamA: string;
  teamB: string;
  /** Prefill when editing an existing round */
  initial?: { input: number; multiplier: number };
  title?: string;
  onSubmit: (input: RoundInput) => void;
  onClose: () => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"] as const;

export default function ScoreInput({ side, isMatch, teamA, teamB, initial, title, onSubmit, onClose }: Props) {
  const [step, setStep] = useState<Step>(isMatch ? "multiplier" : "points");
  const [points, setPoints] = useState(initial && !isMatch ? String(initial.input) : "");
  const [mult, setMult] = useState(initial ? String(initial.multiplier) : "");

  const value = step === "points" ? points : mult;
  const setValue = step === "points" ? setPoints : setMult;
  const n = value === "" ? NaN : Number(value);
  const valid = step === "points" ? isValidPoints(n) : isValidMultiplier(n);
  const error =
    value === "" ? null : step === "points" && n > ROUND_POINTS ? `Maximal ${ROUND_POINTS}` : !valid ? "Mindestens 1" : null;

  const own = side === "a" ? teamA : teamB;
  const other = side === "a" ? teamB : teamA;
  const input = isMatch ? MATCH_POINTS : Number(points);
  const m = step === "multiplier" && valid ? n : 1;
  const preview = step === "points" && !valid ? null : computeRound({ side, input, isMatch, multiplier: m });

  function press(key: (typeof KEYS)[number]) {
    if (key === "del") return setValue((v) => v.slice(0, -1));
    if (key === "ok") {
      if (!valid) return;
      if (step === "points") return setStep("multiplier");
      return onSubmit({ side, isMatch, input, multiplier: n });
    }
    setValue((v) => (v === "0" ? key : (v + key).slice(0, 3)));
  }

  const heading = title ?? (isMatch ? `Match für ${own}` : `Punkte ${own}`);
  const canGoBack = step === "multiplier" && !isMatch;

  return (
    <div
      className="anim-sheet flex h-full flex-col bg-bg px-3 pt-2 pb-3"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
    >
      {/* header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={canGoBack ? () => setStep("points") : onClose}
          className="press grid size-11 shrink-0 place-items-center rounded-full text-muted active:bg-surface"
          aria-label={canGoBack ? "Zurück zu den Punkten" : "Abbrechen"}
        >
          {canGoBack ? <IconBack /> : <IconX />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{heading}</div>
          <div className="text-xs text-muted">
            {step === "points" ? "Schritt 1/2 · Punkte (0–157)" : isMatch ? "Multiplikator" : "Schritt 2/2 · Multiplikator"}
          </div>
        </div>
      </div>

      {/* display */}
      <div className="mt-1 flex items-end justify-between gap-3 px-1">
        <div className="flex items-baseline gap-2">
          {step === "multiplier" && (
            <span className="text-2xl font-semibold text-muted">
              {isMatch ? "Match" : points} ×
            </span>
          )}
          <span
            className={`text-5xl leading-none font-bold tabular-nums ${error ? "text-danger" : value ? "text-chalk" : "text-muted/40"}`}
            aria-live="polite"
          >
            {value || (step === "points" ? "0" : "n")}
          </span>
        </div>
        <div className="pb-1 text-right text-xs leading-5 text-muted">
          {error ? (
            <span className="font-semibold text-danger">{error}</span>
          ) : preview ? (
            <>
              <div className="truncate">
                {own} <span className="font-semibold text-mint">+{formatPoints(side === "a" ? preview.pointsA : preview.pointsB)}</span>
              </div>
              <div className="truncate">
                {other} <span className="font-semibold text-chalk">+{formatPoints(side === "a" ? preview.pointsB : preview.pointsA)}</span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* numpad */}
      <div className="mt-2 grid min-h-0 flex-1 grid-cols-3 grid-rows-4 gap-2">
        {KEYS.map((k) => {
          const isOk = k === "ok";
          return (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              disabled={isOk && !valid}
              className={`press flex min-h-11 items-center justify-center rounded-xl text-2xl font-semibold tabular-nums ${
                isOk
                  ? "bg-mint text-tiber-lo disabled:bg-surface disabled:text-muted/50"
                  : k === "del"
                    ? "bg-surface text-muted active:bg-surface-2"
                    : "bg-surface text-chalk active:bg-surface-2"
              }`}
              aria-label={k === "del" ? "Löschen" : isOk ? (step === "points" ? "Weiter" : "Runde schreiben") : k}
            >
              {k === "del" ? (
                <IconBackspace />
              ) : isOk ? (
                step === "points" ? (
                  <span className="text-lg">Weiter</span>
                ) : (
                  <IconCheck width={28} height={28} strokeWidth={2.5} />
                )
              ) : (
                k
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
