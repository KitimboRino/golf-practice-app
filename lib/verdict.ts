import { SavedSession, SavedRound, AreaKey, countIn } from "./db";
import { areaCounts, distOf, pool, rateChange, sameDistance, type Pooled } from "./stats";
import { detectFaults } from "./faults";
import { leakReport } from "./round";

// ---- per-area success rate ----------------------------------------------------

type AreaDef = { key: string; label: string; rate: (s: SavedSession) => number | null };

export const AREA_RATES: AreaDef[] = [
  { key: "driving", label: "Driving", rate: (s) => rate(s.driving.fairway, s.driving.left + s.driving.right) },
  { key: "irons", label: "Irons", rate: (s) => rate(s.irons.solid, s.irons.fat + s.irons.thin) },
  { key: "chipping", label: "Chipping", rate: (s) => rate(s.chipping.on, s.chipping.off) },
  { key: "pitching", label: "Pitching", rate: (s) => { const p = s.pitching ?? { close: 0, short: 0, long: 0 }; return rate(p.close, p.short + p.long); } },
  { key: "putting", label: "Putting", rate: (s) => rate(s.putting.in, s.putting.out) },
];

function rate(good: number, bad: number): number | null {
  const t = good + bad;
  return t ? Math.round((good / t) * 100) : null;
}

// ---- the verdict ------------------------------------------------------------

export type Verdict = {
  tone: "up" | "down" | "flat";
  headline: string;
  detail: string;
  confidence: number; // 0-4
  note: string;
};

// a session counts toward the verdict only if it logged tee or iron shots
const hasStrikes = (s: SavedSession) =>
  s.driving.fairway + s.driving.left + s.driving.right +
  s.irons.solid + s.irons.fat + s.irons.thin > 0;

// ball-striking: fairways found plus solid irons, over every tee and iron shot
const strikes = (s: SavedSession): Pooled => {
  const d = areaCounts(s, "driving"), i = areaCounts(s, "irons");
  return { made: d.made + i.made, of: d.of + i.of };
};

/**
 * Is the practice working? Pools the earlier half of the last six strike
 * sessions against the recent half and only calls it up or down when the
 * change is bigger than luck with that many balls (lib/stats rateChange).
 * Comparing two single sessions, as this used to, read 10-15 points of
 * ordinary session-to-session swing as a trend and flipped week to week.
 */
export function verdict(history: SavedSession[]): Verdict | null {
  const strikeHist = history.filter(hasStrikes);
  if (strikeHist.length < 2) return null;
  const window = strikeHist.slice(-6);
  const half = Math.floor(window.length / 2);
  const early = pool(window.slice(0, half).map(strikes));
  const recent = pool(window.slice(-half).map(strikes));
  const c = rateChange(early, recent);
  const balls = early.of + recent.of;
  const confidence = Math.max(1, Math.min(4, Math.floor(Math.min(early.of, recent.of) / 15)));
  const note = confidence >= 4
    ? `Confident. ${balls} balls behind this read.`
    : `Early read · ${balls} balls. More sessions sharpen it.`;
  const span = `${c.from}% over your earlier sessions, ${c.to}% lately`;

  if (c.real && c.delta > 0) {
    return {
      tone: "up",
      headline: "It's working.",
      detail: `Your ball-striking is up ${c.delta} points: ${span}. That's more than a good day explains. Keep the plan.`,
      confidence,
      note,
    };
  }
  if (c.real && c.delta < 0) {
    return {
      tone: "down",
      headline: "Something slipped.",
      detail: `Your ball-striking is down ${Math.abs(c.delta)} points: ${span}. More than a bad day explains, so it's worth changing one thing. Check the miss pattern below.`,
      confidence,
      note,
    };
  }
  return {
    tone: "flat",
    headline: "Holding steady.",
    detail: `Ball-striking: ${span}. With this many balls, a move under ${c.needed} points is ordinary up-and-down. Give the plan a couple more sessions before you judge it.`,
    confidence,
    note,
  };
}

// ---- gaining / slipping areas ---------------------------------------------------

export type AreaMove = { label: string; note: string; delta: number };

const UNIT: Partial<Record<AreaKey, string>> = { putting: "ft", pitching: "yd", chipping: "yd" };

/**
 * The latest session against your earlier ones, per area, flagged only when
 * the move is bigger than luck. Putting, pitching and chipping compare only
 * sessions at the same target distance: holing fewer 10 ft putts than 3 ft
 * putts isn't slipping.
 */
export function areaMoves(history: SavedSession[]): { gaining?: AreaMove; slipping?: AreaMove } {
  if (history.length < 2) return {};
  const latest = history[history.length - 1];
  const earlier = history.slice(0, -1);

  const moves: AreaMove[] = [];
  for (const a of AREA_RATES) {
    const key = a.key as AreaKey;
    const now = areaCounts(latest, key);
    if (!now.of) continue;
    const before = pool(earlier.filter((s) => sameDistance(s, latest, key)).map((s) => areaCounts(s, key)));
    if (!before.of) continue;
    const c = rateChange(before, now, 10);
    if (c.real) {
      const d = distOf(latest, key);
      const at = d != null && UNIT[key] ? ` from ${d} ${UNIT[key]}` : "";
      moves.push({
        label: a.label,
        delta: c.delta,
        note: c.delta > 0 ? `Up ${c.delta} points on your average${at}` : `Down ${Math.abs(c.delta)} points on your average${at}`,
      });
    }
  }
  moves.sort((x, y) => y.delta - x.delta);
  const gaining = moves.find((m) => m.delta > 0);
  const slipping = [...moves].reverse().find((m) => m.delta < 0);
  return { gaining, slipping };
}

// ---- today's one thing --------------------------------------------------------

export type OneThing = { title: string; body: string; source: string };

// On-course leak data (lib/round.ts's leakReport — pooled across rounds, and
// shots-weighted rather than a raw percentage) is the strongest signal this
// app has for "what actually matters," so it leads when it's there. These
// two systems never talked to each other before: Trends only ever read
// session data, Round only ever read round data, and the one thing a player
// actually sees first (this card, on Home) only knew about the range side.
//
// Whichever happened last leads: after a round, the course leak; after a range
// session, what that session showed. Leading with the leak forever (as this
// did) left the card saying the same thing for weeks while the range told a
// different story. When the session leads, the leak still gets one line.
export function todaysOneThing(history: SavedSession[], rounds: SavedRound[], plannedMiss?: string): OneThing | null {
  const leak = leakReport(rounds);
  const lastRoundAt = Math.max(0, ...rounds.map((r) => r.createdAt));
  const lastSessionAt = Math.max(0, ...history.map((s) => s.createdAt));
  const leakTop = leak?.worstKey ? leak.categories.find((c) => c.key === leak.worstKey)! : null;
  const courseLine = leakTop ? ` On the course, ${leakTop.label.toLowerCase()} is still your biggest leak.` : "";
  if (leak?.worstKey && lastRoundAt >= lastSessionAt) {
    const top = leak.categories.find((c) => c.key === leak.worstKey)!;
    return {
      title: `${top.label} is costing you the most.`,
      body: `${top.read} Make it the focus of your next practice session.`,
      source: `From ${leak.rounds} on-course round${leak.rounds === 1 ? "" : "s"}`,
    };
  }

  if (history.length === 0) {
    if (plannedMiss === "right") {
      return {
        title: "Start every drive left of the flag.",
        body: "You told us the ball leaks right. Today, only count a drive as good if it starts left of your target. The finish can look after itself.",
        source: "From your setup answer",
      };
    }
    if (plannedMiss === "left") {
      return {
        title: "Feel the ball start at the target, not left of it.",
        body: "You told us you pull it left. Check your shoulders are square at address before every swing.",
        source: "From your setup answer",
      };
    }
    return {
      title: "Get a clean baseline.",
      body: "Log one honest session of all five areas. Everything after this is measured against today.",
      source: "Your first session",
    };
  }

  const latest = history[history.length - 1];
  const hits = detectFaults(latest);
  if (hits.length) {
    const h = hits[0];
    return {
      title: h.fault.pattern + ".",
      body: h.note + " " + firstSentence(h.fault.fix) + courseLine,
      source: "From your last session",
    };
  }

  // no clear fault — point at the weakest area
  const weakest = [...AREA_RATES]
    .map((a) => ({ label: a.label, r: a.rate(latest) }))
    .filter((x): x is { label: string; r: number } => x.r !== null)
    .sort((x, y) => x.r - y.r)[0];
  if (weakest && weakest.r < 55) {
    return {
      title: `${weakest.label} is the soft spot.`,
      body: `You were at ${weakest.r}% there last time. Give it your full attention early in the session, while you're fresh.${courseLine}`,
      source: "From your last session",
    };
  }

  return {
    title: "Repeat what worked.",
    body: "Nothing's clearly broken. Run the same session, same targets, and see if the numbers hold." + courseLine,
    source: "From your last session",
  };
}

function firstSentence(s: string): string {
  const m = s.match(/^[^.]+\./);
  return m ? m[0] : s;
}

// ---- this month's activity -------------------------------------------------
// A rolling count that resets with the calendar month — not a streak. Missing a
// week shouldn't read as failure; the app's whole tone is "no score, just the
// truth", so the header shows momentum, never a broken chain.

export function sessionsThisMonth(history: SavedSession[]): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return history.filter((s) => {
    const d = new Date(s.date + "T00:00:00");
    return !isNaN(+d) && d.getFullYear() === y && d.getMonth() === m;
  }).length;
}

// ---- session totals (for the receipt) --------------------------------------

export function sessionBalls(s: SavedSession): number {
  return (
    s.driving.fairway + s.driving.left + s.driving.right +
    s.irons.solid + s.irons.fat + s.irons.thin +
    s.chipping.on + s.chipping.off +
    (s.pitching?.close ?? 0) + (s.pitching?.short ?? 0) + (s.pitching?.long ?? 0) +
    s.putting.in + s.putting.out
  );
}

export function sessionMinutes(s: SavedSession): number | null {
  if (!s.startedAt) return null;
  const end = s.createdAt || Date.now();
  const mins = Math.round((end - s.startedAt) / 60000);
  return mins > 0 && mins < 600 ? mins : null;
}

export { countIn };
