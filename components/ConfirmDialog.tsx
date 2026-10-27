"use client";

import type { ReactNode } from "react";

interface Props {
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, children, confirmLabel, danger, onConfirm, onCancel }: Props) {
  return (
    <div className="anim-fade fixed inset-0 z-50 grid place-items-center bg-black/60 p-6" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="anim-sheet w-full max-w-sm rounded-2xl border border-line bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        {children && <div className="mt-2 text-sm text-muted">{children}</div>}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="press h-12 rounded-xl bg-surface-2 font-semibold"
            autoFocus
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`press h-12 rounded-xl font-semibold ${danger ? "bg-danger text-black" : "bg-mint text-tiber-lo"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
