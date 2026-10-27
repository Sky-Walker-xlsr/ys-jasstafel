import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Mail } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <section>
        <h2>Verantwortlich</h2>
        <p>
          Yannick Salm
          <br />
          Schweiz
        </p>
        <p>
          E-Mail: <Mail />
          <br />
          Web: <a href="https://yannicksalm.ch">yannicksalm.ch</a>
        </p>
      </section>

      <section>
        <h2>Angebot</h2>
        <p>
          YS-Jasstafel ist ein kostenloses, privates Open-Source-Projekt ohne kommerzielle Absichten. Der Quellcode ist auf{" "}
          <a href="https://github.com/Sky-Walker-xlsr/ys-jasstafel">GitHub</a> öffentlich.
        </p>
      </section>

      <section>
        <h2>Haftung</h2>
        <p>
          Die App wird so zur Verfügung gestellt, wie sie ist. Für die Richtigkeit der Berechnungen, die Verfügbarkeit des Dienstes und den Erhalt gespeicherter Spiele
          wird keine Gewähr übernommen. Für Inhalte verlinkter externer Seiten sind ausschliesslich deren Betreiber verantwortlich.
        </p>
      </section>

      <section>
        <h2>Datenschutz</h2>
        <p>
          Siehe <Link href="/datenschutz">Datenschutzerklärung</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
