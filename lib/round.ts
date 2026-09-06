import { RoundHole, SavedRound, AreaKey, emptyHole } from "./db";

// A fresh set of hole records, all par 4 by default.
export function freshHoles(count: 9 | 18): RoundHole[] {
  return Array.from({ length: count }, () => emptyHole(4));
}

export type RoundStats = {
  firPct: number | null;   // null when the round is all par 3s
  firMade: number;
  firOf: number;
  girPct: number;
  girMade: number;
  girOf: number;
  putts: number;
  puttsPerHole: number;
  scramblePct: number | null;  // null when no greens were missed / no U&D logged
  scrambleMade: number;
  scrambleOf: number;
  threePutts: number;
  holesLogged: number;
};

export function roundStats(holes: RoundHole[]): RoundStats {
  const firHoles = holes.filter((h) => h.fairwayHit !== null); // par 4s + 5s
  const firMade = firHoles.filter((h) => h.fairwayHit).length;

  const girMade = holes.filter((h) => h.gir).length;

  const putts = holes.reduce((n, h) => n + h.putts, 0);

  const missedGreens = holes.filter((h) => !h.gir);
  const scrambleMade = missedGreens.filter((h) => h.upAndDown === true).length;

  const threePutts = holes.filter((h) => h.putts >= 3).length;

  const n = holes.length || 1;
  return {
    firPct: firHoles.length ? Math.round((firMade / firHoles.length) * 100) : null,
    firMade,
    firOf: firHoles.length,
    girPct: Math.round((girMade / n) * 100),
    girMade,
    girOf: holes.length,
    putts,
    puttsPerHole: Math.round((putts / n) * 10) / 10,
    scramblePct: missedGreens.length ? Math.round((scrambleMade / missedGreens.length) * 100) : null,
    scrambleMade,
    scrambleOf: missedGreens.length,
    threePutts,
    holesLogged: holes.length,
  };
}

export type LiveRound = {
  date: string;
  course: string;
  holes: 9 | 18;
  holeData: RoundHole[];
  current: number; // 0-indexed hole being logged
  startedAt: number;
};

// short label for a saved round in a list
export function roundLabel(r: SavedRound): string {
  return r.course?.trim() || `${r.holes}-hole round`;
}

// ===========================================================================
// "Where you're losing shots" — a rough leak finder built from round stats.
//
// This is deliberately simple. It scores four skills against flat amateur
// benchmarks and turns each gap into an approximate shots-per-round figure.
// It is NOT strokes-gained and nowhere near tour-grade — the screen says so.
//
// Everything the maths leans on is a named constant below. Edit these freely;
// nothing downstream is hard-coded.
// ---------------------------------------------------------------------------

export type LeakKey = "driving" | "approach" | "shortGame" | "putting";

/** Mid-handicap (~15-20) reference numbers — rules of thumb, not tour data. */
export const LEAK_BENCHMARK: Record<LeakKey, {
  label: string;
  noun: string;                 // how the stat reads in a sentence
  target: number;               // the benchmark value
  areas: AreaKey[];             // which plan practice area(s) this points at
}> = {
  driving:   { label: "Driving",    noun: "fairways found",       target: 45,  areas: ["driving"] },
  approach:  { label: "Approach",   noun: "greens hit",           target: 40,  areas: ["irons"] },
  shortGame: { label: "Short game", noun: "scrambling",           target: 30,  areas: ["chipping", "pitching"] },
  putting:   { label: "Putting",    noun: "putts a hole",         target: 1.9, areas: ["putting"] },
};

/** Expected 3-putts in a benchmark round (per 18 holes). */
export const THREE_PUTT_BENCHMARK = 2;

/**
 * Rough "exchange rates": shots lost per unit of gap below the benchmark,
 * measured per 18 holes. Approach hurts most (a missed green tends to cost a
 * near-full shot); a missed fairway often costs only a fraction.
 */
export const LEAK_SHOT_RATE: Record<LeakKey, { per: number; shots: number }> = {
  driving:   { per: 10,  shots: 0.8 },   // per 10 percentage points of fairways hit
  approach:  { per: 10,  shots: 2.2 },   // per 10 percentage points of GIR
  shortGame: { per: 10,  shots: 1.1 },   // per 10 percentage points of scrambling
  putting:   { per: 0.1, shots: 1.8 },   // per 0.1 putts/hole over benchmark (~ 1 putt = 1 shot)
};

/** Extra shots for every 3-putt above the benchmark count (per 18 holes).
 *  Small on purpose — most of a 3-putt's cost already sits inside putts/hole. */
export const THREE_PUTT_SHOT_RATE = 0.6;

/** How far off the benchmark still counts as "around" rather than above/below. */
export const LEAK_MARGIN = { pct: 5, pph: 0.06 };

// ---------------------------------------------------------------------------

export type LeakStatus = "below" | "around" | "above" | "na";

export type LeakCategory = {
  key: LeakKey;
  label: string;
  areas: AreaKey[];
  measurable: boolean;
  value: number | null;          // pooled stat value (% or putts/hole)
  valueText: string;             // "22%" / "2.1"
  target: number;
  targetText: string;            // "40%" / "1.9"
  status: LeakStatus;
  costPerRound: number;          // rough shots/round, 0 unless clearly below
  read: string;                  // one-line plain-language summary
  detail: string;                // supporting stat line
  trend: number[];               // per-round values, oldest first ([] if < 2)
  trendDir: "improving" | "slipping" | "flat" | null;
};

export type LeakReport = {
  rounds: number;
  holes: number;
  hasTrend: boolean;
  categories: LeakCategory[];    // ranked, biggest leak first
  worstKey: LeakKey | null;      // the top leak, if any category is "below"
};

const mean = (xs: number[]) => xs.reduce((a, x) => a + x, 0) / (xs.length || 1);
const round1 = (n: number) => Math.round(n * 10) / 10;

function trendDir(series: number[], lowerIsBetter: boolean): LeakCategory["trendDir"] {
  if (series.length < 2) return null;
  const mid = Math.floor(series.length / 2);
  const early = mean(series.slice(0, Math.max(1, mid)));
  const late = mean(series.slice(mid));
  const delta = late - early;
  const threshold = lowerIsBetter ? 0.08 : 3;
  if (Math.abs(delta) < threshold) return "flat";
  const better = lowerIsBetter ? delta < 0 : delta > 0;
  return better ? "improving" : "slipping";
}

const costText = (n: number) =>
  n >= 1 ? `~${Math.round(n)} shot${Math.round(n) === 1 ? "" : "s"} a round` : "under a shot a round";

function readFor(c: LeakCategory, isTop: boolean): string {
  const v = c.valueText, t = c.targetText;
  if (c.status === "na") {
    return c.key === "shortGame"
      ? "Not enough greens missed across these rounds to read your short game yet."
      : `Not enough data to read your ${c.label.toLowerCase()} yet.`;
  }
  if (c.status === "above") {
    return `${c.label} is a strength — ${v} ${LEAK_BENCHMARK[c.key].noun} against a ${t} mark. Nothing to chase here.`;
  }
  if (c.status === "around") {
    return `${c.label} is about standard for the level — ${v} ${LEAK_BENCHMARK[c.key].noun} versus ${t}.`;
  }
  const head = isTop ? "is your biggest leak" : "is costing you shots";
  const shots = costText(c.costPerRound);
  switch (c.key) {
    case "driving":
      return `Your driving ${head} — ${v} of fairways found against a ${t} target, ${shots}.`;
    case "approach":
      return `Your approach play ${head} — you're hitting ${v} of greens against a ${t} target, ${shots}.`;
    case "shortGame":
      return `Your short game ${head} — up and down just ${v} of the time against a ${t} target, ${shots}.`;
    case "putting":
      return `Your putting ${head} — ${c.detail}, against a ${t} mark and ${THREE_PUTT_BENCHMARK} three-putts. ${shots[0].toUpperCase()}${shots.slice(1)}.`;
    default:
      return `Your ${c.label.toLowerCase()} ${head}, ${shots}.`;
  }
}

function pctCategory(
  key: Exclude<LeakKey, "putting">,
  value: number | null,
  detail: string,
  series: number[],
): LeakCategory {
  const b = LEAK_BENCHMARK[key];
  const rate = LEAK_SHOT_RATE[key];
  const c: LeakCategory = {
    key, label: b.label, areas: b.areas,
    measurable: value !== null,
    value,
    valueText: value === null ? "—" : `${Math.round(value)}%`,
    target: b.target,
    targetText: `${b.target}%`,
    status: "na",
    costPerRound: 0,
    read: "",
    detail: value === null
      ? (key === "shortGame" ? "no greens missed yet" : "no data yet")
      : detail,
    trend: series.length >= 2 ? series.map((x) => Math.round(x)) : [],
    trendDir: series.length >= 2 ? trendDir(series, false) : null,
  };
  if (value === null) return c;
  const gap = b.target - value; // positive = below benchmark
  c.status = gap > LEAK_MARGIN.pct ? "below" : gap < -LEAK_MARGIN.pct ? "above" : "around";
  c.costPerRound = c.status === "below" ? round1((gap / rate.per) * rate.shots) : 0;
  return c;
}

function puttCategory(
  pph: number | null,
  threePuttPer18: number,
  detail: string,
  series: number[],
): LeakCategory {
  const b = LEAK_BENCHMARK.putting;
  const rate = LEAK_SHOT_RATE.putting;
  const c: LeakCategory = {
    key: "putting", label: b.label, areas: b.areas,
    measurable: pph !== null,
    value: pph,
    valueText: pph === null ? "—" : pph.toFixed(1),
    target: b.target,
    targetText: b.target.toFixed(1),
    status: "na",
    costPerRound: 0,
    read: "",
    detail: pph === null ? "no putts logged yet" : detail,
    trend: series.length >= 2 ? series.map((x) => Math.round(x * 100) / 100) : [],
    trendDir: series.length >= 2 ? trendDir(series, true) : null,
  };
  if (pph === null) return c;
  const pphGap = pph - b.target;
  const tpGap = threePuttPer18 - THREE_PUTT_BENCHMARK;
  c.status =
    pphGap > LEAK_MARGIN.pph || tpGap > 1 ? "below" :
    pphGap < -LEAK_MARGIN.pph ? "above" : "around";
  if (c.status === "below") {
    c.costPerRound = round1(
      (Math.max(0, pphGap) / rate.per) * rate.shots +
      Math.max(0, tpGap) * THREE_PUTT_SHOT_RATE,
    );
  }
  return c;
}

/** Diagnose where a player is leaking shots across their saved rounds.
 *  Pooled (sample-weighted) stats drive the headline; per-round series drive
 *  the trend. Returns null if there's nothing loggable to work with. */
export function leakReport(rounds: SavedRound[]): LeakReport | null {
  const usable = rounds.filter((r) => r.holeData.length > 0);
  if (!usable.length) return null;

  const per = usable.map((r) => roundStats(r.holeData));
  const total = (fn: (s: RoundStats) => number) => per.reduce((n, s) => n + fn(s), 0);

  const holes = total((s) => s.holesLogged);
  const firOf = total((s) => s.firOf), firMade = total((s) => s.firMade);
  const girOf = total((s) => s.girOf), girMade = total((s) => s.girMade);
  const scrOf = total((s) => s.scrambleOf), scrMade = total((s) => s.scrambleMade);
  const puttsTot = total((s) => s.putts);
  const threePuttTot = total((s) => s.threePutts);

  const firPct = firOf ? (firMade / firOf) * 100 : null;
  const girPct = girOf ? (girMade / girOf) * 100 : null;
  const scrPct = scrOf ? (scrMade / scrOf) * 100 : null;
  const pph = holes ? puttsTot / holes : null;
  const threePuttPer18 = holes ? (threePuttTot / holes) * 18 : 0;
  const threePuttPerRound = threePuttTot / usable.length;

  const firSeries = per.map((s) => s.firPct).filter((x): x is number => x !== null);
  const girSeries = per.map((s) => s.girPct);
  const scrSeries = per.map((s) => s.scramblePct).filter((x): x is number => x !== null);
  const pphSeries = per.map((s) => s.puttsPerHole);

  const cats: LeakCategory[] = [
    pctCategory("driving", firPct, `${firMade} of ${firOf} fairways`, firSeries),
    pctCategory("approach", girPct, `${girMade} of ${girOf} greens`, girSeries),
    pctCategory("shortGame", scrPct, `${scrMade} of ${scrOf} scrambles saved`, scrSeries),
    puttCategory(
      pph,
      threePuttPer18,
      pph === null
        ? "no putts logged yet"
        : `${pph.toFixed(1)} putts a hole and ${round1(threePuttPerRound)} three-putts a round`,
      pphSeries,
    ),
  ];

  // rank: biggest cost first, then by status, then by raw distance below target
  const order: Record<LeakStatus, number> = { below: 0, around: 1, above: 2, na: 3 };
  const belowBy = (c: LeakCategory) =>
    c.value === null ? -Infinity : c.target - c.value;
  cats.sort((a, b) =>
    b.costPerRound - a.costPerRound ||
    order[a.status] - order[b.status] ||
    belowBy(b) - belowBy(a),
  );

  cats.forEach((c, i) => { c.read = readFor(c, i === 0); });

  const worst = cats.find((c) => c.status === "below") ?? null;

  return {
    rounds: usable.length,
    holes,
    hasTrend: usable.length >= 2,
    categories: cats,
    worstKey: worst ? worst.key : null,
  };
}

/** How the linked practice area reads in a button ("Practise short game"). */
export function practiceNoun(areas: AreaKey[]): string {
  if (areas.length > 1) return "short game";
  return areas[0] ?? "";
}
