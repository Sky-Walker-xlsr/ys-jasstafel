"use client";

import Link from "next/link";
import { useState } from "react";
import { IconBack } from "@/components/Icons";
import Logo from "@/components/Logo";
import { setAuthNext, translateAuthError } from "@/lib/authErrors";
import { getSupabase } from "@/lib/supabase";

const field =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-chalk placeholder:text-muted/60 focus:border-mint focus:outline-none";

/** Request a password reset link (sent by Supabase). The link leads via /auth/callback to /passwort-neu. */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    const to = email.trim();
    if (!sb || !to) return;
    setBusy(true);
    setError(null);
    setAuthNext("/passwort-neu");
    const { error } = await sb.auth.resetPasswordForEmail(to, { redirectTo: `${window.location.origin}/auth/callback` });
    setBusy(false);
    if (error) return setError(translateAuthError(error.message));
    setSent(to);
  }

  return (
    <main className="safe-top safe-x safe-bottom mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between pt-3">
        <Link href="/login" className="press -ml-2 grid size-11 place-items-center rounded-full text-muted active:bg-surface" aria-label="Zurück zum Login">
          <IconBack />
        </Link>
        <Logo size={32} />
      </header>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Passwort vergessen</h1>
      <p className="mt-2 text-muted">Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues Passwort festlegen kannst.</p>

      {sent ? (
        <div className="mt-8 space-y-4">
          <p role="status" className="rounded-xl bg-tiber p-4 text-sm leading-relaxed text-mint">
            Falls es ein Konto für {sent} gibt, ist der Link unterwegs. Öffne ihn auf diesem Gerät und in diesem Browser. Schau auch im Spam-Ordner nach.
          </p>
          <Link href="/login" className="press flex h-14 items-center justify-center rounded-2xl bg-mint text-lg font-semibold text-tiber-lo">
            Zurück zum Login
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-muted">E-Mail</span>
            <input className={field} type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="press h-14 w-full rounded-2xl bg-mint text-lg font-semibold text-tiber-lo disabled:opacity-50">
            {busy ? "Bitte warten …" : "Link senden"}
          </button>
        </form>
      )}
    </main>
  );
}
