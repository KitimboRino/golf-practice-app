import { Manrope } from "next/font/google";
import localFont from "next/font/local";

// Body / display face. Self-hosted at build time by next/font — no render-blocking
// @import, no third-party DNS, size-adjusted fallback metrics to hold CLS at 0.
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

// Material Symbols Rounded (variable: opsz, wght, FILL, GRAD). Self-hosted so the
// installed PWA renders its icons on first paint and fully offline.
export const materialSymbols = localFont({
  src: "./fonts/material-symbols-rounded.woff2",
  display: "block",
  variable: "--font-icon",
});
