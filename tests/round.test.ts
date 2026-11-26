import { describe, expect, it } from "vitest";
import { roundStats, leakReport, roundLabel, freshHoles } from "@/lib/round";
import { hole, round } from "./helpers";

describe("roundStats", () => {
  it("scores only the holes with a score entered", () => {
    const s = roundStats([
      hole({ par: 4, score: 5 }),
      hole({ par: 3, score: 3 }),
      hole({ par: 5, score: 4 }),
      hole({ par: 4 }), // not played yet
    ]);
    expect(s.strokes).toBe(12);
    expect(s.scoredHoles).toBe(3);
    expect(s.parOfScored).toBe(12);
    expect(s.toPar).toBe(0);
    expect([s.birdies, s.pars, s.bogeys, s.doubles]).toEqual([1, 1, 1, 0]);
    expect(s.holesLogged).toBe(4);
  });

  it("counts double bogey or worse as doubles", () => {
    const s = roundStats([hole({ par: 4, score: 6 }), hole({ par: 3, score: 7 })]);
    expect(s.doubles).toBe(2);
    expect(s.toPar).toBe(6);
  });

  it("leaves par 3s and unanswered holes out of fairways", () => {
    const s = roundStats([
      hole({ par: 4, fairwayHit: true }),
      hole({ par: 5, fairwayHit: false, fairwayMiss: "left" }),
      hole({ par: 4, fairwayHit: false, fairwayMiss: "right" }),
      hole({ par: 3, fairwayHit: null }),
      hole({ par: 4 }), // no answer
    ]);
    expect(s.firOf).toBe(3);
    expect(s.firMade).toBe(1);
    expect(s.firPct).toBe(33);
    expect([s.fairwayLeft, s.fairwayRight]).toEqual([1, 1]);
  });

  it("ignores a stale fairway miss left on a par 3", () => {
    const s = roundStats([hole({ par: 3, fairwayHit: false, fairwayMiss: "left" })]);
    expect(s.firOf).toBe(0);
    expect(s.fairwayLeft).toBe(0);
    expect(s.firPct).toBeNull();
  });

  it("works out greens, putts, three-putts and scrambling", () => {
    const s = roundStats([
      hole({ gir: true, putts: 2 }),
      hole({ gir: true, putts: 3 }),
      hole({ gir: false, putts: 1, upAndDown: true }),
      hole({ gir: false, putts: 2, upAndDown: false }),
      hole({ gir: false }), // scramble not answered
    ]);
    expect(s.girOf).toBe(5);
    expect(s.girMade).toBe(2);
    expect(s.girPct).toBe(40);
    expect(s.putts).toBe(8);
    expect(s.puttsOf).toBe(4);
    expect(s.puttsPerHole).toBe(2);
    expect(s.threePutts).toBe(1);
    expect(s.scrambleOf).toBe(2);
    expect(s.scrambleMade).toBe(1);
    expect(s.scramblePct).toBe(50);
  });

  it("returns nulls, not zeros, when nothing was answered", () => {
    const s = roundStats(freshHoles(9));
    expect(s.firPct).toBeNull();
    expect(s.girPct).toBeNull();
    expect(s.puttsPerHole).toBeNull();
    expect(s.scramblePct).toBeNull();
    expect(s.strokes).toBe(0);
  });

  it("totals penalty strokes and the holes that took them", () => {
    const s = roundStats([hole({ penalties: 2 }), hole({ penalties: 0 }), hole({ penalties: 1 }), hole()]);
    expect(s.penalties).toBe(3);
    expect(s.penaltyHoles).toBe(2);
  });
});

describe("freshHoles", () => {
  it("makes par-4 holes with nothing pre-answered", () => {
    const h = freshHoles(18);
    expect(h).toHaveLength(18);
    expect(h.every((x) => x.par === 4 && x.score === undefined && x.gir === undefined)).toBe(true);
  });
});

describe("roundLabel", () => {
  it("uses the course name, or the hole count when there isn't one", () => {
    expect(roundLabel(round([hole()], { course: "  Uganda Golf Club " }))).toBe("Uganda Golf Club");
    expect(roundLabel(round(freshHoles(9), { course: "" }))).toBe("9-hole round");
  });
});

describe("leakReport", () => {
  it("returns null with no usable rounds", () => {
    expect(leakReport([])).toBeNull();
    expect(leakReport([round([])])).toBeNull();
  });

  it("names approach as the worst leak when greens are well under benchmark", () => {
    // fairways and scrambling at benchmark, greens at 0%, putting fine
    const holes = Array.from({ length: 9 }, (_, i) =>
      hole({
        par: 4,
        score: 5,
        fairwayHit: i < 4, // 44% ≈ 45 benchmark
        gir: false,
        upAndDown: i < 3, // 33% ≥ 30 benchmark
        putts: 2,
      }),
    );
    // 2.0 putts a hole is just over 1.9, so make the putting look healthy
    holes.forEach((h, i) => { if (i < 2) h.putts = 1; });
    const r = leakReport([round(holes)])!;
    expect(r.rounds).toBe(1);
    expect(r.holes).toBe(9);
    expect(r.hasTrend).toBe(false);
    expect(r.worstKey).toBe("approach");
    expect(r.categories[0].key).toBe("approach");
    expect(r.categories[0].status).toBe("below");
    expect(r.categories[0].costPerRound).toBeGreaterThan(0);
  });

  it("marks a category with no data as not measurable", () => {
    const r = leakReport([round([hole({ score: 4 })])])!;
    const driving = r.categories.find((c) => c.key === "driving")!;
    expect(driving.status).toBe("na");
    expect(driving.value).toBeNull();
  });

  it("only claims a trend with two or more rounds", () => {
    const r = leakReport([round([hole({ gir: true })]), round([hole({ gir: false })])])!;
    expect(r.hasTrend).toBe(true);
  });
});
