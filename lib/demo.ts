// Demo mode: a realistic few weeks of history so someone can explore the
// whole app without hitting a ball first (reviewers, curious friends, anyone
// deciding whether to install). Everything is flagged with meta "demo" so
// "Start my own" can wipe it cleanly — demo and real history never mix.
import {
  saveSession, saveRound, saveGameAttempt, setMeta, wipeAll, uuid, emptyStrips,
  type SessionInput, type RoundHole, type Strips,
} from "./db";
import { localDate } from "./date";

const DAY = 86_400_000;
const daysAgo = (n: number) => localDate(new Date(Date.now() - n * DAY));
const rep = (k: string, n: number) => Array<string>(n).fill(k);
// interleave outcomes so the shot strips read like a real session, not
// all the good balls first then all the misses
const mix = (...groups: string[][]): string[] => {
  const out: string[] = [];
  const queues = groups.map((g) => [...g]);
  while (queues.some((q) => q.length)) for (const q of queues) { const v = q.shift(); if (v) out.push(v); }
  return out;
};

type Counts = {
  drive: [number, number, number]; // fairway, left, right
  iron: [number, number, number];  // solid, fat, thin
  chip: [number, number];          // on, off
  pitch: [number, number, number]; // close, short, long
  putt: [number, number];          // in, out
};

function session(weekId: string, label: string, back: number, c: Counts, notes = ""): SessionInput {
  const strips: Strips = {
    ...emptyStrips(),
    driving: mix(rep("fairway", c.drive[0]), rep("right", c.drive[2]), rep("left", c.drive[1])),
    irons: mix(rep("solid", c.iron[0]), rep("fat", c.iron[1]), rep("thin", c.iron[2])),
    chipping: mix(rep("on", c.chip[0]), rep("off", c.chip[1])),
    pitching: mix(rep("close", c.pitch[0]), rep("short", c.pitch[1]), rep("long", c.pitch[2])),
    putting: mix(rep("in", c.putt[0]), rep("out", c.putt[1])),
  };
  const at = Date.now() - back * DAY;
  return {
    id: uuid(), weekId, sessionLabel: label, date: daysAgo(back), notes,
    driving: { fairway: c.drive[0], left: c.drive[1], right: c.drive[2] },
    irons: { solid: c.iron[0], fat: c.iron[1], thin: c.iron[2] },
    chipping: { bestClub: "56°", on: c.chip[0], off: c.chip[1] },
    pitching: { close: c.pitch[0], short: c.pitch[1], long: c.pitch[2] },
    putting: { in: c.putt[0], out: c.putt[1] },
    strips, startedAt: at - 50 * 60_000, createdAt: at,
  };
}

export async function loadDemo(): Promise<void> {
  await wipeAll();
  // three plan sessions trending the right way, a miss that leaks right
  await saveSession(session("week1", "Session 1", 19, { drive: [4, 1, 5], iron: [4, 3, 2], chip: [5, 5], pitch: [4, 4, 2], putt: [5, 5] }));
  await saveSession(session("week1", "Session 2", 15, { drive: [5, 1, 4], iron: [5, 2, 2], chip: [6, 4], pitch: [5, 3, 2], putt: [6, 4] }));
  await saveSession(session("week2", "Session 1", 10, { drive: [6, 1, 3], iron: [6, 2, 1], chip: [7, 3], pitch: [6, 3, 1], putt: [6, 4] },
    "Tempo felt better once I stopped hitting at it."));

  // one 9-hole round: decent off the tee, putting is the leak
  const pars: (3 | 4 | 5)[] = [4, 4, 3, 5, 4, 4, 3, 4, 5];
  const scores = [5, 4, 3, 6, 5, 4, 4, 5, 6];
  const holeData: RoundHole[] = pars.map((par, i) => {
    const gir = scores[i] - par <= 0 || i === 4;
    return {
      par, score: scores[i],
      fairwayHit: par === 3 ? null : i % 3 !== 1,
      fairwayMiss: par !== 3 && i % 3 === 1 ? "right" : undefined,
      gir, putts: i === 3 || i === 7 ? 3 : 2,
      upAndDown: gir ? null : false,
      penalties: 0,
    };
  });
  await saveRound({ id: uuid(), date: daysAgo(6), course: "Uganda Golf Club", holes: 9, holeData, createdAt: Date.now() - 6 * DAY });

  await saveGameAttempt({ id: uuid(), gameId: "par-18", date: daysAgo(8), score: 5, createdAt: Date.now() - 8 * DAY });

  await setMeta("onboardedAt", new Date().toISOString());
  await setMeta("planLevel", "intermediate");
  await setMeta("plannedMiss", "right");
  await setMeta("cursor", { week: 1, session: 1 });
  await setMeta("demo", true);
}

// back to a clean install — the real onboarding starts next
export async function exitDemo(): Promise<void> {
  await wipeAll();
}
