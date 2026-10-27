"use client";

import { useState } from "react";
import { IconX } from "./Icons";

interface Props {
  name: string;
  fallback: string;
  onSave: (name: string) => void;
  onClose: () => void;
}

/** Rename a team, shown over its half of the board (so it inherits the rotation). */
export default function RenameTeam({ name, fallback, onSave, onClose }: Props) {
  const [value, setValue] = useState(name);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(value.trim() || fallback);
  }

  return (
    <form onSubmit={submit} className="anim-fade safe-x flex h-full flex-col justify-center gap-4 pt-3" aria-label="Teamname ändern">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Teamname</h2>
        <button type="button" onClick={onClose} className="press -mr-2 grid size-11 place-items-center rounded-full text-muted active:bg-surface" aria-label="Abbrechen">
          <IconX />
        </button>
      </div>
      <input
        className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-chalk placeholder:text-muted/60 focus:border-mint focus:outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={(e) => e.target.select()}
        placeholder={fallback}
        maxLength={30}
        autoComplete="off"
        enterKeyHint="done"
        aria-label="Teamname"
        autoFocus
      />
      <button type="submit" className="press h-14 w-full rounded-2xl bg-mint text-lg font-semibold text-tiber-lo">
        Speichern
      </button>
    </form>
  );
}
