/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

// Content-Security-Policy. `script-src`/`style-src` keep `'unsafe-inline'` because
// Next's app-router streams its RSC payload through inline <script> tags that
// can't be hashed stably, and a nonce would need dynamic rendering. The value is
// still in `connect-src 'self'` (an injected script can't phone data home),
// `frame-ancestors 'none'` (no clickjacking), `object-src`/`base-uri`/`form-action`.
//
// In dev only, `next dev` runs modules through `eval()` (webpack HMR) and talks
// to Fast Refresh over a websocket — both need loosening, or the app can't boot
// locally. Production stays strict.
const csp = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // The Overpass hosts are the optional "search OpenStreetMap for a mapped
  // green nearby" convenience in lib/osmGreen.ts — the only external network
  // calls this app makes; everything else stays local-only. Multiple hosts
  // are allowed because they're inconsistently CORS-enabled in practice —
  // lib/osmGreen.ts races all of them in parallel and falls back to "no
  // match" only if every one fails. maps.mail.ru is a separate, independent
  // operator from the other three (same FOSSGIS infra), added so a bad
  // moment for one operator doesn't take out every attempt at once — your
  // live position is sent to whichever of these hosts responds.
  (isDev ? "connect-src 'self' ws:" : "connect-src 'self'") +
    " https://z.overpass-api.de https://lz4.overpass-api.de https://overpass-api.de https://maps.mail.ru",
  "manifest-src 'self'",
  "worker-src 'self'",
  // 'self' for the swing-check camera recording (components/SwingCheck.tsx) played
  // back from a MediaRecorder blob; blob: is the recorded clip itself, never a
  // remote source.
  "media-src 'self' blob:",
  "frame-src 'none'",
  "child-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const permissionsPolicy = [
  "accelerometer=()", "autoplay=()", "camera=(self)", "display-capture=()",
  "encrypted-media=()", "fullscreen=(self)", "geolocation=(self)", "gyroscope=()",
  "magnetometer=()", "microphone=()", "midi=()", "payment=()",
  "picture-in-picture=()", "publickey-credentials-get=()", "screen-wake-lock=()",
  "usb=()", "xr-spatial-tracking=()",
].join(", ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Permissions-Policy", value: permissionsPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: require("./package.json").version,
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // the SW must be revalidated on every load so a fix ships fast
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
    ];
  },
};

module.exports = nextConfig;
