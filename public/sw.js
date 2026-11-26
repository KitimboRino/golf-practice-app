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
const VERSION = "rc-v6";
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
  "/range-bag.webp",
  "/course-sunset.webp",
  "/aerial-green.webp",
  "/iron-balls.webp",
];

// Self-hosted MoveNet SinglePose Lightning (components/SwingCheck.tsx /
// lib/swingPose.ts) — precached so swing check still works with no
// connection after the first load, same reasoning as the photos above.
const SWING_MODEL = [
  "/models/movenet-lightning/model.json",
  "/models/movenet-lightning/group1-shard1of2.bin",
  "/models/movenet-lightning/group1-shard2of2.bin",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);
      await Promise.allSettled([...PHOTOS, ...SWING_MODEL].map((p) => cache.add(p)));
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

// Content-hashed build chunks from old deploys are never requested again, but
// would otherwise sit in ASSET_CACHE until VERSION is bumped. Keep the most
// recent MAX_STATIC of them (cache keys come back in insertion order, so the
// oldest are first) — comfortably more than one build's worth.
const MAX_STATIC = 150;
async function trimStatic(cache) {
  const keys = (await cache.keys()).filter((r) => new URL(r.url).pathname.startsWith("/_next/static/"));
  const excess = keys.length - MAX_STATIC;
  if (excess > 0) await Promise.all(keys.slice(0, excess).map((r) => cache.delete(r)));
}

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
          // only a good page becomes the offline fallback — caching a 500 or
          // 404 here would serve that error page every time we're offline
          if (res.ok) {
            const cache = await caches.open(NAV_CACHE);
            cache.put(request, res.clone());
          }
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
        if (res.ok) {
          await cache.put(request, res.clone());
          event.waitUntil(trimStatic(cache));
        }
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
