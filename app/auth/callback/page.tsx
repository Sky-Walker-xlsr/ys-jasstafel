"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

// OAuth / e-mail confirmation return URL. supabase-js exchanges the ?code= itself
// (detectSessionInUrl + PKCE); the store picks up the session via onAuthStateChange.
export default function AuthCallback() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return router.replace("/spiele");
    const oauthError = new URLSearchParams(window.location.search).get("error");

    sb.auth.getSession().then(({ data }) => {
      if (data.session && !oauthError) router.replace("/spiele");
      else setFailed(true);
    });
  }, [router]);

  return (
    <main className="safe-top grid min-h-dvh place-items-center px-6 text-center">
      {failed ? (
        <div>
          <p className="text-lg font-semibold">Anmeldung fehlgeschlagen</p>
          <Link href="/login" className="press mt-5 inline-grid h-12 place-items-center rounded-xl bg-mint px-6 font-semibold text-tiber-lo">
            Erneut versuchen
          </Link>
        </div>
      ) : (
        <p className="text-muted" aria-busy="true">
          Anmeldung …
        </p>
      )}
    </main>
  );
}
