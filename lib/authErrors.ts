/** Supabase auth error messages in German. */
export function translateAuthError(msg: string) {
  if (/invalid login credentials/i.test(msg)) return "E-Mail oder Passwort ist falsch.";
  if (/email not confirmed/i.test(msg)) return "Bitte bestätige zuerst deine E-Mail-Adresse.";
  if (/already (been )?registered/i.test(msg)) return "Für diese E-Mail gibt es bereits ein Konto.";
  if (/password should be at least|password should contain|weak.?password/i.test(msg))
    return "Das Passwort braucht mindestens 8 Zeichen mit Klein- und Grossbuchstaben sowie einer Zahl.";
  if (/should be different/i.test(msg)) return "Das neue Passwort muss sich vom alten unterscheiden.";
  if (/reauthenticat/i.test(msg)) return "Bitte melde dich ab und neu an und versuche es dann nochmal.";
  if (/invalid.*email|email.*invalid/i.test(msg)) return "Ungültige E-Mail-Adresse.";
  if (/manual linking/i.test(msg)) return "Konten verknüpfen ist in Supabase nicht aktiviert (Authentication → Sign In / Providers → Allow manual linking).";
  if (/at least 2 identities|single identity/i.test(msg)) return "Google ist deine einzige Anmeldemethode und kann nicht getrennt werden.";
  if (/identity.*already exists|already linked/i.test(msg)) return "Dieses Google-Konto ist bereits mit einem anderen Konto verbunden.";
  if (/rate limit/i.test(msg)) return "Zu viele Versuche. Bitte warte einen Moment.";
  if (/fetch/i.test(msg)) return "Keine Verbindung. Bitte später erneut versuchen.";
  return msg;
}

/**
 * Where /auth/callback continues after a round trip to Supabase (linking Google from /konto,
 * password reset link). localStorage, because the reset link opens in a new tab; it expires
 * so a forgotten request doesn't hijack a later login.
 */
const AUTH_NEXT_KEY = "jasstafel:v1:auth-next";
const AUTH_NEXT_TTL = 60 * 60 * 1000;

export function setAuthNext(path: string) {
  try {
    localStorage.setItem(AUTH_NEXT_KEY, JSON.stringify({ path, at: Date.now() }));
  } catch {}
}

export function takeAuthNext(fallback: string) {
  try {
    const raw = localStorage.getItem(AUTH_NEXT_KEY);
    localStorage.removeItem(AUTH_NEXT_KEY);
    const { path, at } = JSON.parse(raw ?? "null") ?? {};
    if (typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && Date.now() - at < AUTH_NEXT_TTL) return path;
  } catch {}
  return fallback;
}
