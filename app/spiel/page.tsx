"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Board from "@/components/Board";
import { useStore } from "@/lib/store";

// Query param instead of a dynamic segment, so the page can be cached for offline use
export default function GamePage() {
  return (
    <Suspense fallback={<Loading />}>
      <GameView />
    </Suspense>
  );
}

function GameView() {
  const id = useSearchParams().get("id");
  const { ready, loadingRemote, games } = useStore();
  const game = games.find((g) => g.id === id);

  if (game) return <Board game={game} />;
  if (!ready || loadingRemote) return <Loading />;

  return (
    <main className="safe-top grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-lg font-semibold">Spiel nicht gefunden</p>
        <Link href="/spiele" className="press mt-5 inline-grid h-12 place-items-center rounded-xl bg-mint px-6 font-semibold text-tiber-lo">
          Zum Menü
        </Link>
      </div>
    </main>
  );
}

function Loading() {
  return <main className="board-lock chalkboard" aria-busy="true" />;
}
