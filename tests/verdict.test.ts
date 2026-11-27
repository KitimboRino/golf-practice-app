import { describe, expect, it, vi, afterEach } from "vitest";
import { verdict, areaMoves, todaysOneThing, sessionBalls, sessionMinutes, sessionsThisMonth } from "@/lib/verdict";
import { detectFaults } from "@/lib/faults";
import { goalProgress } from "@/lib/goal";
import { session, solidSession, round, hole } from "./helpers";

afterEach(() => vi.useRealTimers());

// irons-only session with n balls, k of them solid
const irons = (k: number, n = 30, over: Parameters<typeof session>[0] = {}) =>
  session({ irons: { solid: k, fat: n - k, thin: 0 }, ...over });

describe("verdict", () => {
  it("needs two sessions with strikes before it says anything", () => {
    expect(verdict([])).toBeNull();
    expect(verdict([solidSession(5)])).toBeNull();
    // putting-only sessions don't count toward the strike verdict
    expect(verdict([solidSession(5), session({ putting: { in: 5, out: 5 } })])).toBeNull();
  });

  it("reads a 20-point swing between two 10-ball sessions as ordinary, not a trend", () => {
    const v = verdict([solidSession(4), solidSession(6)])!;
    expect(v.tone).toBe("flat");
    expect(v.detail).toContain("40% over your earlier sessions, 60% lately");
    expect(v.note).toMatch(/^Early read · 20 balls/);
  });

  it("calls a rise 'up' once it's bigger than luck for the balls behind it", () => {
    const v = verdict([irons(12), irons(12), irons(12), irons(21), irons(21), irons(21)])!;
    expect(v.tone).toBe("up");
    expect(v.detail).toContain("up 30 points: 40% over your earlier sessions, 70% lately");
    expect(v.confidence).toBe(4);
    expect(v.note).toBe("Confident. 180 balls behind this read.");
  });

  it("calls a real drop 'down'", () => {
    const v = verdict([irons(21), irons(21), irons(12), irons(12)])!;
    expect(v.tone).toBe("down");
    expect(v.detail).toContain("down 30 points");
  });

  it("only reads the last six strike sessions", () => {
    const v = verdict([irons(0), irons(15), irons(15), irons(15), irons(15), irons(15), irons(15)])!;
    expect(v.tone).toBe("flat"); // the 0% session has dropped out of the window
  });
});

describe("areaMoves", () => {
  it("flags only moves bigger than luck, biggest gain and biggest slip", () => {
    const hist = [
      session({ putting: { in: 15, out: 15 }, chipping: { bestClub: "", on: 24, off: 6 } }),
      session({ putting: { in: 27, out: 3 }, chipping: { bestClub: "", on: 12, off: 18 } }),
    ];
    const m = areaMoves(hist);
    expect(m.gaining).toMatchObject({ label: "Putting", delta: 40 });
    expect(m.slipping).toMatchObject({ label: "Chipping", delta: -40 });
  });

  it("ignores moves within the noise", () => {
    const hist = [session({ putting: { in: 5, out: 5 } }), session({ putting: { in: 7, out: 3 } })];
    expect(areaMoves(hist)).toEqual({ gaining: undefined, slipping: undefined });
  });

  it("compares putting only at the same distance", () => {
    const at = (inN: number, dist: number) => session({ putting: { in: inN, out: 30 - inN }, setup: { putting: { dist } } });
    // 90% from 3 ft, then 30% from 10 ft: a different test, not a slip
    expect(areaMoves([at(27, 3), at(9, 10)]).slipping).toBeUndefined();
    // the same drop at the same distance is a slip, and says where
    expect(areaMoves([at(27, 3), at(27, 10), at(9, 3)]).slipping).toMatchObject({
      label: "Putting", delta: -60, note: "Down 60 points on your average from 3 ft",
    });
  });
});

describe("todaysOneThing", () => {
  const leakyRound = round(Array.from({ length: 9 }, () => hole({ par: 4, score: 6, gir: false, putts: 3, fairwayHit: false })), { createdAt: 2000 });
  const slicer = session({ driving: { fairway: 3, left: 1, right: 6 }, createdAt: 1000 });

  it("leads with the course leak right after a round", () => {
    expect(todaysOneThing([slicer], [leakyRound])!.source).toMatch(/on-course round/);
  });

  it("leads with the range session when it's the newer one, and keeps the leak in a line", () => {
    const newer = { ...slicer, createdAt: 3000 };
    const one = todaysOneThing([newer], [leakyRound])!;
    expect(one.source).toBe("From your last session");
    expect(one.title).toBe("Starts left, curves hard right.");
    expect(one.body).toMatch(/On the course, .+ is still your biggest leak\.$/);
  });
});

describe("detectFaults", () => {
  it("names fat irons as an irons fault, not a chipping one", () => {
    const hits = detectFaults(session({ irons: { solid: 4, fat: 5, thin: 1 } }));
    expect(hits.map((h) => h.fault.id)).toEqual(["fat-iron"]);
    expect(hits[0].note).toBe("5 of 10 iron shots were fat, hitting the ground first.");
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

  it("reads putting goals at the distance most recently practised", () => {
    const at = (inN: number, dist: number) => session({ putting: { in: inN, out: 10 - inN }, setup: { putting: { dist } } });
    const g = goalProgress([at(9, 3), at(9, 3), at(4, 6), at(5, 6)], { area: "putting", targetPct: 70, createdAt: 0 });
    expect(g).toMatchObject({ currentPct: 45, met: false, dist: 6 });
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
