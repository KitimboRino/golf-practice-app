import { SavedSession } from "./db";

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
