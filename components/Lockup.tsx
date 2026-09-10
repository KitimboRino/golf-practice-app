import type { CSSProperties } from "react";

// Mark + wordmark, horizontal. The mark is the organic fairway contour from
// components/Mark.tsx; the wordmark is live text in the app's display serif
// (Fraunces — see the `.lockup text` rule in globals.css), matching the brand
// lockup in /brand/rangecard_refined_vector_logo. The whole thing
// inherits `currentColor`.
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
      viewBox="0 0 250 60"
      height={height}
      width={height * (250 / 60)}
      className={"lockup" + (className ? " " + className : "")}
      style={style}
      role="img"
      aria-label="RangeCard"
      fill="currentColor"
    >
      <g transform="translate(4 3) scale(0.26)">
        <path d="M42 20C22 20 6 36 6 56L6 130C6 172 40 206 82 206C124 206 174 192 188 152C198 124 182 96 156 94C132 92 108 84 94 66C82 50 68 20 42 20Z" />
        <circle cx="168" cy="46" r="28" />
      </g>
      <text x="66" y="44" fontWeight="700" fontSize="34" letterSpacing="-1">
        RangeCard
      </text>
    </svg>
  );
}
