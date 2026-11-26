// Round patterns: the "which holes, what habit" layer under the leak report.
// The leak report says which part of the game costs shots against a
// benchmark; these say where on the card it happens (par 3s, the back nine,
// blow-up holes) and what the habit looks like (tee shots missing right, the
// driver finding fewer fairways than the 3-wood). Every function returns null
// until there's enough logged to say something, so the UI never shows a
// pattern built from two holes.
import type { RoundHole, SavedRound, SavedSession } from "./db";

const scored = (h: RoundHole): h is RoundHole & { score: number } => h.score != null;
const round1 = (n: number) => Math.round(n * 10) / 10;

// ---- scoring by par ---------------------------------------------------------

export type ParRow = { par: 3 | 4 | 5; holes: number; avgOver: number };
// worst is null when no par stands out by `margin` strokes a hole: a 0.1
// gap across a few rounds is noise, not a pattern
export type ParReport = { rows: ParRow[]; worst: 3 | 4 | 5 | null };

/** Average strokes over par on par 3s, 4s and 5s. Needs `minHoles` scored
 *  holes of a par to list it, and two pars listed to compare. */
export function scoringByPar(rounds: SavedRound[], minHoles = 3, margin = 0.3): ParReport | null {
  const holes = rounds.flatMap((r) => r.holeData).filter(scored);
  const rows = ([3, 4, 5] as const).map((par) => {
    const hs = holes.filter((h) => h.par === par);
    const over = hs.reduce((n, h) => n + (h.score - par), 0);
    return { par, holes: hs.length, avgOver: hs.length ? round1(over / hs.length) : 0 };
  }).filter((r) => r.holes >= minHoles);
  if (rows.length < 2) return null;
  const [first, second] = [...rows].sort((a, b) => b.avgOver - a.avgOver);
  const worst = first.avgOver > 0 && first.avgOver - second.avgOver >= margin - 1e-9 ? first.par : null;
  return { rows, worst };
}

// ---- blow-up holes ------------------------------------------------------------

export type BlowUps = {
  rounds: number;
  doublesPerRound: number;   // holes at double bogey or worse, per 18
  costPerRound: number;      // strokes beyond bogey on those holes, per 18
  penaltiesPerRound: number; // penalty strokes, per 18
  holes: number;             // scored holes this is based on
};

/** Doubles-or-worse and penalties, scaled to 18 holes so 9s and 18s mix.
 *  "Cost" is strokes beyond bogey: a triple on a par 4 costs 2. */
export function blowUps(rounds: SavedRound[], minHoles = 9): BlowUps | null {
  const used = rounds.filter((r) => r.holeData.some(scored));
  const holes = used.flatMap((r) => r.holeData).filter(scored);
  if (holes.length < minHoles) return null;
  const per18 = (n: number) => round1((n / holes.length) * 18);
  const big = holes.filter((h) => h.score - h.par >= 2);
  return {
    rounds: used.length,
    doublesPerRound: per18(big.length),
    costPerRound: per18(big.reduce((n, h) => n + (h.score - h.par - 1), 0)),
    penaltiesPerRound: per18(holes.reduce((n, h) => n + (h.penalties ?? 0), 0)),
    holes: holes.length,
  };
}

// ---- tee-shot miss side ---------------------------------------------------------

export type MissSide = {
  left: number;
  right: number;
  rightPct: number;              // share of course misses that went right
  rangeRightPct: number | null;  // same, from range driving; null if too few
  rangeMisses: number;
  same: boolean | null;          // both lean the same way (or null: no range read)
};

const lean = (rightPct: number) => (rightPct >= 60 ? "right" : rightPct <= 40 ? "left" : "both");

/** Which way missed fairways go, next to the range's left/right driving
 *  misses. Needs `minMisses` course misses with a side logged. */
export function teeMissSide(
  rounds: SavedRound[], sessions: SavedSession[], minMisses = 4,
): MissSide | null {
  const misses = rounds.flatMap((r) => r.holeData).filter((h) => h.fairwayHit === false && h.fairwayMiss);
  const left = misses.filter((h) => h.fairwayMiss === "left").length;
  const right = misses.length - left;
  if (misses.length < minMisses) return null;
  const rightPct = Math.round((right / misses.length) * 100);

  const rl = sessions.reduce((n, s) => n + s.driving.left, 0);
  const rr = sessions.reduce((n, s) => n + s.driving.right, 0);
  const rangeMisses = rl + rr;
  const rangeRightPct = rangeMisses >= 10 ? Math.round((rr / rangeMisses) * 100) : null;
  const same = rangeRightPct === null ? null : lean(rightPct) === lean(rangeRightPct);
  return { left, right, rightPct, rangeRightPct, rangeMisses, same };
}

// ---- fairways by tee club -----------------------------------------------------

export type ClubRow = { club: string; made: number; of: number; pct: number };

/** Fairways hit per tee club, for clubs used on `minPerClub`+ answered holes.
 *  Null until two clubs qualify, since one club has nothing to compare to. */
export function fairwaysByTeeClub(rounds: SavedRound[], minPerClub = 3): ClubRow[] | null {
  const holes = rounds.flatMap((r) => r.holeData).filter((h) => h.teeClub && h.fairwayHit != null);
  const clubs = [...new Set(holes.map((h) => h.teeClub as string))];
  const rows = clubs.map((club) => {
    const hs = holes.filter((h) => h.teeClub === club);
    const made = hs.filter((h) => h.fairwayHit === true).length;
    return { club, made, of: hs.length, pct: Math.round((made / hs.length) * 100) };
  }).filter((r) => r.of >= minPerClub).sort((a, b) => b.pct - a.pct || b.of - a.of);
  return rows.length >= 2 ? rows : null;
}

// ---- front nine vs back nine ----------------------------------------------------

export type Nines = { rounds: number; front: number; back: number; diff: number };

/** Average to-par on each nine across 18-hole rounds where at least seven
 *  holes of both nines were scored (to-par is per scored hole, scaled to 9). */
export function frontBack(rounds: SavedRound[], minRounds = 2): Nines | null {
  const nineToPar = (hs: RoundHole[]) => {
    const s = hs.filter(scored);
    if (s.length < 7) return null;
    return (s.reduce((n, h) => n + (h.score - h.par), 0) / s.length) * 9;
  };
  const pairs = rounds
    .filter((r) => r.holes === 18 && r.holeData.length === 18)
    .map((r) => [nineToPar(r.holeData.slice(0, 9)), nineToPar(r.holeData.slice(9))] as const)
    .filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null);
  if (pairs.length < minRounds) return null;
  const front = round1(pairs.reduce((n, p) => n + p[0], 0) / pairs.length);
  const back = round1(pairs.reduce((n, p) => n + p[1], 0) / pairs.length);
  return { rounds: pairs.length, front, back, diff: round1(back - front) };
}

// ---- this hole, last time -------------------------------------------------------

export type HoleHistory = {
  played: number;          // earlier rounds at this course that scored this hole
  recent: number[];        // their scores, most recent first (up to 3)
  avgOver: number;         // average strokes over par across all of them
  fwHit: number;           // fairway answers on this hole: hit / of
  fwOf: number;
  missLeft: number;
  missRight: number;
};

const courseKey = (c: string | undefined) => (c ?? "").trim().toLowerCase().replace(/\s+/g, " ");

/** How this hole has gone on earlier rounds at the same course (matched by
 *  name, ignoring case and spacing). `skipId` leaves out the round being
 *  edited. Null when the course is unnamed or the hole has never been scored. */
export function holeHistory(
  rounds: SavedRound[], course: string, holeIndex: number, skipId?: string,
): HoleHistory | null {
  const key = courseKey(course);
  if (!key) return null;
  const past = rounds
    .filter((r) => r.id !== skipId && courseKey(r.course) === key)
    .sort((a, b) => (b.date === a.date ? b.createdAt - a.createdAt : b.date < a.date ? -1 : 1))
    .map((r) => r.holeData[holeIndex])
    .filter((h): h is RoundHole & { score: number } => !!h && h.score != null);
  if (!past.length) return null;
  const fw = past.filter((h) => h.par !== 3 && h.fairwayHit != null);
  return {
    played: past.length,
    recent: past.slice(0, 3).map((h) => h.score),
    avgOver: round1(past.reduce((n, h) => n + (h.score - h.par), 0) / past.length),
    fwHit: fw.filter((h) => h.fairwayHit === true).length,
    fwOf: fw.length,
    missLeft: fw.filter((h) => h.fairwayMiss === "left").length,
    missRight: fw.filter((h) => h.fairwayMiss === "right").length,
  };
}
