// Password policy. Mirrors the Supabase setting (Authentication → Providers → Email:
// minimum length 8, "Lowercase, uppercase letters and digits"), which is what is enforced.

export const PASSWORD_RULES = [
  { label: "Mindestens 8 Zeichen", test: (p: string) => p.length >= 8 },
  { label: "Kleinbuchstabe", test: (p: string) => /[a-z]/.test(p) },
  { label: "Grossbuchstabe", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Zahl", test: (p: string) => /\d/.test(p) },
] as const;

export function isValidPassword(p: string) {
  return PASSWORD_RULES.every((r) => r.test(p));
}
