import { describe, expect, it, vi, afterEach } from "vitest";
import { verdict, areaMoves, sessionBalls, sessionMinutes, sessionsThisMonth } from "@/lib/verdict";
import { goalProgress } from "@/lib/goal";
import { session, solidSession } from "./helpers";

afterEach(() => vi.useRealTimers());

describe("verdict", () => {
  it("needs two sessions with strikes before it says anything", () => {
    expect(verdict([])).toBeNull();
    expect(verdict([solidSession(5)])).toBeNull();
    // putting-only sessions don't count toward the strike verdict
    expect(verdict([solidSession(5), session({ putting: { in: 5, out: 5 } })])).toBeNull();
  });

  it("calls a rise of 5+ points 'up'", () => {
    const v = verdict([solidSession(4), solidSession(5), solidSession(6)])!;
    expect(v.tone).toBe("up");
    expect(v.detail).toContain("climbed 20 points over 3 sessions");
    expect(v.confidence).toBe(3);
    expect(v.note).toContain("1 more session to be certain");
  });

  it("calls a drop of 5+ points 'down'", () => {
    const v = verdict([solidSession(8), solidSession(6)])!;
    expect(v.tone).toBe("down");
    expect(v.detail).toContain("down 20 points");
  });

  it("calls anything inside ±5 'flat'", () => {
    expect(verdict([solidSession(5), solidSession(5)])!.tone).toBe("flat");
  });

  it("only reads the last four strike sessions, and is confident at four", () => {
    const v = verdict([solidSession(0), solidSession(5), solidSession(5), solidSession(5), solidSession(5)])!;
    expect(v.tone).toBe("flat"); // the 0% session has dropped out of the window
    expect(v.confidence).toBe(4);
    expect(v.note).toBe("Confident. Four sessions of signal.");
  });
});

describe("areaMoves", () => {
  it("reports the biggest gain and the biggest slip of 6+ points", () => {
    const hist = [
      session({ putting: { in: 5, out: 5 }, chipping: { bestClub: "", on: 8, off: 2 } }),
      session({ putting: { in: 9, out: 1 }, chipping: { bestClub: "", on: 5, off: 5 } }),
    ];
    const m = areaMoves(hist);
    expect(m.gaining).toMatchObject({ label: "Putting", delta: 40 });
    expect(m.slipping).toMatchObject({ label: "Chipping", delta: -30 });
  });

  it("ignores small moves and areas not logged this time", () => {
    const hist = [
      session({ putting: { in: 5, out: 5 }, driving: { fairway: 5, left: 5, right: 0 } }),
      session({ putting: { in: 11, out: 9 } }), // 55%: only +5; driving not logged
    ];
    expect(areaMoves(hist)).toEqual({ gaining: undefined, slipping: undefined });
  });
});

describe("session totals", () => {
  it("counts every ball across all five areas", () => {
    const s = session({
      driving: { fairway: 1, left: 1, right: 1 },
      irons: { solid: 2, fat: 0, thin: 1 },
      chipping: { bestClub: "", on: 1, off: 1 },
      pitching: { close: 1, short: 1, long: 0 },
      putting: { in: 3, out: 0 },
    });
    expect(sessionBalls(s)).toBe(13);
  });

  it("gives a duration only when it's plausible", () => {
    expect(sessionMinutes(session({ startedAt: undefined }))).toBeNull();
    expect(sessionMinutes(session({ startedAt: 0, createdAt: 45 * 60000 }))).toBeNull(); // startedAt 0 is "unset"
    expect(sessionMinutes(session({ startedAt: 1_000, createdAt: 1_000 + 45 * 60000 }))).toBe(45);
    expect(sessionMinutes(session({ startedAt: 1_000, createdAt: 1_000 + 11 * 3600000 }))).toBeNull();
  });

  it("counts this month's sessions by local date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 26, 9, 0));
    const hist = [session({ date: "2026-11-01" }), session({ date: "2026-11-30" }), session({ date: "2026-10-31" }), session({ date: "nonsense" })];
    expect(sessionsThisMonth(hist)).toBe(2);
  });
});

describe("goalProgress", () => {
  it("averages the last three sessions that logged the goal's area", () => {
    const hist = [
      session({ putting: { in: 0, out: 10 } }), // too old to count
      session({ putting: { in: 6, out: 4 } }),
      session({ chipping: { bestClub: "", on: 1, off: 0 } }), // no putting: skipped
      session({ putting: { in: 7, out: 3 } }),
      session({ putting: { in: 8, out: 2 } }),
    ];
    const g = goalProgress(hist, { area: "putting", targetPct: 70, createdAt: 0 });
    expect(g.currentPct).toBe(70);
    expect(g.met).toBe(true);
    expect(g.daysLeft).toBeNull();
  });

  it("is null and unmet when the area was never logged", () => {
    const g = goalProgress([session()], { area: "driving", targetPct: 50, createdAt: 0 });
    expect(g).toEqual({ currentPct: null, met: false, daysLeft: null });
  });

  it("counts days left to the by-date, negative once overdue", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 26, 18, 30));
    expect(goalProgress([], { area: "irons", targetPct: 60, byDate: "2026-12-06", createdAt: 0 }).daysLeft).toBe(10);
    expect(goalProgress([], { area: "irons", targetPct: 60, byDate: "2026-11-24", createdAt: 0 }).daysLeft).toBe(-2);
  });
});
