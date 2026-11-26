// The empty-state version of the strata chart (components/Strata.tsx): empty
// layers waiting to be filled, with the bottom one, your first session,
// starting to fill in each area's colour.
const AREAS = ["chipping", "pitching", "irons", "driving", "putting"] as const;
const FIRST = [0.55, 0.4, 0.62, 0.45, 0.5];

export function GhostStrata() {
  return (
    <div className="ghost-strata" aria-hidden="true">
      {[0, 1, 2, 3].map((r) => (
        <div key={r} className="ghost-layer" style={{ opacity: 0.35 + r * 0.15 }}>
          {AREAS.map((a) => <span key={a} className="ghost-cell" />)}
        </div>
      ))}
      <div className="ghost-layer first">
        {AREAS.map((a, i) => (
          <span key={a} className={`ghost-cell filled area-${a}`}>
            <i style={{ "--w": FIRST[i], "--i": i } as React.CSSProperties} />
          </span>
        ))}
      </div>
    </div>
  );
}
