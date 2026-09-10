import { RoundHole, SavedRound, AreaKey, emptyHole } from "./db";

// A fresh set of hole records, all par 4 by default.
export function freshHoles(count: 9 | 18): RoundHole[] {
  return Array.from({ length: count }, () => emptyHole(4));
}

export type RoundStats = {
  strokes: number;             // total strokes over scored holes
  scoredHoles: number;         // holes with a score entered
  toPar: number;               // strokes − par of scored holes
  parOfScored: number;
  birdies: number;             // −1 or better
  pars: number;
  bogeys: number;              // +1
  doubles: number;             // +2 or worse
  penalties: number;           // penalty strokes across the round
  penaltyHoles: number;        // holes that took at least one
  firPct: number | null;       // null when no par 4/5 fairway was answered
  firMade: number;
  firOf: number;               // par 4/5 holes with a fairway answer
  fairwayLeft: number;         // fairway misses left / right
  fairwayRight: number;
  girPct: number | null;       // null when no GIR was answered
  girMade: number;
  girOf: number;               // holes with a GIR answer
  putts: number;
  puttsOf: number;             // holes with a putt count entered
  puttsPerHole: number | null; // null when no putts entered
  scramblePct: number | null;  // null when no missed-green U&D was answered
  scrambleMade: number;
  scrambleOf: number;
  threePutts: number;
  holesLogged: number;
};

// Only *answered* holes count toward each stat — a hole where the golfer hasn't
// tapped fairway / GIR / putts yet is simply not in the denominator.
export function roundStats(holes: RoundHole[]): RoundStats {
  const scored = holes.filter((h) => h.score != null);
  const strokes = scored.reduce((n, h) => n + (h.score as number), 0);
  const parOfScored = scored.reduce((n, h) => n + h.par, 0);
  const rel = (h: RoundHole) => (h.score as number) - h.par;

  const firHoles = holes.filter((h) => h.par !== 3 && h.fairwayHit != null);
  const firMade = firHoles.filter((h) => h.fairwayHit === true).length;

  const girHoles = holes.filter((h) => h.gir != null);
  const girMade = girHoles.filter((h) => h.gir === true).length;

  const puttHoles = holes.filter((h) => h.putts != null);
  const putts = puttHoles.reduce((n, h) => n + (h.putts as number), 0);

  const missedGreens = holes.filter((h) => h.gir === false);
  const scrHoles = missedGreens.filter((h) => h.upAndDown != null);
  const scrambleMade = scrHoles.filter((h) => h.upAndDown === true).length;

  const threePutts = puttHoles.filter((h) => (h.putts as number) >= 3).length;

  return {
    strokes,
    scoredHoles: scored.length,
    toPar: strokes - parOfScored,
    parOfScored,
    birdies: scored.filter((h) => rel(h) <= -1).length,
    pars: scored.filter((h) => rel(h) === 0).length,
    bogeys: scored.filter((h) => rel(h) === 1).length,
    doubles: scored.filter((h) => rel(h) >= 2).length,
    penalties: holes.reduce((n, h) => n + (h.penalties ?? 0), 0),
    penaltyHoles: holes.filter((h) => (h.penalties ?? 0) > 0).length,
    firPct: firHoles.length ? Math.round((firMade / firHoles.length) * 100) : null,
    firMade,
    firOf: firHoles.length,
    fairwayLeft: holes.filter((h) => h.fairwayMiss === "left").length,
    fairwayRight: holes.filter((h) => h.fairwayMiss === "right").length,
    girPct: girHoles.length ? Math.round((girMade / girHoles.length) * 100) : null,
    girMade,
    girOf: girHoles.length,
    putts,
    puttsOf: puttHoles.length,
    puttsPerHole: puttHoles.length ? Math.round((putts / puttHoles.length) * 10) / 10 : null,
    scramblePct: scrHoles.length ? Math.round((scrambleMade / scrHoles.length) * 100) : null,
    scrambleMade,
    scrambleOf: scrHoles.length,
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
  note?: string;
  // set only when editing an already-saved round — preserved on finish so the
  // save updates in place instead of creating a duplicate
  id?: string;
  createdAt?: number;
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
  const puttsOf = total((s) => s.puttsOf);
  const threePuttTot = total((s) => s.threePutts);

  const firPct = firOf ? (firMade / firOf) * 100 : null;
  const girPct = girOf ? (girMade / girOf) * 100 : null;
  const scrPct = scrOf ? (scrMade / scrOf) * 100 : null;
  const pph = puttsOf ? puttsTot / puttsOf : null;
  const threePuttPer18 = puttsOf ? (threePuttTot / puttsOf) * 18 : 0;
  const threePuttPerRound = threePuttTot / usable.length;

  const firSeries = per.map((s) => s.firPct).filter((x): x is number => x !== null);
  const girSeries = per.map((s) => s.girPct).filter((x): x is number => x !== null);
  const scrSeries = per.map((s) => s.scramblePct).filter((x): x is number => x !== null);
  const pphSeries = per.map((s) => s.puttsPerHole).filter((x): x is number => x !== null);

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

// ===========================================================================
// Approach breakdown — where the shot-detail data (distance bucket logged per
// hole) earns its keep. Splits greens-hit rate by how far out the approach was,
// so "your approach leaks" turns into "your approach leaks from 150+".
// ---------------------------------------------------------------------------

/** Canonical order of the approach-distance buckets captured on a hole. */
export const APPROACH_BUCKETS = ["<75", "75–100", "100–125", "125–150", "150–175", "175+"] as const;

export type ApproachBand = {
  label: string;
  girMade: number;
  girOf: number;       // holes at this range with a green logged
  girPct: number;
  puttsPerHole: number | null;
};

export type ApproachReport = {
  bands: ApproachBand[];   // only ranges with enough attempts, in distance order
  attempts: number;        // holes with both a distance bucket and a GIR answer
  bestLabel: string;
  worstLabel: string;
  worstPct: number;
  spread: number;          // best girPct − worst girPct
};

/**
 * Pool every logged hole that recorded an approach distance bucket AND a GIR
 * answer, then bucket the greens-hit rate by range. Returns null until there's
 * enough to say something — at least two ranges clearing `minPerBand`.
 */
export function approachBreakdown(
  rounds: SavedRound[],
  minPerBand = 2,
): ApproachReport | null {
  const holes = rounds
    .flatMap((r) => r.holeData)
    .filter((h) => h.approachYds && h.gir != null);
  if (holes.length < 4) return null;

  const bands: ApproachBand[] = APPROACH_BUCKETS.map((label) => {
    const hs = holes.filter((h) => h.approachYds === label);
    const girMade = hs.filter((h) => h.gir === true).length;
    const puttHs = hs.filter((h) => h.putts != null);
    const puttsTot = puttHs.reduce((n, h) => n + (h.putts as number), 0);
    return {
      label,
      girMade,
      girOf: hs.length,
      girPct: hs.length ? Math.round((girMade / hs.length) * 100) : 0,
      puttsPerHole: puttHs.length ? Math.round((puttsTot / puttHs.length) * 10) / 10 : null,
    };
  }).filter((b) => b.girOf >= minPerBand);

  if (bands.length < 2) return null;

  const byPct = [...bands].sort((a, b) => a.girPct - b.girPct);
  const worst = byPct[0];
  const best = byPct[byPct.length - 1];

  return {
    bands,
    attempts: holes.length,
    bestLabel: best.label,
    worstLabel: worst.label,
    worstPct: worst.girPct,
    spread: best.girPct - worst.girPct,
  };
}
