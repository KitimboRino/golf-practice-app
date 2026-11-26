import type { RoundHole, SavedRound, SavedSession } from "@/lib/db";

let n = 0;

// A session with every tally at zero; pass only what the test cares about.
export function session(over: Partial<SavedSession> = {}): SavedSession {
  n++;
  return {
    id: `s${n}`,
    weekId: "week1",
    sessionLabel: "Session 1",
    date: "2026-11-01",
    notes: "",
    driving: { fairway: 0, left: 0, right: 0 },
    irons: { solid: 0, fat: 0, thin: 0 },
    chipping: { bestClub: "", on: 0, off: 0 },
    pitching: { close: 0, short: 0, long: 0 },
    putting: { in: 0, out: 0 },
    createdAt: 1_700_000_000_000 + n,
    updatedAt: 1_700_000_000_000 + n,
    ...over,
  };
}

// solid rate = (fairway + solid) / all strikes; build a session that hits it
export function solidSession(goodOf10: number): SavedSession {
  return session({ irons: { solid: goodOf10, fat: 10 - goodOf10, thin: 0 } });
}

export function hole(over: Partial<RoundHole> = {}): RoundHole {
  return { par: 4, ...over };
}

export function round(holeData: RoundHole[], over: Partial<SavedRound> = {}): SavedRound {
  n++;
  return {
    id: `r${n}`,
    date: "2026-11-01",
    holes: holeData.length > 9 ? 18 : 9,
    holeData,
    createdAt: 1_700_000_000_000 + n,
    updatedAt: 1_700_000_000_000 + n,
    ...over,
  } as SavedRound;
}
