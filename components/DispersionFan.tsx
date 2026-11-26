// Driving dispersion: every logged drive as a ball flight from the tee.
// On-line balls land in the fairway corridor, misses land left or right of
// it. Positions are deterministic from the ball's index (a small hash, not
// Math.random), so the picture is stable across renders and screens; the
// newest flight draws itself in. Lives on the driving band, so it uses the
// band's --on-band colour.

const W = 300, H = 150, TEE_X = 150, TEE_Y = 138;
// pseudo-random in [0, 1) from an integer seed
const rnd = (n: number) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

function landing(kind: string, i: number): [number, number] {
  const a = rnd(i + 1), b = rnd(i + 101);
  const y = 26 + b * 30;
  if (kind === "left") return [44 + a * 52, y + 6];
  if (kind === "right") return [204 + a * 52, y + 6];
  return [124 + a * 52, y];
}

export function DispersionFan({ strip }: { strip: string[] }) {
  const shots = strip.map((k, i) => {
    const [x, y] = landing(k, i);
    // slices and hooks bend late: pull the control point back toward the
    // middle so misses curve away rather than start out wide
    const bend = k === "fairway" ? 0.35 : 0.08;
    const cx = TEE_X + (x - TEE_X) * bend, cy = 70;
    return { k, x, y, d: `M${TEE_X} ${TEE_Y} Q${cx.toFixed(1)} ${cy} ${x.toFixed(1)} ${y.toFixed(1)}` };
  });
  const n = (k: string) => strip.filter((s) => s === k).length;
  const label = strip.length
    ? `${strip.length} drives: ${n("fairway")} on line, ${n("left")} left, ${n("right")} right`
    : "No drives logged yet";

  return (
    <svg className="fan" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {/* the fairway corridor, widening away from the tee */}
      <path className="fan-fairway" d={`M${TEE_X - 14} ${TEE_Y} L112 16 L188 16 L${TEE_X + 14} ${TEE_Y} Z`} />
      <text className="fan-lbl" x="70" y="12" textAnchor="middle">Left</text>
      <text className="fan-lbl" x="150" y="12" textAnchor="middle">Fairway</text>
      <text className="fan-lbl" x="230" y="12" textAnchor="middle">Right</text>
      {shots.map((s, i) => {
        const newest = i === shots.length - 1;
        return (
          <g key={`${i}-${s.k}`} className={"fan-shot" + (s.k === "fairway" ? " good" : " miss") + (newest ? " new" : "")}>
            <path d={s.d} pathLength={1} />
            <circle cx={s.x} cy={s.y} r={newest ? 5 : 4} />
          </g>
        );
      })}
      <circle className="fan-tee" cx={TEE_X} cy={TEE_Y} r="4" />
    </svg>
  );
}
