"use client";

import { useState } from "react";
import { DEFAULT_TARGET } from "@/lib/scoring";
import { IconX } from "./Icons";

interface Props {
  onCreate: (teamA: string, teamB: string, target: number) => void;
  onClose: () => void;
}

const TARGETS = [1000, 1500, 2500, 3000];
const field =
  "h-12 w-full rounded-xl border border-line bg-bg px-4 text-base text-chalk placeholder:text-muted/60 focus:border-mint focus:outline-none";

export default function NewGameDialog({ onCreate, onClose }: Props) {
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [target, setTarget] = useState(String(DEFAULT_TARGET));

  const targetNum = Number(target);
  const targetValid = Number.isInteger(targetNum) && targetNum > 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!targetValid) return;
    onCreate(teamA.trim() || "Team A", teamB.trim() || "Team B", targetNum);
  }

  return (
    <div className="anim-fade fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="anim-sheet safe-bottom w-full max-w-md rounded-t-3xl border border-line bg-surface px-5 pt-4 sm:rounded-3xl sm:pb-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-game-title"
      >
        <div className="flex items-center justify-between">
          <h2 id="new-game-title" className="text-xl font-semibold">
            Neues Spiel
          </h2>
          <button type="button" onClick={onClose} className="press -mr-2 grid size-11 place-items-center rounded-full text-muted active:bg-surface-2" aria-label="Schliessen">
            <IconX />
          </button>
        </div>

        <div className="mt-3 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted">Team A <span className="opacity-70">· untere Hälfte</span></span>
            <input className={field} value={teamA} onChange={(e) => setTeamA(e.target.value)} placeholder="Team A" maxLength={30} autoComplete="off" enterKeyHint="next" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted">Team B <span className="opacity-70">· obere Hälfte</span></span>
            <input className={field} value={teamB} onChange={(e) => setTeamB(e.target.value)} placeholder="Team B" maxLength={30} autoComplete="off" enterKeyHint="next" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted">Zielpunktzahl</span>
            <input
              className={`${field} tabular-nums ${targetValid ? "" : "border-danger"}`}
              value={target}
              onChange={(e) => setTarget(e.target.value.replace(/\D/g, "").slice(0, 5))}
              inputMode="numeric"
              pattern="[0-9]*"
              aria-invalid={!targetValid}
              enterKeyHint="done"
            />
          </label>
          <div className="flex gap-2" role="group" aria-label="Schnellauswahl Ziel">
            {TARGETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTarget(String(t))}
                className={`press h-11 flex-1 rounded-xl text-sm font-semibold tabular-nums ${
                  targetNum === t ? "bg-tiber text-mint ring-1 ring-mint/50" : "bg-surface-2 text-chalk/80"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {!targetValid && <p className="text-sm text-danger">Bitte eine Zahl grösser als 0 eingeben.</p>}
        </div>

        <button type="submit" disabled={!targetValid} className="press mt-6 mb-4 h-14 w-full rounded-2xl bg-mint text-lg font-semibold text-tiber-lo disabled:opacity-40">
          Spiel starten
        </button>
      </form>
    </div>
  );
}
