import { SavedSession, AreaKey } from "./db";
import { AREA_RATES } from "./verdict";

export type Goal = { area: AreaKey; targetPct: number; byDate?: string; createdAt: number };

export type GoalProgress = {
  currentPct: number | null; // null when the goal's area has never been logged
  met: boolean;
  daysLeft: number | null;   // null when no by-date was set; negative once overdue
};

// "Current" is the average of the last 3 sessions that logged the goal's
// area, not just the latest one — a goal is about a trend, and a single
// session swings too much to tell someone they've already hit (or missed)
// a target they set for themselves.
export function goalProgress(history: SavedSession[], goal: Goal): GoalProgress {
  const def = AREA_RATES.find((a) => a.key === goal.area);
  const vals = def
    ? history.map((s) => def.rate(s)).filter((v): v is number => v !== null).slice(-3)
    : [];
  const currentPct = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  const met = currentPct !== null && currentPct >= goal.targetPct;

  let daysLeft: number | null = null;
  if (goal.byDate) {
    const ms = new Date(goal.byDate + "T00:00:00").getTime() - new Date().setHours(0, 0, 0, 0);
    daysLeft = Math.round(ms / 86_400_000);
  }
  return { currentPct, met, daysLeft };
}
