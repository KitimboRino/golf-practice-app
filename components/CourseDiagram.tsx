// A small top-down green diagram for the two pin-strategy rules — same
// zero-asset inline-SVG idiom as the Fixes ball-flight sketches and the Round
// fairway sketch. Two variants sharing one geometry:
//  - "safe"   Aim for the centre of the green: flag centred, a generous
//             margin around it, the shot going straight there.
//  - "sucker" Avoid 'sucker' pins: the tempting tucked pin sits right next
//             to a hazard with almost no margin; the shot instead goes to
//             the safer centre target.
const GREEN = "M50 12 C72 12 88 28 88 50 C88 74 70 90 48 90 C26 90 12 72 14 48 C16 26 30 12 50 12 Z";

export function CourseDiagram({ variant, size = 80 }: { variant: "safe" | "sucker"; size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="crs-diagram" aria-hidden>
      <path d={GREEN} className="crs-green" />
      {variant === "safe" ? (
        <>
          <circle cx="50" cy="46" r="24" className="crs-margin" />
          <line x1="50" y1="88" x2="50" y2="52" className="crs-shot" />
          <circle cx="50" cy="88" r="3.5" className="crs-ball" />
          <g transform="translate(50 46)" className="crs-pin">
            <line x1="0" y1="0" x2="0" y2="-16" />
            <path d="M0 -16 L11 -12 L0 -8 Z" fill="currentColor" stroke="none" />
          </g>
        </>
      ) : (
        <>
          <ellipse cx="68" cy="66" rx="14" ry="9" className="crs-hazard" />
          <circle cx="68" cy="52" r="10" className="crs-margin danger" />
          <g transform="translate(68 52)" className="crs-pin danger">
            <line x1="0" y1="0" x2="0" y2="-14" />
            <path d="M0 -14 L9 -11 L0 -7 Z" fill="currentColor" stroke="none" />
          </g>
          <line x1="50" y1="88" x2="46" y2="50" className="crs-shot" />
          <circle cx="50" cy="88" r="3.5" className="crs-ball" />
          <g transform="translate(45 46)" className="crs-pin safe">
            <line x1="0" y1="0" x2="0" y2="-14" />
            <path d="M0 -14 L9 -11 L0 -7 Z" fill="currentColor" stroke="none" />
          </g>
        </>
      )}
    </svg>
  );
}

// Which rule (by its exact `rule` string in lib/course.ts) gets which variant.
export const COURSE_DIAGRAM: Record<string, "safe" | "sucker"> = {
  "Aim for the centre of the green": "safe",
  "Avoid 'sucker' pins": "sucker",
};
