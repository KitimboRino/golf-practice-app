import { Manrope, Archivo } from "next/font/google";
import localFont from "next/font/local";

// Body / UI face. Unchanged — Manrope survives the restyle and holds CLS at 0
// with its size-adjusted fallback metrics.
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

// Display face — headlines, hero numbers, card titles.
// Archivo is a variable font with a width axis; pushing wdth to ~118% gives the
// squarish extended bold of the reference (Square721 BdEx, which is licensed).
// Requesting the `wdth` axis means the weight axis stays variable too, so any
// font-weight 400-800 works without shipping extra files.
// NOTE the variable renamed from --font-fraunces to --font-display-face.
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-display-face",
});

// Material Symbols Rounded (variable: opsz, wght, FILL, GRAD). Self-hosted so the
// installed PWA renders its icons on first paint and fully offline.
export const materialSymbols = localFont({
  src: "./fonts/material-symbols-rounded.woff2",
  display: "block",
  variable: "--font-icon",
});
