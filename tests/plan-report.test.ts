import { describe, expect, it } from "vitest";
import { areaByDistance, planReport } from "@/lib/planReport";
import { PLANS } from "@/lib/plan";
import { session } from "./helpers";

const putts = (inN: number, out: number, dist?: number) =>
  session({ putting: { in: inN, out }, ...(dist != null ? { setup: { putting: { dist } } } : {}) });

describe("areaByDistance", () => {
  it("pools make rate per target distance, shortest first", () => {
    const rows = areaByDistance([putts(9, 1, 3), putts(8, 2, 3), putts(4, 6, 6), putts(5, 5)], "putting");
    expect(rows).toEqual([
      { dist: 3, made: 17, of: 20, pct: 85, sessions: 2 },
      { dist: 6, made: 4, of: 10, pct: 40, sessions: 1 },
    ]); // the session with no distance picked isn't guessed at
  });

  it("drops thin distances and needs two to compare", () => {
    expect(areaByDistance([putts(9, 1, 3), putts(2, 2, 10)], "putting")).toBeNull();
  });

  it("reads pitching as close / all", () => {
    const s = (close: number, short: number, long: number, dist: number) =>
      session({ pitching: { close, short, long }, setup: { pitching: { dist } } });
    expect(areaByDistance([s(6, 3, 1, 40), s(2, 5, 3, 80)], "pitching")!.map((r) => r.pct)).toEqual([60, 20]);
  });
});

describe("planReport", () => {
  const [w1, , , w4] = PLANS.intermediate;
  const testLabel = w4.sessions.find((s) => /test/i.test(s.label))!.label;
  const all = (pctOf10: [number, number, number, number, number], over: Parameters<typeof session>[0] = {}) => {
    const [d, i, c, p, pu] = pctOf10;
    return session({
      driving: { fairway: d, left: 10 - d, right: 0 }, irons: { solid: i, fat: 10 - i, thin: 0 },
      chipping: { bestClub: "", on: c, off: 10 - c }, pitching: { close: p, short: 10 - p, long: 0 },
      putting: { in: pu, out: 10 - pu }, ...over,
    });
  };

  it("compares the first session with test day in every area", () => {
    const r = planReport([
      all([4, 5, 5, 4, 6], { weekId: w1.id, sessionLabel: w1.sessions[0].label }),
      all([9, 9, 9, 9, 9], { weekId: w1.id, sessionLabel: w1.sessions[1].label }), // not the test: ignored
      all([6, 7, 6, 4, 9], { weekId: w4.id, sessionLabel: testLabel }),
    ], "intermediate")!;
    expect(r.rows.map((x) => [x.area, x.from, x.to, x.tone])).toEqual([
      ["driving", 40, 60, "up"], ["irons", 50, 70, "up"], ["chipping", 50, 60, "up"],
      ["pitching", 40, 40, "flat"], ["putting", 60, 90, "up"],
    ]);
    expect(r).toMatchObject({ improved: 4, slipped: 0, next: "up", nextLevel: "professional", testLogged: true });
    expect(r.best!.area).toBe("putting");
    expect(r.weakest!.area).toBe("pitching");
  });

  it("doesn't count an area with under five balls on either side", () => {
    const r = planReport([
      all([4, 5, 5, 4, 6], { weekId: w1.id, sessionLabel: w1.sessions[0].label }),
      all([6, 7, 6, 4, 9], { weekId: w4.id, sessionLabel: testLabel, chipping: { bestClub: "", on: 2, off: 0 } }),
    ], "intermediate")!;
    const chip = r.rows.find((x) => x.area === "chipping")!;
    expect(chip).toMatchObject({ from: 50, to: 100, delta: null, thin: true });
    expect(r.improved).toBe(3);
    expect(r.best!.area).toBe("putting");
  });

  it("compares putting at test day's distance, never 3 ft against 6 ft", () => {
    const putt = (inN: number, dist: number, over: Parameters<typeof session>[0]) =>
      session({ putting: { in: inN, out: 10 - inN }, setup: { putting: { dist } }, ...over });
    const s1 = putt(8, 3, { weekId: w1.id, sessionLabel: w1.sessions[0].label });
    const test = putt(7, 6, { weekId: w4.id, sessionLabel: testLabel });
    // only a 3 ft session before: shown, labelled, not counted
    const only = planReport([s1, test], "intermediate")!.rows.find((x) => x.area === "putting")!;
    expect(only).toMatchObject({ from: 80, to: 70, delta: null, otherDistance: true });
    // with an earlier 6 ft session, that's the comparison: 40% to 70%, a gain
    const s2 = putt(4, 6, { weekId: w1.id, sessionLabel: w1.sessions[1].label });
    const both = planReport([s1, s2, test], "intermediate")!.rows.find((x) => x.area === "putting")!;
    expect(both).toMatchObject({ from: 40, to: 70, delta: 30, tone: "up", dist: 6, otherDistance: false });
  });

  it("suggests running the plan again when little moved", () => {
    const r = planReport([
      all([5, 5, 5, 5, 5], { weekId: w1.id, sessionLabel: w1.sessions[0].label }),
      all([5, 5, 5, 5, 6], { weekId: w4.id, sessionLabel: testLabel }), // only putting moved
    ], "intermediate")!;
    expect(r.improved).toBe(1);
    expect(r.next).toBe("repeat");
  });

  it("never suggests moving up from Professional, and ignores other levels' sessions", () => {
    const [p1, , , p4] = PLANS.professional;
    const pTest = p4.sessions.find((s) => /test/i.test(s.label))!.label;
    const r = planReport([
      all([1, 1, 1, 1, 1], { weekId: w1.id, sessionLabel: w1.sessions[0].label }), // intermediate
      all([4, 4, 4, 4, 4], { weekId: p1.id, sessionLabel: p1.sessions[0].label }),
      all([8, 8, 8, 8, 8], { weekId: p4.id, sessionLabel: pTest }),
    ], "professional")!;
    expect(r.rows[0].from).toBe(40);
    expect(r.next).toBe("hold");
    expect(r.nextLevel).toBeNull();
  });
});
