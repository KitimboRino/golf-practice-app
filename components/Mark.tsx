import type { CSSProperties } from "react";

// The RangeCard mark — an organic fairway/green contour with a golf-ball accent.
// Renders monochrome in `currentColor`, so the surrounding element picks the
// colourway (green on dark, ink on green, parchment on green, …). The full-colour
// treatments (app icon, favicon, splash, OG) live in /public as generated assets;
// the source SVGs are in /brand.
export function Mark({
  size = 24,
  className,
  style,
  title,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
}) {
  return (
    <svg
      viewBox="-4 7 210 210"
      width={size}
      height={size}
      className={"mark" + (className ? " " + className : "")}
      style={style}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d="M42 20C22 20 6 36 6 56L6 130C6 172 40 206 82 206C124 206 174 192 188 152C198 124 182 96 156 94C132 92 108 84 94 66C82 50 68 20 42 20Z" />
      <circle cx="168" cy="46" r="28" />
    </svg>
  );
}
