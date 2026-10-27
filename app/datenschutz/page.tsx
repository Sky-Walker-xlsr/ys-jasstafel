import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Mail } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Datenschutzerklärung", alternates: { canonical: "/datenschutz" } };

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung" updated="27. Oktober 2026">
      <section>
        <h2>Kurz gesagt</h2>
        <ul>
          <li>Ohne Konto bleiben deine Spiele ausschliesslich auf deinem Gerät.</li>
          <li>Mit Konto speichern wir nur, was für die Anmeldung und deine Spiele nötig ist.</li>
          <li>Keine Werbung, kein Tracking, keine Analyse-Tools, keine Cookies zu Werbezwecken.</li>
          <li>Du kannst dein Konto und alle Daten jederzeit selbst löschen.</li>
        </ul>
      </section>

      <section>
        <h2>Verantwortlicher</h2>
        <p>
          Yannick Salm, Schweiz – <Mail />
        </p>
      </section>

      <section>
        <h2>Nutzung ohne Konto</h2>
        <p>
          Spiele, Runden und Striche werden nur im Speicher deines Browsers (localStorage) auf deinem Gerät abgelegt und nicht an uns übermittelt. Du löschst sie, indem
          du die Spiele in der App löschst oder die Website-Daten in deinem Browser entfernst.
        </p>
      </section>

      <section>
        <h2>Nutzung mit Konto</h2>
        <p>Wenn du ein Konto erstellst, bearbeiten wir:</p>
        <ul>
          <li>deine E-Mail-Adresse und dein Passwort (nur verschlüsselt als Hash gespeichert),</li>
          <li>bei Anmeldung mit Google: die von Google übermittelte E-Mail-Adresse, deinen Namen und die Google-Kennung,</li>
          <li>deine Spiele (Teamnamen, Punkte, Runden, Striche) samt Zeitstempeln.</li>
        </ul>
        <p>
          Zweck ist allein, dich anzumelden und deine Spiele geräteübergreifend zu speichern. Die Anmeldung bleibt im Speicher deines Browsers erhalten, bis du dich
          abmeldest. E-Mails (Bestätigung, Passwort zurücksetzen, E-Mail-Änderung) werden nur zu diesen Zwecken verschickt.
        </p>
      </section>

      <section>
        <h2>Dienstleister</h2>
        <ul>
          <li>
            <strong>Supabase</strong> (Supabase, Inc., USA) – Datenbank, Anmeldung und Versand der Konto-E-Mails.
          </li>
          <li>
            <strong>Cloudflare</strong> (Cloudflare, Inc., USA) – Auslieferung der Website. Dabei fallen technisch notwendige Verbindungsdaten wie IP-Adresse, Zeitpunkt
            und Browser-Typ an.
          </li>
          <li>
            <strong>Google</strong> (Google LLC, USA) – nur wenn du dich mit Google anmeldest.
          </li>
        </ul>
        <p>
          Dabei können Daten in die USA übermittelt werden. Die Anbieter verpflichten sich vertraglich zu einem angemessenen Datenschutz (z. B. Standardvertragsklauseln).
          Schriftarten werden von unserem eigenen Server geladen, nicht von Google.
        </p>
      </section>

      <section>
        <h2>Speicherdauer und Löschung</h2>
        <p>
          Deine Daten bleiben gespeichert, bis du sie löschst. Unter <Link href="/konto">Konto</Link> kannst du jederzeit dein Konto samt allen in der Cloud gespeicherten
          Spielen endgültig löschen.
        </p>
      </section>

      <section>
        <h2>Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung und Herausgabe deiner Daten. Schreib dafür an <Mail />. Du kannst dich zudem beim Eidgenössischen
          Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) beschweren.
        </p>
      </section>
    </LegalPage>
  );
}
