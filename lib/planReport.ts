// Two reads that turn logged practice into answers:
//  - areaByDistance: make rate per target distance (the chips picked while
//    logging putting, pitching and chipping), the way ironsByClub reads clubs
//  - planReport: the end-of-plan read, first session against test day in all
//    five areas, and what to do next
import type { AreaKey, SavedSession } from "./db";
import { isAdhoc } from "./db";
import { isTestDay, levelOfWeek, type Level } from "./plan";

// made / of for one area of one session, matching how each logging band
// reads its success rate (on line, solid, on the towel, close, holed)
export function areaCounts(s: SavedSession, a: AreaKey): { made: number; of: number } {
  switch (a) {
    case "driving": return { made: s.driving.fairway, of: s.driving.fairway + s.driving.left + s.driving.right };
    case "irons": return { made: s.irons.solid, of: s.irons.solid + s.irons.fat + s.irons.thin };
    case "chipping": return { made: s.chipping.on, of: s.chipping.on + s.chipping.off };
    case "pitching": {
      const p = s.pitching ?? { close: 0, short: 0, long: 0 };
      return { made: p.close, of: p.close + p.short + p.long };
    }
    case "putting": return { made: s.putting.in, of: s.putting.in + s.putting.out };
  }
}

const pct = (made: number, of: number) => (of ? Math.round((made / of) * 100) : 0);

// ---- make rate by distance -----------------------------------------------------

export type DistanceRow = { dist: number; made: number; of: number; pct: number; sessions: number };

/** Pools every session that picked a target distance for `area`. Distances
 *  with fewer than `minBalls` balls are left out; null until two qualify. */
export function areaByDistance(history: SavedSession[], area: AreaKey, minBalls = 5): DistanceRow[] | null {
  const by = new Map<number, DistanceRow>();
  for (const s of history) {
    const dist = s.setup?.[area]?.dist;
    if (dist == null) continue;
    const { made, of } = areaCounts(s, area);
    if (!of) continue;
    const row = by.get(dist) ?? { dist, made: 0, of: 0, pct: 0, sessions: 0 };
    row.made += made; row.of += of; row.sessions += 1;
    by.set(dist, row);
  }
  const rows = [...by.values()]
    .filter((r) => r.of >= minBalls)
    .map((r) => ({ ...r, pct: pct(r.made, r.of) }))
    .sort((a, b) => a.dist - b.dist);
  return rows.length >= 2 ? rows : null;
}

// ---- end-of-plan report -----------------------------------------------------------

export const AREA_ORDER: AreaKey[] = ["driving", "irons", "chipping", "pitching", "putting"];

export type ReportRow = {
  area: AreaKey;
  from: number | null;   // first plan session that logged the area
  to: number | null;     // test day, or the latest plan session that logged it
  delta: number | null;   // null when there's no second session, or too few balls to compare
  tone: "up" | "down" | "flat" | "na";
  thin: boolean;          // a side has under MIN_BALLS balls: shown, not counted
};

export type PlanReport = {
  level: Level;
  rows: ReportRow[];
  improved: number;          // areas up 5+ points
  slipped: number;           // areas down 5+ points
  best: ReportRow | null;    // biggest gain
  weakest: ReportRow | null; // lowest rate on test day
  next: "up" | "repeat" | "hold";
  nextLevel: Level | null;
  sessions: number;
  balls: number;
  testLogged: boolean;
};

const NEXT_LEVEL: Record<Level, Level | null> = { beginner: "intermediate", intermediate: "professional", professional: null };
const MOVE = 5; // points that count as a real change, as in the verdict
const MIN_BALLS = 5; // fewer balls than this on either side and a % is noise

/** First session vs test day, per area, for the given level's plan. Null
 *  until there are two plan sessions at that level. */
export function planReport(history: SavedSession[], level: Level): PlanReport | null {
  const plan = history.filter((s) => !isAdhoc(s) && levelOfWeek(s.weekId) === level);
  if (plan.length < 2) return null;
  const test = plan.find((s) => isTestDay(s.weekId, s.sessionLabel)) ?? null;

  const rows: ReportRow[] = AREA_ORDER.map((area) => {
    const logged = plan.filter((s) => areaCounts(s, area).of > 0);
    const first = logged[0];
    const lastOne = test && areaCounts(test, area).of > 0 ? test : logged[logged.length - 1];
    if (!first || !lastOne || first.id === lastOne.id) {
      const only = first ? pct(areaCounts(first, area).made, areaCounts(first, area).of) : null;
      return { area, from: only, to: null, delta: null, tone: "na", thin: false };
    }
    const a = areaCounts(first, area), b = areaCounts(lastOne, area);
    const from = pct(a.made, a.of), to = pct(b.made, b.of);
    if (a.of < MIN_BALLS || b.of < MIN_BALLS) return { area, from, to, delta: null, tone: "na", thin: true };
    const delta = to - from;
    return { area, from, to, delta, tone: delta >= MOVE ? "up" : delta <= -MOVE ? "down" : "flat", thin: false };
  });

  const scored = rows.filter((r) => r.delta !== null);
  const improved = scored.filter((r) => r.tone === "up").length;
  const slipped = scored.filter((r) => r.tone === "down").length;
  const best = [...scored].sort((a, b) => (b.delta ?? 0) - (a.delta ?? 0))[0] ?? null;
  const weakest = [...rows].filter((r) => r.to !== null && !r.thin).sort((a, b) => (a.to ?? 0) - (b.to ?? 0))[0] ?? null;

  // up: most areas moved and nothing went backwards; repeat: little moved
  const nextLevel = NEXT_LEVEL[level];
  const next: PlanReport["next"] =
    improved >= 3 && slipped === 0 && nextLevel ? "up"
    : improved <= 1 ? "repeat"
    : "hold";

  return {
    level, rows, improved, slipped,
    best: best && (best.delta ?? 0) > 0 ? best : null,
    weakest, next, nextLevel: next === "up" ? nextLevel : null,
    sessions: plan.length,
    balls: plan.reduce((n, s) => n + AREA_ORDER.reduce((m, a) => m + areaCounts(s, a).of, 0), 0),
    testLogged: !!test,
  };
}
