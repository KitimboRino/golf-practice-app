import type { CSSProperties } from "react";

// Mark + wordmark, horizontal — the geometry of public/logo_kit/lockup/
// lockup-horizontal-*.svg (viewBox 260x60: Regular cut at translate(4 6)
// scale(0.44), wordmark from x72, baseline y40). The whole thing inherits
// `currentColor`; the wordmark is real text in the app's Manrope (see the
// `.lockup text` rule in globals.css).
export function Lockup({
  height = 24,
  className,
  style,
}: {
  height?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 260 60"
      height={height}
      width={height * (260 / 60)}
      className={"lockup" + (className ? " " + className : "")}
      style={style}
      role="img"
      aria-label="RangeCard"
      fill="currentColor"
    >
      <g transform="translate(4 6) scale(0.44)">
        <path d="M21 86L36 86L48 40L41 40Z" />
        <path d="M79 86L64 86L52 40L59 40Z" />
        <circle cx="50" cy="18" r="12" />
      </g>
      <text x="72" y="40" fontWeight="800" fontSize="30" letterSpacing="-1.05">
        RangeCard
      </text>
    </svg>
  );
}
