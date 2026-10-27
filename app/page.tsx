import type { Metadata } from "next";
import Link from "next/link";
import { IconCloud, IconGithub, IconList, IconMail, IconPencil, IconPhone, IconStar, IconStrokes, IconWifiOff } from "@/components/Icons";
import Logo from "@/components/Logo";
import { CONTACT_EMAIL, REPO_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import { ENTERED_KEY, LAST_GAME_KEY } from "@/lib/visit";

export const metadata: Metadata = {
  title: { absolute: `${SITE_TITLE} | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const FAQ = [
  {
    q: "Ist die Jasstafel wirklich gratis?",
    a: "Ja, komplett gratis: keine Kosten, keine Werbung, keine In-App-Käufe und kein Abo. YS-Jasstafel ist ein privates Projekt aus der Schweiz.",
  },
  {
    q: "Ist YS-Jasstafel Open Source?",
    a: "Ja. Der gesamte Quellcode ist öffentlich auf GitHub – jeder kann ihn ansehen, verbessern oder selbst betreiben.",
  },
  {
    q: "Brauche ich ein Konto?",
    a: "Nein. Ohne Anmeldung bleiben deine Spiele auf deinem Gerät gespeichert. Ein kostenloses Konto brauchst du nur, wenn du auf mehreren Geräten spielen oder deinen Verlauf in der Cloud sichern willst.",
  },
  {
    q: "Für welche Jass-Variante ist die Tafel?",
    a: "Für den Schieber, wie er in der Schweiz gespielt wird: 157 Punkte pro Runde, Match mit 257 Punkten, frei wählbarer Multiplikator, Weis auf dem Z sowie Striche für Sieg und Bergpreis.",
  },
  {
    q: "Funktioniert die Jasstafel offline und als App?",
    a: "Ja. Du kannst sie auf dem iPhone oder Android-Handy zum Homescreen hinzufügen und sie läuft auch ohne Internet – ideal für die Beiz oder die Berghütte.",
  },
];

// Structured data for search engines: free web app + FAQ
const JSON_LD = JSON.stringify([
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    alternateName: ["Jasstafel", "Gratis Jasstafel", "Schieber Jasstafel"],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "GameApplication",
    operatingSystem: "Web, iOS, Android",
    inLanguage: "de-CH",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "CHF" },
    author: { "@type": "Person", name: "Yannick Salm", url: "https://yannicksalm.ch" },
    countryOfOrigin: { "@type": "Country", name: "Schweiz" },
    codeRepository: REPO_URL,
    image: `${SITE_URL}/og.png`,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  },
]).replace(/</g, "\\u003c");

// Returning visitors skip the landing page and go straight to their last board.
// Runs before the page paints; "/?info" shows the page anyway.
const REDIRECT = `(function(){try{if(location.search.indexOf("info")>-1||!localStorage.getItem(${JSON.stringify(ENTERED_KEY)}))return;var id=localStorage.getItem(${JSON.stringify(LAST_GAME_KEY)});location.replace(id?"/spiel?id="+encodeURIComponent(id):"/spiele")}catch(e){}})()`;

const FEATURES = [
  { icon: IconStar, title: "Punkte & Match", text: "Punkte eintippen, Multiplikator wählen – die Gegenseite erhält den Rest auf 157 automatisch." },
  { icon: IconPencil, title: "Weis direkt aufs Z", text: "Tippe auf die Linie für 100, 50 oder 20. Geschrieben wird wie mit Kreide." },
  { icon: IconStrokes, title: "Striche über Partien", text: "Sieg und Bergpreis werden automatisch gezählt – Revanchen inklusive." },
  { icon: IconPhone, title: "Handy in die Tischmitte", text: "Jedes Team schreibt auf seiner Hälfte, die obere steht auf dem Kopf. Der Bildschirm bleibt an." },
  { icon: IconList, title: "Verlauf", text: "Jede Runde nachvollziehen, korrigieren oder rückgängig machen." },
  { icon: IconWifiOff, title: "Funktioniert offline", text: "Als App auf dem Homescreen installierbar, läuft auch ohne Internet." },
];

export default function Landing() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: REDIRECT }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON_LD }} />
      <main className="safe-top safe-x safe-bottom mx-auto max-w-5xl">
        <header className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xl font-bold tracking-tight">YS-Jasstafel</span>
          </div>
          <div className="flex items-center gap-1">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="press grid size-11 place-items-center rounded-xl text-chalk/80 active:bg-surface" aria-label="Quellcode auf GitHub">
              <IconGithub />
            </a>
            <Link href="/login" className="press grid h-11 place-items-center rounded-xl px-4 text-sm font-semibold text-chalk/80 active:bg-surface">
              Login
            </Link>
          </div>
        </header>

        {/* hero */}
        <section className="grid items-center gap-12 pt-10 pb-16 md:grid-cols-[1.15fr_0.85fr] md:pt-16">
          {/* mobile: centred, buttons edge to edge; desktop: left column */}
          <div className="text-center md:text-left">
            <ul className="flex flex-wrap justify-center gap-2 text-xs font-semibold md:justify-start" aria-label="Eigenschaften">
              <li className="rounded-full bg-tiber px-3 py-1.5 text-mint ring-1 ring-mint/25">100 % gratis</li>
              <li>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-tiber px-3 py-1.5 text-mint ring-1 ring-mint/25 hover:ring-mint/60">
                  <IconGithub width={14} height={14} />
                  Open Source
                </a>
              </li>
              <li className="rounded-full bg-tiber px-3 py-1.5 text-mint ring-1 ring-mint/25">Ohne Anmeldung</li>
              <li className="flex items-center gap-1.5 rounded-full bg-tiber px-3 py-1.5 text-mint ring-1 ring-mint/25">
                <SwissFlag />
                Aus der Schweiz
              </li>
            </ul>
            <h1 className="mt-5 text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">Die Gratis-Jasstafel für den Schieber.</h1>
            <p className="mx-auto mt-4 max-w-prose text-lg leading-relaxed text-chalk/75 md:mx-0">
              Schreib beim Jassen Punkte, Weis und Striche wie auf der Kreidetafel – nur dass niemand mehr nachrechnen muss. Komplett gratis, Open Source und ohne Werbung.
              Handy auf den Tisch, losspielen.
            </p>

            <div className="mx-auto mt-8 w-full max-w-md space-y-3 md:mx-0">
              <Link href="/registrieren" className="press flex h-14 items-center justify-center rounded-2xl bg-mint text-lg font-semibold text-tiber-lo">
                Registrieren
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" className="press flex h-12 items-center justify-center rounded-2xl bg-tiber font-semibold text-chalk ring-1 ring-mint/30 active:bg-tiber-hi">
                  Login
                </Link>
                <Link href="/spiele" className="press flex h-12 items-center justify-center rounded-2xl border border-line px-2 text-[15px] font-semibold whitespace-nowrap text-chalk/90 active:bg-surface">
                  Ohne Account spielen
                </Link>
              </div>
              <p className="pt-1 text-sm text-muted">Kein Konto nötig – deine Spiele bleiben auf diesem Gerät gespeichert.</p>
            </div>
          </div>

          <BoardMockup />
        </section>

        {/* features */}
        <section aria-labelledby="features-title" className="pb-16">
          <h2 id="features-title" className="text-center text-2xl font-bold tracking-tight sm:text-left">
            Was die Jasstafel kann
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl bg-surface p-5 text-center sm:text-left">
                <span className="mx-auto grid size-10 place-items-center rounded-xl bg-tiber text-mint sm:mx-0">
                  <Icon width={20} height={20} />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-chalk/70">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* data */}
        <section aria-labelledby="data-title" className="pb-16">
          <h2 id="data-title" className="text-center text-2xl font-bold tracking-tight md:text-left">
            Deine Spiele bleiben gespeichert
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-surface p-5 text-center md:text-left">
              <div className="flex items-center justify-center gap-3 md:justify-start">
                <IconPhone className="text-mint" />
                <h3 className="font-semibold">Ohne Konto</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-chalk/70">
                Einfach öffnen und spielen. Alle Spiele werden auf deinem Gerät gespeichert und sind auch nach dem Schliessen noch da.
              </p>
            </div>
            <div className="rounded-2xl bg-tiber p-5 text-center ring-1 ring-mint/25 md:text-left">
              <div className="flex items-center justify-center gap-3 md:justify-start">
                <IconCloud className="text-mint" />
                <h3 className="font-semibold">Mit Konto</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-chalk/80">
                Für mehrere Geräte oder wenn dein Verlauf sicher sein soll: Mit einem Konto werden deine Spiele in der Cloud gesichert. Was du vorher ohne Konto
                gespielt hast, wird beim ersten Login übernommen. Du meldest dich nur einmal an.
              </p>
              <Link href="/registrieren" className="press mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-mint px-4 font-semibold text-tiber-lo md:inline-flex md:h-11 md:w-auto md:text-sm">
                Konto erstellen
              </Link>
            </div>
          </div>
        </section>

        {/* feedback */}
        <section aria-labelledby="feedback-title" className="pb-16">
          <div className="rounded-2xl bg-tiber p-6 text-center ring-1 ring-mint/25 md:flex md:items-center md:gap-6 md:text-left">
            <span className="mx-auto grid size-12 shrink-0 place-items-center rounded-xl bg-bg/40 text-mint md:mx-0">
              <IconMail />
            </span>
            <div className="mt-4 md:mt-0 md:flex-1">
              <h2 id="feedback-title" className="text-xl font-bold tracking-tight">
                Ideen oder Fehler gefunden?
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-chalk/80">
                Verbesserungsvorschläge sind sehr willkommen – schreib einfach eine Mail an{" "}
                <span className="font-semibold text-chalk">{CONTACT_EMAIL}</span>.
              </p>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("YS-Jasstafel: Verbesserungsvorschlag")}`}
              className="press mt-5 flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-mint px-5 font-semibold text-tiber-lo md:mt-0 md:w-auto"
            >
              <IconMail width={18} height={18} />
              Vorschlag senden
            </a>
          </div>
        </section>

        {/* FAQ – same content as the FAQPage structured data */}
        <section aria-labelledby="faq-title" className="pb-16">
          <h2 id="faq-title" className="text-center text-2xl font-bold tracking-tight md:text-left">
            Häufige Fragen
          </h2>
          <div className="mt-6 space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group rounded-2xl bg-surface">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <span aria-hidden className="text-xl leading-none text-mint transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-chalk/75">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* mobile: stacked and centred; desktop: credit left, source right, disclaimer below */}
        <footer className="border-t border-line pt-6 pb-8 text-center text-sm md:text-left">
          <div className="flex flex-col items-center md:flex-row md:justify-between">
            <p className="flex h-11 items-center text-muted">
              Gebaut von&nbsp;
              <a href="https://yannicksalm.ch" target="_blank" rel="noopener noreferrer" className="font-semibold text-chalk/80 underline-offset-4 hover:underline">
                Yannick Salm
              </a>
            </p>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center gap-2 font-semibold text-chalk/80 underline-offset-4 hover:underline">
              <IconGithub width={18} height={18} />
              Quellcode auf GitHub
            </a>
          </div>
          <p className="mt-4 text-xs text-muted/80">
            YS-Jasstafel ist kostenlos und Open Source. Keine Werbung, kein Tracking.
            <span className="mt-2 block md:mt-0 md:ml-2 md:inline">
              <Link href="/impressum" className="underline-offset-4 hover:underline">
                Impressum
              </Link>
              {" · "}
              <Link href="/datenschutz" className="underline-offset-4 hover:underline">
                Datenschutz
              </Link>
            </span>
          </p>
        </footer>
      </main>
    </>
  );
}

function SwissFlag() {
  return (
    <svg viewBox="0 0 32 32" width={14} height={14} aria-hidden="true">
      <rect width="32" height="32" rx="4" fill="#DA291C" />
      <path d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" fill="#fff" />
    </svg>
  );
}

/** Stylised phone showing the split board: bottom team upright, top team upside down. */
function BoardMockup() {
  const half = (name: string, points: string, hundreds: number, fifties: number, twenties: number) => (
    <>
      <text x={24} y={30} fill="var(--color-chalk)" fontSize={13} fontWeight={600}>
        {name}
      </text>
      <text x={176} y={36} textAnchor="end" fill="var(--color-chalk)" fontSize={26} fontWeight={700}>
        {points}
      </text>
      <g stroke="var(--color-chalk)" strokeLinecap="round">
        <g strokeOpacity={0.25} strokeWidth={1.5}>
          <line x1={28} y1={62} x2={172} y2={62} />
          <line x1={172} y1={62} x2={28} y2={176} />
          <line x1={28} y1={176} x2={172} y2={176} />
        </g>
        <g strokeWidth={2.5}>
          {tally(hundreds, 34, 62)}
          {Array.from({ length: fifties }, (_, i) => {
            const cx = 40 + Math.floor(i / 2) * 16;
            return i % 2 === 0 ? <line key={`f${i}`} x1={cx - 5} y1={114} x2={cx + 5} y2={124} /> : <line key={`f${i}`} x1={cx - 5} y1={124} x2={cx + 5} y2={114} />;
          })}
          {tally(twenties, 34, 176)}
        </g>
      </g>
    </>
  );

  return (
    <div className="mx-auto w-full max-w-[260px]" aria-hidden="true">
      <svg viewBox="0 0 220 440" className="w-full drop-shadow-2xl">
        <rect x={1} y={1} width={218} height={438} rx={34} fill="#161616" stroke="var(--color-line)" strokeWidth={2} />
        <rect x={10} y={10} width={200} height={420} rx={26} fill="var(--color-tiber)" />
        <g transform="translate(10 10)">
          <g transform="rotate(180 100 102)">{half("Ihr", "1'046", 9, 3, 2)}</g>
          <line x1={0} y1={210} x2={200} y2={210} stroke="var(--color-chalk)" strokeOpacity={0.15} />
          <rect x={14} y={202} width={16} height={16} rx={8} fill="var(--color-bg)" />
          <rect x={170} y={202} width={16} height={16} rx={8} fill="var(--color-bg)" />
          <g transform="translate(0 214)">{half("Wir", "1'582", 13, 5, 3)}</g>
        </g>
      </svg>
    </div>
  );
}

/** Tally strokes on a line: groups of five, the fifth crossing the four. */
function tally(count: number, x0: number, y: number) {
  return Array.from({ length: count }, (_, i) => {
    const g = Math.floor(i / 5);
    const k = i % 5;
    const x = x0 + g * 34 + k * 6;
    return k < 4 ? (
      <line key={`${y}-${i}`} x1={x} y1={y - 7} x2={x} y2={y + 7} />
    ) : (
      <line key={`${y}-${i}`} x1={x - 30} y1={y + 5} x2={x - 2} y2={y - 5} />
    );
  });
}
