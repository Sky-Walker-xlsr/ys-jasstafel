import type { Metadata } from "next";
import Link from "next/link";
import { IconCloud, IconGithub, IconList, IconPencil, IconPhone, IconStar, IconStrokes, IconWifiOff } from "@/components/Icons";
import Logo from "@/components/Logo";
import { ENTERED_KEY, LAST_GAME_KEY } from "@/lib/visit";

const REPO_URL = "https://github.com/Sky-Walker-xlsr/ys-jasstafel";

export const metadata: Metadata = {
  title: "YS-Jasstafel – Punkte schreiben beim Schieber",
  description: "YS-Jasstafel: die kostenlose Open-Source-Jasstafel für den Schieber. Ohne Anmeldung, funktioniert offline.",
};

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
          <div>
            <ul className="flex flex-wrap gap-2 text-xs font-semibold" aria-label="Eigenschaften">
              <li className="rounded-full bg-tiber px-3 py-1.5 text-mint ring-1 ring-mint/25">Kostenlos</li>
              <li>
                <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-tiber px-3 py-1.5 text-mint ring-1 ring-mint/25 hover:ring-mint/60">
                  <IconGithub width={14} height={14} />
                  Open Source
                </a>
              </li>
              <li className="rounded-full bg-tiber px-3 py-1.5 text-mint ring-1 ring-mint/25">Ohne Anmeldung</li>
            </ul>
            <h1 className="mt-5 text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl">Die Jasstafel für den Schieber.</h1>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-chalk/75">
              Schreib Punkte, Weis und Striche wie auf der Kreidetafel – nur dass niemand mehr nachrechnen muss. Handy auf den Tisch, losspielen.
            </p>

            <div className="mt-8 max-w-md space-y-3">
              <Link href="/spiele" className="press flex h-14 items-center justify-center rounded-2xl bg-mint text-lg font-semibold text-tiber-lo">
                Ohne Account spielen
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/registrieren" className="press flex h-12 items-center justify-center rounded-2xl bg-tiber font-semibold text-chalk ring-1 ring-mint/30 active:bg-tiber-hi">
                  Registrieren
                </Link>
                <Link href="/login" className="press flex h-12 items-center justify-center rounded-2xl border border-line font-semibold text-chalk/90 active:bg-surface">
                  Login
                </Link>
              </div>
              <p className="pt-1 text-sm text-muted">Kein Konto nötig – deine Spiele bleiben auf diesem Gerät gespeichert.</p>
            </div>
          </div>

          <BoardMockup />
        </section>

        {/* features */}
        <section aria-labelledby="features-title" className="pb-16">
          <h2 id="features-title" className="text-2xl font-bold tracking-tight">
            Was YS-Jasstafel kann
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl bg-surface p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-tiber text-mint">
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
          <h2 id="data-title" className="text-2xl font-bold tracking-tight">
            Deine Spiele bleiben gespeichert
          </h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-surface p-5">
              <div className="flex items-center gap-3">
                <IconPhone className="text-mint" />
                <h3 className="font-semibold">Ohne Konto</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-chalk/70">
                Einfach öffnen und spielen. Alle Spiele werden auf deinem Gerät gespeichert und sind auch nach dem Schliessen noch da.
              </p>
            </div>
            <div className="rounded-2xl bg-tiber p-5 ring-1 ring-mint/25">
              <div className="flex items-center gap-3">
                <IconCloud className="text-mint" />
                <h3 className="font-semibold">Mit Konto</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-chalk/80">
                Für mehrere Geräte oder wenn dein Verlauf sicher sein soll: Mit einem Konto werden deine Spiele in der Cloud gesichert. Was du vorher ohne Konto
                gespielt hast, wird beim ersten Login übernommen. Du meldest dich nur einmal an.
              </p>
              <Link href="/registrieren" className="press mt-4 inline-flex h-11 items-center rounded-xl bg-mint px-4 text-sm font-semibold text-tiber-lo">
                Konto erstellen
              </Link>
            </div>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-4 border-t border-line py-10 text-center">
          <p className="max-w-md text-sm text-muted">YS-Jasstafel ist kostenlos und Open Source. Keine Werbung, kein Tracking.</p>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center gap-2 text-sm font-semibold text-chalk/80 underline-offset-4 hover:underline">
            <IconGithub width={18} height={18} />
            Quellcode auf GitHub
          </a>
          <Link href="/spiele" className="press flex h-12 items-center rounded-2xl bg-mint px-6 font-semibold text-tiber-lo">
            Jetzt spielen
          </Link>
        </footer>
      </main>
    </>
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
