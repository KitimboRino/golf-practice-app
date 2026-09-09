import type { CSSProperties } from "react";

// Small line marks for arrival / completion moments only — a session filed, a
// round finished, a routine rehearsed. A quieter voice than the Material Symbols
// UI set: open strokes rather than filled glyphs, so they read as punctuation,
// not affordances. Render in `currentColor`.
//
// Not for use on working screens.

type GlyphName = "flag" | "check" | "rise";

const PATHS: Record<GlyphName, JSX.Element> = {
  // a pin with a pennant
  flag: (
    <>
      <path d="M7.5 3.5V20.5" />
      <path d="M7.5 4.7 16.8 7.2 7.5 9.7Z" />
    </>
  ),
  // a clean tick
  check: <path d="M4 12.8 9.6 18 20 5.5" />,
  // a line finding its way up
  rise: (
    <>
      <path d="M4 16.4C8 15.4 9.6 9.6 13 8.1 15.6 7 18 4.9 20.5 3.3" />
      <path d="M15.6 3.7 20.8 3.1 20.3 8.3" />
    </>
  ),
};

export function Glyph({
  name, size = 26, className, style,
}: {
  name: GlyphName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={"glyph" + (className ? " " + className : "")}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
