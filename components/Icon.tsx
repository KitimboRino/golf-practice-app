import type { CSSProperties } from "react";

// Material Symbols Rounded glyph. `fill` switches to the filled axis (nav + primary CTAs).
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
  return (
    <span
      aria-hidden
      className={"msr" + (fill ? " fill" : "") + (className ? " " + className : "")}
      style={{ fontSize: size, color, ...style }}
    >
      {name}
    </span>
  );
}
