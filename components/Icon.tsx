import type { CSSProperties } from "react";
import { GLYPHS } from "./icons";

// RangeCard's own icon set (components/icons.tsx), drawn to match Archivo's
// stroke weight. `fill` switches to the selected/active variant where one
// exists. Any name not drawn there falls back to the Material Symbols font,
// so an icon is never blank.
//
// The SVG sits inside the same span.msr the font glyph used, so every
// existing colour / size rule, and the nav pill's ripple (a ::after on that
// span, which an <svg> itself can't carry), keeps working unchanged.
export function Icon({
  name, size = 20, fill = false, color, className, style,
}: {
  name: string;
  size?: number;
  fill?: boolean;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const g = GLYPHS[name];
  const cls = "msr" + (fill ? " fill" : "") + (className ? " " + className : "");
  if (g) {
    return (
      <span aria-hidden className={cls + " ico"} style={{ width: size, height: size, fontSize: size, color, ...style }}>
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
             strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" focusable="false">
          {fill && g.fill ? g.fill : g.d}
        </svg>
      </span>
    );
  }
  return (
    <span aria-hidden className={cls} style={{ fontSize: size, color, ...style }}>
      {name}
    </span>
  );
}
