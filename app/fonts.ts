import { Manrope, Fraunces } from "next/font/google";
import localFont from "next/font/local";

// Body / UI face. Self-hosted at build time by next/font — no render-blocking
// @import, no third-party DNS, size-adjusted fallback metrics to hold CLS at 0.
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

// Display face — editorial headlines only (see app/globals.css `--font-display`).
// Fraunces is an old-style serif with a warm, soft character; used at 400–500 for
// presence, not weight. Self-hosted alongside Manrope. Falls back to Georgia,
// itself a screen-first editorial serif on every OS.
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-fraunces",
});

// Material Symbols Rounded (variable: opsz, wght, FILL, GRAD). Self-hosted so the
// installed PWA renders its icons on first paint and fully offline.
export const materialSymbols = localFont({
  src: "./fonts/material-symbols-rounded.woff2",
  display: "block",
  variable: "--font-icon",
});
