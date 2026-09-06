import { GameAttempt } from "./db";

// ---------------------------------------------------------------------------
// Scored practice games — the "practise with consequence" principle turned into
// actual challenges. Each game boils down to a single number the golfer records;
// the app keeps their personal best so they compete against themselves over
// time. Everything here is meant to be edited — add games, reword the rules,
// move the targets.
// ---------------------------------------------------------------------------

export type GameArea = "putting" | "chipping" | "pitching" | "driving";

export type Game = {
  id: string;
  name: string;
  area: GameArea;
  attempts: number;   // shots/putts in one run — also the highest possible score
  rules: string;      // how to play, kept short
  scoring: string;    // the number the golfer writes down
  target?: number;    // an optional score worth aiming for
};

export const GAMES: Game[] = [
  {
    id: "par-18",
    name: "Par 18",
    area: "putting",
    attempts: 9,
    rules:
      "Pick nine putts of mixed length — a few inside 4ft, a few from 10-15ft, a " +
      "couple of long ones. One roll at each, no do-overs. Count the ones you hole.",
    scoring: "Putts holed out of 9",
    target: 6,
  },
  {
    id: "up-and-down",
    name: "Up & Down challenge",
    area: "chipping",
    attempts: 10,
    rules:
      "Drop ten balls in different spots around the green — rough, fringe, bunker, " +
      "bare lies. One chip and one putt each. Count the up-and-downs.",
    scoring: "Up-and-downs out of 10",
    target: 5,
  },
  {
    id: "distance-ladder",
    name: "Distance ladder",
    area: "pitching",
    attempts: 5,
    rules:
      "Set five markers at stepped distances (e.g. 20, 30, 40, 50, 60 yards). One " +
      "pitch to each. Count how many finish within a club-length of their marker.",
    scoring: "Pitches inside a club-length, out of 5",
    target: 3,
  },
  {
    id: "fairway-finder",
    name: "Fairway finder",
    area: "driving",
    attempts: 10,
    rules:
      "Ten drives at one fairway — commit to a target line and a realistic width " +
      "before you start. Play each ball as it lies in your head. Count the fairways.",
    scoring: "Fairways hit out of 10",
    target: 6,
  },
];

export const gameById = (id: string): Game | undefined => GAMES.find((g) => g.id === id);

export const GAME_AREA: Record<GameArea, { label: string; icon: string }> = {
  putting:  { label: "Putting",  icon: "adjust" },
  chipping: { label: "Chipping", icon: "swipe_up" },
  pitching: { label: "Pitching", icon: "arrow_outward" },
  driving:  { label: "Driving",  icon: "sports_golf" },
};

// ---------------------------------------------------------------------------

export type GamePB = {
  best: number | null;
  attempts: number;
  lastScore: number | null;
  lastDate: string | null;
};

export function gamePB(attempts: GameAttempt[]): GamePB {
  if (!attempts.length) return { best: null, attempts: 0, lastScore: null, lastDate: null };
  const byTime = [...attempts].sort((a, b) => a.createdAt - b.createdAt);
  const last = byTime[byTime.length - 1];
  return {
    best: Math.max(...attempts.map((a) => a.score)),
    attempts: attempts.length,
    lastScore: last.score,
    lastDate: last.date,
  };
}

// higher is always better here (every game is a count of successes)
export const isPersonalBest = (score: number, priorAttempts: GameAttempt[]): boolean =>
  !priorAttempts.length || score > Math.max(...priorAttempts.map((a) => a.score));
