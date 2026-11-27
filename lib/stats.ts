import { SavedSession, AreaKey } from "./db";

// Derived metrics, per the handoff spec.
// solid strike % = (driving.fairway + irons.solid) / all logged strikes
export function solidPct(s: SavedSession): number {
  const strikes =
    s.driving.fairway + s.driving.left + s.driving.right +
    s.irons.solid + s.irons.fat + s.irons.thin;
  const good = s.driving.fairway + s.irons.solid;
  return strikes ? Math.round((good / strikes) * 100) : 0;
}

// fairways found % = fairway / driving total
export function fairwayPct(s: SavedSession): number {
  const total = s.driving.fairway + s.driving.left + s.driving.right;
  return total ? Math.round((s.driving.fairway / total) * 100) : 0;
}

// putts made % = in / (in + out)
export function puttPct(s: SavedSession): number {
  const total = s.putting.in + s.putting.out;
  return total ? Math.round((s.putting.in / total) * 100) : 0;
}

// pitch accuracy % = close / (close + short + long)
export function pitchPct(s: SavedSession): number {
  const p = s.pitching ?? { close: 0, short: 0, long: 0 };
  const total = p.close + p.short + p.long;
  return total ? Math.round((p.close / total) * 100) : 0;
}

// Irons, broken out by club — the one club tag a session's irons block
// carries (session.setup.irons.club, picked from the same chip row driving
// and pitching already use) gets applied to that whole block's solid/fat/thin
// totals. Sessions with no club tagged are skipped rather than lumped into
// an "unknown" bucket — a silent guess would be worse than just not counting.
export type IronClubStats = { club: string; solid: number; fat: number; thin: number; total: number; solidPct: number };

const IRON_CLUB_ORDER = ["6i", "7i", "8i", "9i"];

export function ironsByClub(history: SavedSession[]): IronClubStats[] {
  const byClub = new Map<string, { solid: number; fat: number; thin: number }>();
  for (const s of history) {
    const club = s.setup?.irons?.club;
    if (!club) continue;
    const row = byClub.get(club) ?? { solid: 0, fat: 0, thin: 0 };
    row.solid += s.irons.solid;
    row.fat += s.irons.fat;
    row.thin += s.irons.thin;
    byClub.set(club, row);
  }
  const rows: IronClubStats[] = [...byClub.entries()].map(([club, r]) => {
    const total = r.solid + r.fat + r.thin;
    return { club, ...r, total, solidPct: total ? Math.round((r.solid / total) * 100) : 0 };
  });
  rows.sort((a, b) => {
    const ai = IRON_CLUB_ORDER.indexOf(a.club), bi = IRON_CLUB_ORDER.indexOf(b.club);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.club.localeCompare(b.club);
  });
  return rows;
}

// ---- shared reads: per-area counts, distance, and "is this change real" --------

/** made / of for one area of one session, matching how each logging band
 *  reads its success rate (on line, solid, on the towel, close, holed). */
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

/** Areas whose success rate depends on the target distance picked: a 3 ft
 *  putt and a 10 ft putt aren't the same test, so they're only compared at
 *  the same distance. */
export const DISTANCE_AREAS: AreaKey[] = ["putting", "pitching", "chipping"];
export const distOf = (s: SavedSession, a: AreaKey): number | undefined => s.setup?.[a]?.dist;
/** Two sessions are comparable in an area when they share its distance (or
 *  neither picked one). Areas without distances always compare. */
export const sameDistance = (x: SavedSession, y: SavedSession, a: AreaKey) =>
  !DISTANCE_AREAS.includes(a) || distOf(x, a) === distOf(y, a);

export type Pooled = { made: number; of: number };
export const pool = (rows: Pooled[]): Pooled =>
  rows.reduce((t, r) => ({ made: t.made + r.made, of: t.of + r.of }), { made: 0, of: 0 });

/**
 * The change in points between two pooled rates, and whether it's bigger than
 * luck: 10 balls can swing 15 points between two identical sessions. A change
 * is "real" at 1.5 standard errors of the difference for that many balls, and
 * never under `floor` points.
 */
export function rateChange(before: Pooled, after: Pooled, floor = 5): { delta: number; real: boolean; needed: number; from: number; to: number } {
  const from = Math.round((before.made / before.of) * 100);
  const to = Math.round((after.made / after.of) * 100);
  const p = (before.made + after.made) / (before.of + after.of);
  const se = Math.sqrt(p * (1 - p) * (1 / before.of + 1 / after.of)) * 100;
  const needed = Math.max(floor, Math.round(1.5 * se));
  const delta = to - from;
  return { delta, real: Math.abs(delta) >= needed, needed, from, to };
}
