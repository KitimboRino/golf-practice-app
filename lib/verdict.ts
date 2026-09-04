import { SavedSession, countIn } from "./db";
import { solidPct, fairwayPct, puttPct, pitchPct } from "./stats";
import { detectFaults } from "./faults";

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

// a session counts toward the solid-rate verdict only if it logged tee or iron shots
const hasStrikes = (s: SavedSession) =>
  s.driving.fairway + s.driving.left + s.driving.right +
  s.irons.solid + s.irons.fat + s.irons.thin > 0;

export function verdict(history: SavedSession[]): Verdict | null {
  const strikeHist = history.filter(hasStrikes);
  if (strikeHist.length < 2) return null;
  const window = strikeHist.slice(-4);
  const vals = window.map(solidPct);
  const change = vals[vals.length - 1] - vals[0];
  const span = window.length;
  const confidence = Math.min(4, span);
  const note =
    confidence >= 4
      ? "Confident — four sessions of signal."
      : `Confidence ${confidence} of 4 · ${4 - confidence} more session${4 - confidence === 1 ? "" : "s"} to be certain.`;

  if (change >= 5) {
    return {
      tone: "up",
      headline: "It's working.",
      detail: `Your solid rate has climbed ${change} points over ${span} sessions — past the noise in your own numbers. Keep the plan.`,
      confidence,
      note,
    };
  }
  if (change <= -5) {
    return {
      tone: "down",
      headline: "Something slipped.",
      detail: `Your solid rate is down ${Math.abs(change)} points over ${span} sessions. Worth changing one thing — check the miss pattern below.`,
      confidence,
      note,
    };
  }
  return {
    tone: "flat",
    headline: "Holding steady.",
    detail: `Solid rate has moved ${change >= 0 ? "+" : ""}${change} points over ${span} sessions — inside the noise. Give the plan a couple more sessions before you judge it.`,
    confidence,
    note,
  };
}

// ---- gaining / slipping areas ---------------------------------------------------

export type AreaMove = { label: string; note: string; delta: number };

export function areaMoves(history: SavedSession[]): { gaining?: AreaMove; slipping?: AreaMove } {
  if (history.length < 2) return {};
  const latest = history[history.length - 1];
  const earlier = history.slice(0, -1);

  const moves: AreaMove[] = [];
  for (const a of AREA_RATES) {
    const now = a.rate(latest);
    if (now === null) continue;
    const prevVals = earlier.map(a.rate).filter((v): v is number => v !== null);
    if (!prevVals.length) continue;
    const base = Math.round(prevVals.reduce((x, y) => x + y, 0) / prevVals.length);
    const delta = now - base;
    if (Math.abs(delta) >= 6) {
      moves.push({
        label: a.label,
        delta,
        note: delta > 0 ? `Up ${delta} points on your average` : `Down ${Math.abs(delta)} points on your average`,
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

export function todaysOneThing(history: SavedSession[], plannedMiss?: string): OneThing | null {
  if (history.length === 0) {
    if (plannedMiss === "right") {
      return {
        title: "Start every drive left of the flag.",
        body: "You told us the ball leaks right. Today, only count a drive as good if it starts left of your target — the finish can look after itself.",
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
      body: h.note + " " + firstSentence(h.fault.fix),
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
      body: `You were at ${weakest.r}% there last time. Give it your full attention early in the session, while you're fresh.`,
      source: "From your last session",
    };
  }

  return {
    title: "Repeat what worked.",
    body: "Nothing's clearly broken. Run the same session, same targets, and see if the numbers hold.",
    source: "From your last session",
  };
}

function firstSentence(s: string): string {
  const m = s.match(/^[^.]+\./);
  return m ? m[0] : s;
}

// ---- streak (consecutive ISO weeks with a session) --------------------------

export function weekStreak(history: SavedSession[]): number {
  if (!history.length) return 0;
  const weeks = new Set(history.map((s) => isoWeekKey(new Date(s.date + "T00:00:00"))));
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 60; i++) {
    if (weeks.has(isoWeekKey(cursor))) streak++;
    else if (i > 0) break; // allow the current week to be empty (streak counts from last logged)
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

function isoWeekKey(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${week}`;
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
