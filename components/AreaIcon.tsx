import type { CSSProperties } from "react";
import { AreaKey } from "@/lib/db";

// Golf-specific silhouettes for the five practice areas — driving, irons,
// chipping, pitching, putting. These are the single most-repeated icon in the
// app (every session card, drill-library group, game row), and until now they
// were generic Material Symbols reused so loosely two areas shared one glyph
// (irons and the Round tab both used "golf_course"; chipping used "swipe_up",
// a gesture icon with no golf meaning at all). One colour via `currentColor`,
// sized and used like <Icon>. Distinct from components/Glyph.tsx, which is
// reserved for arrival/completion moments, not working-screen badges.
export function AreaIcon({
  area, size = 20, color, className, style,
}: {
  area: AreaKey;
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    // carries the `msr` class too so it drops into every existing icon-tile
    // context (.block-name .msr, .icon-tile .msr, .more-ic .msr, …) without
    // each one needing its own rule — those are layout/box rules (size,
    // centering, tile background) that apply just as well to an <svg>.
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={"msr area-icon" + (className ? " " + className : "")}
      style={{ color, ...style }}
      aria-hidden
    >
      {PATHS[area]}
    </svg>
  );
}

// Outline strokes, not solid fills — matching the weight Material Symbols
// renders at everywhere else in the app (that font is a monoline outline by
// default; only nav/CTA icons switch to its FILL axis for an active state).
// Three cuts got here: v1 used thin dashed strokes that vanished below ~2px;
// v2 went bold/solid, which read clearly but sat oddly next to the outline
// Material glyphs around it; v3 (ball-on-tee, ball+bent-line, three near-flat
// arcs, a broken three-circle "putting") was closer but two of the five
// didn't read as anything in particular at real size — irons' club was an
// abstract bend, and putting was an unlabelled chain of circles, confirmed by
// rendering the set standalone and comparing against how it was actually
// showing up in the app. This cut keeps the family's shared grammar (ground
// line, ~1.8/24 stroke, round caps, a small outline ball) but gives each
// area an unambiguous, distinct read: driving is a tee (unique silhouette,
// no motion needed); irons is a proper iron blade addressing the ball, not a
// bare line; chipping/pitching are differentiated by arc height alone (a low
// hop vs. a full lofted flight — the same distinction golfers use); putting
// is the one shot that doesn't fly, so it's the only one with a dashed roll
// path into an actual hole + flag, rather than another airborne arc.
const GROUND = <line x1="3" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />;

const PATHS: Record<AreaKey, JSX.Element> = {
  // a ball on a tee, off the tee box
  driving: (
    <>
      {GROUND}
      <path d="M12 21 V18.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10.5 18.2 L12 17.2 L13.5 18.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="14.3" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  // an iron blade addressing the ball, shaft running up and away
  irons: (
    <>
      {GROUND}
      <circle cx="6.6" cy="19" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.6 4.4 L13.6 18.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13.6 18.8 L18 17.4 L18.6 19.7 L14.1 21.1 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </>
  ),
  // barely leaves the ground — a low running chip
  chipping: (
    <>
      {GROUND}
      <circle cx="4.4" cy="19.2" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.6 18.6 Q10.2 10.8 14 17.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16.2" cy="18.9" r="2.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  // a full, high, lofted arc
  pitching: (
    <>
      {GROUND}
      <circle cx="4.2" cy="19.6" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M6.2 19 Q11 1.8 17.2 14.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17.6" cy="15.9" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  // a ball rolling — not flying — into the cup, marked by its flag
  putting: (
    <>
      {GROUND}
      <circle cx="5.2" cy="18.7" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7.4 18.3 Q10.8 17 14.2 18.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="0.5 2.4" />
      <ellipse cx="16.4" cy="19" rx="1.7" ry="0.85" fill="currentColor" stroke="none" />
      <path d="M16.4 18.5 V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M16.4 7 L20.6 8.7 L16.4 10.4 Z" fill="currentColor" stroke="none" />
    </>
  ),
};
