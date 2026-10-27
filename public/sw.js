// Jasstafel service worker – offline support without a build plugin.
// - Pages: network first, cache fallback (query ignored, so /spiel?id=… works offline)
// - /_next/static, icons: cache first (file names are content-hashed)
// - Supabase and other origins: untouched
const VERSION = "v2";
const PAGES = `jasstafel-pages-${VERSION}`;
const ASSETS = `jasstafel-assets-${VERSION}`;
const SHELL = ["/", "/spiele", "/spiel", "/login", "/registrieren", "/manifest.webmanifest", "/icon.svg"];

async function precache() {
  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  await Promise.all(
    SHELL.map(async (url) => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        await pages.put(url, res.clone());
        if (!(res.headers.get("content-type") || "").includes("text/html")) return;
        // Also cache the JS/CSS each page needs, so it can boot offline
        const html = await res.text();
        const urls = [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)].map((m) => m[1]);
        await Promise.all([...new Set(urls)].map((u) => assets.add(u).catch(() => {})));
      } catch {
        // offline during install
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES, ASSETS]);
      for (const key of await caches.keys()) if (!keep.has(key)) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGES);
        try {
          const res = await fetch(req);
          if (res.ok) cache.put(url.pathname, res.clone());
          return res;
        } catch {
          return (
            (await cache.match(url.pathname, { ignoreSearch: true })) ||
            (await cache.match("/spiele")) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  const immutable =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/icon.svg";
  if (immutable) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSETS);
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })(),
    );
    return;
  }

  // RSC payloads, manifest etc.: network, cache fallback
  event.respondWith(
    (async () => {
      try {
        return await fetch(req);
      } catch {
        const cache = await caches.open(PAGES);
        return (await cache.match(url.pathname, { ignoreSearch: true })) || Response.error();
      }
    })(),
  );
});
