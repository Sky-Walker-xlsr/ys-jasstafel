"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { translateAuthError as translate } from "@/lib/authErrors";
import { isValidPassword } from "@/lib/password";
import { useStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import { IconBack, IconGoogle } from "./Icons";
import Logo from "./Logo";
import PasswordRules from "./PasswordRules";

type Mode = "signin" | "signup";

const field =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-chalk placeholder:text-muted/60 focus:border-mint focus:outline-none";

const TEXT: Record<Mode, { title: string; lead: string; submit: string }> = {
  signin: {
    title: "Anmelden",
    lead: "Willkommen zurück. Du bleibst auf diesem Gerät angemeldet.",
    submit: "Anmelden",
  },
  signup: {
    title: "Konto erstellen",
    lead: "Deine Spiele werden gesichert und sind auf all deinen Geräten verfügbar.",
    submit: "Registrieren",
  },
};

/** Login and registration (e-mail/password or Google). The session is persisted, so this is needed only once per device. */
export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { user, ready, cloud } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const t = TEXT[mode];

  useEffect(() => {
    if (user) router.replace("/spiele");
  }, [user, router]);

  const callbackUrl = () => `${window.location.origin}/auth/callback`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    if (mode === "signup" && !isValidPassword(password)) return setError("Das Passwort erfüllt noch nicht alle Anforderungen.");
    setBusy(true);
    setError(null);
    setInfo(null);
    const { data, error } =
      mode === "signin"
        ? await sb.auth.signInWithPassword({ email, password })
        : await sb.auth.signUp({ email, password, options: { emailRedirectTo: callbackUrl() } });
    setBusy(false);
    if (error) return setError(translate(error.message));
    if (mode === "signup" && !data.session) setInfo("Fast geschafft: Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.");
  }

  async function google() {
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl() } });
    if (error) {
      setBusy(false);
      setError(translate(error.message));
    }
  }

  return (
    <main className="safe-top safe-x safe-bottom mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between pt-3">
        <Link href="/?info" className="press -ml-2 grid size-11 place-items-center rounded-full text-muted active:bg-surface" aria-label="Zurück">
          <IconBack />
        </Link>
        <Logo size={32} />
      </header>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">{t.title}</h1>
      <p className="mt-2 text-muted">{t.lead}</p>

      {ready && !cloud ? (
        <p className="mt-8 rounded-xl bg-surface p-4 text-sm text-muted">Login ist nicht konfiguriert (Supabase-Umgebungsvariablen fehlen).</p>
      ) : (
        <>
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="press mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-chalk font-semibold text-[#1f1f1f] disabled:opacity-50"
          >
            <IconGoogle />
            Mit Google {mode === "signin" ? "anmelden" : "registrieren"}
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            oder mit E-Mail
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">E-Mail</span>
              <input className={field} type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-muted">Passwort</span>
              <input
                className={field}
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
              />
              {mode === "signup" && <PasswordRules password={password} />}
            </label>
            {mode === "signin" && (
              <div className="-mt-2 flex justify-end">
                <Link href="/passwort-vergessen" className="flex h-11 items-center text-sm font-semibold text-mint">
                  Passwort vergessen?
                </Link>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            )}
            {info && (
              <p role="status" className="rounded-xl bg-tiber p-3 text-sm text-mint">
                {info}
              </p>
            )}

            <button type="submit" disabled={busy} className="press h-14 w-full rounded-2xl bg-mint text-lg font-semibold text-tiber-lo disabled:opacity-50">
              {busy ? "Bitte warten …" : t.submit}
            </button>
            {mode === "signup" && (
              <p className="text-center text-xs text-muted">
                Mit der Registrierung gilt die{" "}
                <Link href="/datenschutz" className="font-semibold text-chalk/80 underline underline-offset-4">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            )}
          </form>

          <Link href={mode === "signin" ? "/registrieren" : "/login"} replace className="mt-4 flex h-11 items-center justify-center text-sm text-muted">
            {mode === "signin" ? (
              <>
                Noch kein Konto?&nbsp;<span className="font-semibold text-mint">Registrieren</span>
              </>
            ) : (
              <>
                Schon ein Konto?&nbsp;<span className="font-semibold text-mint">Anmelden</span>
              </>
            )}
          </Link>

          <p className="mt-auto pt-8 pb-4 text-center text-xs text-muted">
            Spiele, die du ohne Konto erfasst hast, werden beim ersten Login übernommen.{" "}
            <Link href="/spiele" className="font-semibold text-chalk/80 underline underline-offset-4">
              Ohne Account spielen
            </Link>
          </p>
        </>
      )}
    </main>
  );
}
