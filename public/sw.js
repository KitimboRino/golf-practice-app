/* RangeCard service worker — hand-written, replaces next-pwa.
 *
 * Deliberately minimal and fail-safe:
 *  - navigations: network-first with a short timeout, so a stale cached page can
 *    never point the browser at a build chunk that has since 404'd (this was the
 *    cause of "loading endlessly" on the splash);
 *  - /_next/static/ (immutable, content-hashed): cache-first;
 *  - other same-origin GETs (icons, manifest, fonts): stale-while-revalidate;
 *  - on activate: delete every cache this version doesn't own, which clears a
 *    wedged next-pwa/workbox install for anyone upgrading to this SW.
 *
 * Bump VERSION to force a clean cache wipe on the next deploy.
 */
const VERSION = "rc-v3";
const NAV_CACHE = VERSION + "-nav";
const ASSET_CACHE = VERSION + "-assets";
const KEEP = [NAV_CACHE, ASSET_CACHE];
const NET_TIMEOUT = 4000;

// Photo-header images (handoff Phase 2) — precached on install so they show
// offline even on a first/only-ever visit, rather than waiting on the generic
// same-origin handler below to have cached them from a prior successful GET.
// Any entry that 404s or fails to fetch is skipped individually (allSettled,
// not addAll) so one bad URL can't break the whole install.
const PHOTOS = [
  "/range-bays.webp",
  "/ball-tee.webp",
  "/course-sunset.webp",
  "/aerial-green.webp",
  "/bunker-splash.webp",
  "/iron-balls.webp",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);
      await Promise.allSettled(PHOTOS.map((p) => cache.add(p)));
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // ---- navigations: network-first ----------------------------------------
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await withTimeout(fetch(request), NET_TIMEOUT);
          const cache = await caches.open(NAV_CACHE);
          cache.put(request, res.clone());
          return res;
        } catch {
          const cache = await caches.open(NAV_CACHE);
          return (
            (await cache.match(request)) ||
            (await cache.match("/")) ||
            new Response(
              "<!doctype html><meta charset=utf-8><title>Offline</title>" +
                "<body style='font:16px system-ui;padding:2rem'>" +
                "<p>You're offline. Reconnect and reload.</p>",
              { headers: { "Content-Type": "text/html; charset=utf-8" } },
            )
          );
        }
      })(),
    );
    return;
  }

  // ---- immutable build assets: cache-first -------------------------------
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })(),
    );
    return;
  }

  // ---- other same-origin GETs: stale-while-revalidate ------------------
  event.respondWith(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);
      const hit = await cache.match(request);
      const fetching = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || fetching;
    })(),
  );
});
