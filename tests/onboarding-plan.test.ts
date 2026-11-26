import { describe, expect, it, vi, afterEach } from "vitest";
import { readFrom, type Shot } from "@/lib/onboarding";
import { PLANS, levelOfWeek, isTestDay, planSlotKeysFor, type Level } from "@/lib/plan";
import { localDate } from "@/lib/date";

const shots = (s: string): Shot[] =>
  [...s].map((c) => (c === "R" ? "right" : c === "L" ? "left" : "fairway"));

describe("readFrom (the ten-ball read)", () => {
  it("reads a mostly-right pattern as a slice", () => {
    const r = readFrom(shots("RRFRRFRRLR"));
    expect(r.miss).toBe("right");
    expect(r.counts).toEqual({ right: 7, left: 1, fairway: 2, total: 10 });
    expect(r.confident).toBe(true);
    expect(r.provenance).toContain("slice");
  });

  it("reads a mostly-left pattern as a hook", () => {
    const r = readFrom(shots("LLFLLRLFLL"));
    expect(r.miss).toBe("left");
    expect(r.provenance).toContain("hook");
  });

  it("says 'straighter than you think' when two or fewer missed", () => {
    const r = readFrom(shots("FFFFRFFFLF"));
    expect(r.miss).toBe("varies");
    expect(r.verdict).toBe("You're straighter than you think.");
  });

  it("calls even two-way misses timing, not a fault", () => {
    const r = readFrom(shots("LRFFLRFFFF"));
    expect(r.miss).toBe("varies");
  });

  it("only claims 'worse as you tire' when the last three are worse than the first", () => {
    expect(readFrom(shots("FFFRRFRFRR")).explanation).toContain("grows as you tire");
    expect(readFrom(shots("RRRFRFRFRF")).explanation).not.toContain("grows as you tire");
  });

  it("flags a short read as early, not confident", () => {
    const r = readFrom(shots("RRRRFR"));
    expect(r.early).toBe(true);
    expect(r.confident).toBe(false);
  });
});

describe("plans", () => {
  const levels = Object.keys(PLANS) as Level[];

  it("every level is a four-week plan ending in a test day", () => {
    for (const l of levels) {
      const weeks = PLANS[l];
      expect(weeks).toHaveLength(4);
      const last = weeks[weeks.length - 1];
      expect(last.sessions.some((s) => isTestDay(last.id, s.label))).toBe(true);
      // test days only exist in the final week
      for (const w of weeks.slice(0, -1)) {
        expect(w.sessions.some((s) => isTestDay(w.id, s.label))).toBe(false);
      }
    }
  });

  it("week ids are unique across levels, so a saved session maps to one level", () => {
    const ids = levels.flatMap((l) => PLANS[l].map((w) => w.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of levels) for (const w of PLANS[l]) expect(levelOfWeek(w.id)).toBe(l);
    expect(levelOfWeek("adhoc")).toBeUndefined();
  });

  it("every slot key in a level is unique", () => {
    for (const l of levels) {
      const keys = planSlotKeysFor(l);
      expect(keys.length).toBeGreaterThan(0);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});

describe("localDate", () => {
  afterEach(() => vi.useRealTimers());

  it("formats the local calendar date, zero-padded", () => {
    expect(localDate(new Date(2026, 0, 5, 12))).toBe("2026-01-05");
  });

  it("stays on the local day just after midnight (not the UTC date)", () => {
    // 00:30 local is still the previous day in UTC for any zone east of GMT
    expect(localDate(new Date(2026, 10, 26, 0, 30))).toBe("2026-11-26");
    expect(localDate(new Date(2026, 10, 26, 23, 59))).toBe("2026-11-26");
  });
});
