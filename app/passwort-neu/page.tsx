"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/Logo";
import PasswordRules from "@/components/PasswordRules";
import { translateAuthError } from "@/lib/authErrors";
import { isValidPassword } from "@/lib/password";
import { useStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";

const field =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-chalk placeholder:text-muted/60 focus:border-mint focus:outline-none";

/** Target of the password reset link: the user is signed in by the link and sets a new password. */
export default function NewPasswordPage() {
  const router = useRouter();
  const { authReady, user } = useStore();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    if (!isValidPassword(password)) return setError("Das Passwort erfüllt noch nicht alle Anforderungen.");
    if (password !== repeat) return setError("Die Passwörter stimmen nicht überein.");
    setBusy(true);
    setError(null);
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(translateAuthError(error.message));
    router.replace("/spiele");
  }

  return (
    <main className="safe-top safe-x safe-bottom mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-end pt-3">
        <span className="grid h-11 place-items-center">
          <Logo size={32} />
        </span>
      </header>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">Neues Passwort</h1>

      {!authReady ? (
        <div className="mt-8 h-40 animate-pulse rounded-2xl bg-surface" aria-busy="true" />
      ) : !user ? (
        <div className="mt-4 space-y-4">
          <p className="text-muted">Der Link ist abgelaufen oder wurde in einem anderen Browser geöffnet. Fordere einfach einen neuen an.</p>
          <Link href="/passwort-vergessen" className="press flex h-14 items-center justify-center rounded-2xl bg-mint text-lg font-semibold text-tiber-lo">
            Neuen Link anfordern
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-muted">Lege ein neues Passwort für {user.email} fest.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">Neues Passwort</span>
              <input className={field} type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              <PasswordRules password={password} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">Passwort wiederholen</span>
              <input className={field} type="password" autoComplete="new-password" required value={repeat} onChange={(e) => setRepeat(e.target.value)} />
            </label>
            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            <button type="submit" disabled={busy} className="press h-14 w-full rounded-2xl bg-mint text-lg font-semibold text-tiber-lo disabled:opacity-50">
              {busy ? "Bitte warten …" : "Passwort speichern"}
            </button>
          </form>
        </>
      )}
    </main>
  );
}
