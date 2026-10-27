import Link from "next/link";
import type { ReactNode } from "react";
import { CONTACT_EMAIL } from "@/lib/site";
import { IconBack } from "./Icons";

/** Plain text page for Impressum / Datenschutz. */
export default function LegalPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <main className="safe-top safe-x safe-bottom mx-auto max-w-2xl pb-12">
      <header className="flex items-center gap-2 pt-3">
        <Link href="/?info" className="press -ml-2 grid size-11 place-items-center rounded-full text-muted active:bg-surface" aria-label="Zur Startseite">
          <IconBack />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </header>
      <div className="mt-6 space-y-8 leading-relaxed text-chalk/85 [&_a]:font-semibold [&_a]:text-mint [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-chalk [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:mt-2 [&_ul]:space-y-1">
        {children}
      </div>
      {updated && <p className="mt-10 text-sm text-muted">Stand: {updated}</p>}
    </main>
  );
}

export function Mail() {
  return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}
