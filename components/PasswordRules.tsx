import { PASSWORD_RULES } from "@/lib/password";
import { IconCheck } from "./Icons";

/** Live checklist under a new-password field. */
export default function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs" aria-label="Passwort-Anforderungen">
      {PASSWORD_RULES.map(({ label, test }) => {
        const ok = test(password);
        return (
          <li key={label} className={`flex items-center gap-1.5 ${ok ? "text-mint" : "text-muted"}`}>
            {ok ? <IconCheck width={14} height={14} className="shrink-0" /> : <span className="mx-[5px] size-1 shrink-0 rounded-full bg-current" aria-hidden />}
            {label}
            <span className="sr-only">{ok ? "erfüllt" : "fehlt"}</span>
          </li>
        );
      })}
    </ul>
  );
}
