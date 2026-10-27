"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserIdentity } from "@supabase/supabase-js";
import ConfirmDialog from "@/components/ConfirmDialog";
import PasswordRules from "@/components/PasswordRules";
import { IconBack, IconCloud, IconGoogle, IconUser } from "@/components/Icons";
import { setAuthNext, translateAuthError } from "@/lib/authErrors";
import { isValidPassword } from "@/lib/password";
import { deleteAccount, signOut, useStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";

const field =
  "h-12 w-full rounded-xl border border-line bg-bg px-4 text-base text-chalk placeholder:text-muted/60 focus:border-mint focus:outline-none";

type Status = { ok?: string; err?: string } | null;

export default function AccountPage() {
  const { ready, cloud, user } = useStore();

  return (
    <main className="safe-top safe-x safe-bottom mx-auto flex min-h-dvh max-w-xl flex-col pb-8">
      <header className="flex items-center gap-2 pt-3">
        <Link href="/spiele" className="press -ml-2 grid size-11 place-items-center rounded-full text-muted active:bg-surface" aria-label="Zurück zu den Spielen">
          <IconBack />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Konto</h1>
      </header>

      {!ready ? (
        <div className="mt-6 h-32 animate-pulse rounded-2xl bg-surface" aria-busy="true" />
      ) : !cloud ? (
        <p className="mt-6 rounded-2xl bg-surface p-5 text-sm text-muted">Konten sind nicht konfiguriert (Supabase-Umgebungsvariablen fehlen).</p>
      ) : user ? (
        <SignedIn email={user.email} />
      ) : (
        <SignedOut />
      )}
    </main>
  );
}

function SignedOut() {
  return (
    <section className="mt-6 rounded-2xl bg-surface p-5 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-tiber text-mint">
        <IconUser />
      </span>
      <h2 className="mt-4 text-lg font-semibold">Du bist nicht angemeldet</h2>
      <p className="mt-2 text-sm leading-relaxed text-chalk/70">
        Deine Spiele werden nur auf diesem Gerät gespeichert. Mit einem Konto sind sie in der Cloud gesichert und auf all deinen Geräten verfügbar – bisherige Spiele
        werden übernommen.
      </p>
      <div className="mt-5 space-y-3">
        <Link href="/registrieren" className="press flex h-14 items-center justify-center rounded-2xl bg-mint text-lg font-semibold text-tiber-lo">
          Registrieren
        </Link>
        <Link href="/login" className="press flex h-12 items-center justify-center rounded-2xl bg-tiber font-semibold text-chalk ring-1 ring-mint/30 active:bg-tiber-hi">
          Anmelden
        </Link>
      </div>
    </section>
  );
}

function SignedIn({ email }: { email: string | null }) {
  const router = useRouter();
  const { pending } = useStore();
  const [identities, setIdentities] = useState<UserIdentity[] | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [confirm, setConfirm] = useState<"unlink" | "delete" | null>(null);
  const [googleStatus, setGoogleStatus] = useState<Status>(null);
  const [deleteStatus, setDeleteStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  // identities (email / google) and a pending e-mail change are only on the full user object
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    let alive = true;
    sb.auth.getUser().then(({ data }) => {
      if (!alive) return;
      setIdentities(data.user?.identities ?? []);
      setPendingEmail(data.user?.new_email ?? null);
    });
    return () => {
      alive = false;
    };
  }, [email, reload]);

  const google = identities?.find((i) => i.provider === "google");
  const hasPassword = identities?.some((i) => i.provider === "email") ?? false;
  const canUnlink = (identities?.length ?? 0) > 1;

  async function linkGoogle() {
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setAuthNext("/konto");
    const { error } = await sb.auth.linkIdentity({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) {
      setBusy(false);
      setGoogleStatus({ err: translateAuthError(error.message) });
    }
  }

  async function unlinkGoogle() {
    const sb = getSupabase();
    if (!sb || !google) return;
    setConfirm(null);
    setBusy(true);
    const { error } = await sb.auth.unlinkIdentity(google);
    setBusy(false);
    if (error) return setGoogleStatus({ err: translateAuthError(error.message) });
    setGoogleStatus({ ok: "Google wurde getrennt." });
    setReload((n) => n + 1);
  }

  async function remove() {
    setConfirm(null);
    setBusy(true);
    const err = await deleteAccount();
    setBusy(false);
    if (err) return setDeleteStatus({ err: translateAuthError(err) });
    router.replace("/spiele");
  }

  return (
    <div className="mt-6 space-y-4">
      {/* overview */}
      <section className="rounded-2xl bg-tiber p-5 ring-1 ring-mint/25" aria-label="Übersicht">
        <div className="flex items-center gap-3">
          <IconCloud className="shrink-0 text-mint" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{email}</div>
            <div className="text-xs text-chalk/70">
              {pending > 0 ? `${pending} Änderung${pending === 1 ? "" : "en"} noch nicht synchronisiert` : "Spiele werden in der Cloud gespeichert"}
            </div>
          </div>
        </div>
        {identities && (
          <ul className="mt-4 flex flex-wrap gap-2 text-xs font-semibold" aria-label="Anmeldemethoden">
            {hasPassword && <li className="rounded-full bg-bg/40 px-3 py-1.5 text-chalk/80">E-Mail & Passwort</li>}
            {google && <li className="rounded-full bg-bg/40 px-3 py-1.5 text-chalk/80">Google</li>}
          </ul>
        )}
      </section>

      <EmailForm current={email} pendingEmail={pendingEmail} />
      <PasswordForm hasPassword={hasPassword} />

      {/* google */}
      <Card title="Google">
        {!identities ? (
          <div className="h-12 animate-pulse rounded-xl bg-surface-2" />
        ) : google ? (
          <>
            <p className="text-sm text-chalk/70">
              Verbunden{google.identity_data?.email ? ` als ${google.identity_data.email}` : ""}.
              {!canUnlink && " Google ist deine einzige Anmeldemethode und kann deshalb nicht getrennt werden."}
            </p>
            {canUnlink && (
              <button type="button" onClick={() => setConfirm("unlink")} disabled={busy} className="press mt-4 h-12 w-full rounded-xl bg-surface-2 font-semibold disabled:opacity-50">
                Google trennen
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-chalk/70">Verbinde dein Google-Konto, um dich auch damit anzumelden.</p>
            <button
              type="button"
              onClick={linkGoogle}
              disabled={busy}
              className="press mt-4 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-chalk font-semibold text-[#1f1f1f] disabled:opacity-50"
            >
              <IconGoogle />
              Google verbinden
            </button>
          </>
        )}
        <StatusText status={googleStatus} />
      </Card>

      <button type="button" onClick={() => void signOut()} className="press h-12 w-full rounded-2xl bg-surface font-semibold">
        Abmelden
      </button>

      {/* danger zone */}
      <Card title="Konto löschen" danger>
        <p className="text-sm text-chalk/70">
          Dein Konto und alle in der Cloud gespeicherten Spiele werden endgültig gelöscht. Auf diesem Gerät bleiben die Spiele ohne Konto erhalten.
        </p>
        <button type="button" onClick={() => setConfirm("delete")} disabled={busy} className="press mt-4 h-12 w-full rounded-xl bg-danger/15 font-semibold text-danger disabled:opacity-50">
          Konto löschen
        </button>
        <StatusText status={deleteStatus} />
      </Card>

      {confirm === "unlink" && (
        <ConfirmDialog title="Google trennen?" confirmLabel="Trennen" danger onCancel={() => setConfirm(null)} onConfirm={unlinkGoogle}>
          Du kannst dich danach nur noch mit E-Mail und Passwort anmelden.
        </ConfirmDialog>
      )}
      {confirm === "delete" && (
        <ConfirmDialog title="Konto endgültig löschen?" confirmLabel="Löschen" danger onCancel={() => setConfirm(null)} onConfirm={remove}>
          {email} und alle Spiele in der Cloud werden gelöscht. Das kann nicht rückgängig gemacht werden.
        </ConfirmDialog>
      )}
    </div>
  );
}

function EmailForm({ current, pendingEmail }: { current: string | null; pendingEmail: string | null }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    const next = value.trim();
    if (!sb || !next) return;
    if (next.toLowerCase() === current?.toLowerCase()) return setStatus({ err: "Das ist bereits deine E-Mail-Adresse." });
    setBusy(true);
    const { error } = await sb.auth.updateUser({ email: next }, { emailRedirectTo: `${window.location.origin}/auth/callback` });
    setBusy(false);
    if (error) return setStatus({ err: translateAuthError(error.message) });
    setValue("");
    setStatus({ ok: `Bestätige die Änderung über den Link, den wir an ${next} geschickt haben.` });
  }

  return (
    <Card title="E-Mail ändern">
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-muted">Neue E-Mail-Adresse</span>
          <input className={field} type="email" autoComplete="email" inputMode="email" required value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        {pendingEmail && !status && <p className="text-sm text-muted">Änderung zu {pendingEmail} wartet auf Bestätigung.</p>}
        <button type="submit" disabled={busy || !value.trim()} className="press h-12 w-full rounded-xl bg-mint font-semibold text-tiber-lo disabled:opacity-40">
          {busy ? "Bitte warten …" : "E-Mail ändern"}
        </button>
        <StatusText status={status} />
      </form>
    </Card>
  );
}

function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const title = hasPassword ? "Passwort ändern" : "Passwort festlegen";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    if (!isValidPassword(password)) return setStatus({ err: "Das Passwort erfüllt noch nicht alle Anforderungen." });
    if (password !== repeat) return setStatus({ err: "Die Passwörter stimmen nicht überein." });
    setBusy(true);
    const { error } = await sb.auth.updateUser({ password });
    setBusy(false);
    if (error) return setStatus({ err: translateAuthError(error.message) });
    setPassword("");
    setRepeat("");
    setStatus({ ok: hasPassword ? "Passwort geändert." : "Passwort festgelegt – du kannst dich jetzt auch mit E-Mail und Passwort anmelden." });
  }

  return (
    <Card title={title}>
      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-muted">Neues Passwort</span>
          <input className={field} type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <PasswordRules password={password} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-muted">Passwort wiederholen</span>
          <input className={field} type="password" autoComplete="new-password" required value={repeat} onChange={(e) => setRepeat(e.target.value)} />
        </label>
        <button type="submit" disabled={busy || !password || !repeat} className="press h-12 w-full rounded-xl bg-mint font-semibold text-tiber-lo disabled:opacity-40">
          {busy ? "Bitte warten …" : title}
        </button>
        <StatusText status={status} />
      </form>
    </Card>
  );
}

function Card({ title, danger, children }: { title: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl bg-surface p-5 ${danger ? "ring-1 ring-danger/30" : ""}`} aria-label={title}>
      <h2 className={`mb-3 font-semibold ${danger ? "text-danger" : ""}`}>{title}</h2>
      {children}
    </section>
  );
}

function StatusText({ status }: { status: Status }) {
  if (!status) return null;
  return status.err ? (
    <p role="alert" className="mt-3 text-sm text-danger">
      {status.err}
    </p>
  ) : (
    <p role="status" className="mt-3 rounded-xl bg-tiber p-3 text-sm text-mint">
      {status.ok}
    </p>
  );
}
