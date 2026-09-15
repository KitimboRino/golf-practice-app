import type { CSSProperties } from "react";

// A small burst of dots for a milestone moment (a new personal best, a best-ever
// round) — no image asset, just positioned/animated <i> tags. CSS drives the
// motion and respects prefers-reduced-motion (see .pb-burst in globals.css).
// Purely decorative — wrap it in a `position: relative` anchor and drop it where
// the burst should originate from (an icon, a badge).
export function Burst() {
  const n = 8;
  const dots = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = 20 + (i % 2) * 6;
    return {
      tx: Math.cos(a) * r,
      ty: Math.sin(a) * r,
      delay: (i % 4) * 35,
    };
  });
  return (
    <span className="pb-burst" aria-hidden="true">
      {dots.map((d, i) => (
        <i
          key={i}
          style={{ "--tx": `${d.tx.toFixed(1)}px`, "--ty": `${d.ty.toFixed(1)}px`, animationDelay: `${d.delay}ms` } as CSSProperties}
        />
      ))}
    </span>
  );
}
