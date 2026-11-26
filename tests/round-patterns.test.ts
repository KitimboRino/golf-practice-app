import { describe, expect, it } from "vitest";
import { scoringByPar, blowUps, teeMissSide, fairwaysByTeeClub, frontBack } from "@/lib/roundPatterns";
import { round, hole, session } from "./helpers";

const holes = (spec: [3 | 4 | 5, number][]) => spec.map(([par, score]) => hole({ par, score }));

describe("scoringByPar", () => {
  it("averages strokes over par per par type and names the worst", () => {
    const r = round(holes([[3, 4], [3, 3], [3, 5], [4, 5], [4, 4], [4, 4], [5, 5], [5, 6]]));
    const rep = scoringByPar([r])!;
    expect(rep.rows).toEqual([
      { par: 3, holes: 3, avgOver: 1 },
      { par: 4, holes: 3, avgOver: 0.3 },
    ]); // par 5s: only two holes, left out
    expect(rep.worst).toBe(3);
  });

  it("names no worst par when the gap is under the margin", () => {
    const r = round(holes([[3, 4], [3, 3], [3, 4], [4, 5], [4, 4], [4, 5]])); // +0.7 vs +0.7
    expect(scoringByPar([r])!.worst).toBeNull();
  });

  it("skips unscored holes and needs two pars to compare", () => {
    expect(scoringByPar([round([...holes([[4, 5], [4, 4], [4, 6]]), hole({ par: 3 })])])).toBeNull();
  });
});

describe("blowUps", () => {
  it("counts doubles-or-worse and their cost beyond bogey, per 18", () => {
    // 9 holes: one double (+2, costs 1), one triple (+3, costs 2), 3 penalty strokes
    const r = round([
      hole({ par: 4, score: 6, penalties: 1 }), hole({ par: 4, score: 7, penalties: 2 }),
      ...holes([[4, 4], [4, 5], [3, 3], [5, 5], [4, 4], [4, 5], [3, 4]]),
    ]);
    expect(blowUps([r])).toEqual({ rounds: 1, doublesPerRound: 4, costPerRound: 6, penaltiesPerRound: 6, holes: 9 });
  });

  it("waits for nine scored holes", () => {
    expect(blowUps([round(holes([[4, 7], [4, 4]]))])).toBeNull();
  });
});

describe("teeMissSide", () => {
  const misses = (l: number, r: number) =>
    round([
      ...Array.from({ length: l }, () => hole({ fairwayHit: false, fairwayMiss: "left" })),
      ...Array.from({ length: r }, () => hole({ fairwayHit: false, fairwayMiss: "right" })),
      hole({ fairwayHit: true }),
    ]);

  it("reports the course lean and whether the range leans the same way", () => {
    const s = session({ driving: { fairway: 5, left: 3, right: 7 } });
    expect(teeMissSide([misses(1, 4)], [s])).toEqual({
      left: 1, right: 4, rightPct: 80, rangeRightPct: 70, rangeMisses: 10, same: true,
    });
    const leftRange = session({ driving: { fairway: 5, left: 8, right: 2 } });
    expect(teeMissSide([misses(1, 4)], [leftRange])!.same).toBe(false);
  });

  it("leaves the range out until it has ten misses, and needs four course misses", () => {
    const few = session({ driving: { fairway: 5, left: 2, right: 3 } });
    expect(teeMissSide([misses(2, 2)], [few])).toMatchObject({ rightPct: 50, rangeRightPct: null, same: null });
    expect(teeMissSide([misses(1, 2)], [])).toBeNull();
  });
});

describe("fairwaysByTeeClub", () => {
  it("ranks clubs with three or more answered tee shots", () => {
    const r = round([
      hole({ teeClub: "Driver", fairwayHit: true }), hole({ teeClub: "Driver", fairwayHit: false }),
      hole({ teeClub: "Driver", fairwayHit: false }), hole({ teeClub: "Driver", fairwayHit: false }),
      hole({ teeClub: "3W", fairwayHit: true }), hole({ teeClub: "3W", fairwayHit: true }),
      hole({ teeClub: "3W", fairwayHit: false }),
      hole({ teeClub: "Hybrid", fairwayHit: true }), // only one: left out
      hole({ par: 3, teeClub: "7i", fairwayHit: null }), // par 3: no fairway
    ]);
    expect(fairwaysByTeeClub([r])).toEqual([
      { club: "3W", made: 2, of: 3, pct: 67 },
      { club: "Driver", made: 1, of: 4, pct: 25 },
    ]);
  });

  it("needs two clubs to compare", () => {
    const r = round([1, 2, 3].map(() => hole({ teeClub: "Driver", fairwayHit: true })));
    expect(fairwaysByTeeClub([r])).toBeNull();
  });
});

describe("frontBack", () => {
  const eighteen = (front: number, back: number) =>
    round([
      ...Array.from({ length: 9 }, (_, i) => hole({ par: 4, score: 4 + (i < front ? 1 : 0) })),
      ...Array.from({ length: 9 }, (_, i) => hole({ par: 4, score: 4 + (i < back ? 1 : 0) })),
    ]);

  it("averages each nine's to-par over 18-hole rounds", () => {
    expect(frontBack([eighteen(3, 6), eighteen(4, 5)])).toEqual({ rounds: 2, front: 3.5, back: 5.5, diff: 2 });
  });

  it("ignores 9-hole rounds and needs two full rounds", () => {
    expect(frontBack([eighteen(3, 6), round(holes([[4, 5], [4, 5], [4, 5]]))])).toBeNull();
  });
});
