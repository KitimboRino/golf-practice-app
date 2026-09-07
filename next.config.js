/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: false, // registered manually in components/RegisterSW.tsx (app-router safe)
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

// Content-Security-Policy. `script-src`/`style-src` keep `'unsafe-inline'` because
// Next's app-router streams its RSC payload through inline <script> tags that
// can't be hashed stably, and a nonce would need dynamic rendering (which breaks
// the service-worker precache — cached HTML would carry a stale nonce). The value
// is still in `connect-src 'self'` (an injected script can't phone data home),
// `frame-ancestors 'none'` (no clickjacking), `object-src`/`base-uri`/`form-action`.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "media-src 'none'",
  "frame-src 'none'",
  "child-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const permissionsPolicy = [
  "accelerometer=()", "autoplay=()", "camera=()", "display-capture=()",
  "encrypted-media=()", "fullscreen=(self)", "geolocation=()", "gyroscope=()",
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
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = withPWA(nextConfig);
