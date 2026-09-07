import type { CSSProperties } from "react";

// The RangeCard mark — the "Wedge": two tapered legs converging on a flag.
// Renders in `currentColor`, so the surrounding element picks the colourway
// (green on dark, ink on green, etc). Two cuts share one geometry — see
// public/logo_kit/README.md. The Small cut keeps the 4u channel between the
// legs open at <=24px, where the Regular cut would fill in.
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
  const small = size <= 24;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={"mark" + (className ? " " + className : "")}
      style={style}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {small ? (
        <>
          <path d="M19 85L37 85L49 44L40.5 44Z" />
          <path d="M81 85L63 85L51 44L59.5 44Z" />
          <circle cx="50" cy="19" r="13.5" />
        </>
      ) : (
        <>
          <path d="M21 86L36 86L48 40L41 40Z" />
          <path d="M79 86L64 86L52 40L59 40Z" />
          <circle cx="50" cy="18" r="12" />
        </>
      )}
    </svg>
  );
}
