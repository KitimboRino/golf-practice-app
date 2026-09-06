// First-run flow (v2 handoff, turn 3): deal → practice → read → reveal.
// Additions only — the read writes the same `plannedMiss` profile field the quiz wrote,
// so the plan builder needs no change.

export type OnbStage = "deal" | "practice" | "read" | "reveal" | "done";

export type Onboarding = { stage: OnbStage; practiceTaps: number };
export const FRESH_ONB: Onboarding = { stage: "deal", practiceTaps: 0 };

// session zero — where each tee ball started
export type Shot = "fairway" | "left" | "right";
export type ReadSession = { shots: Shot[]; completedAt: number };

export const READ_TARGET = 10;
export const READ_MIN = 6; // below this, offer to finish next time

export type Read = {
  miss: "right" | "left" | "varies";
  verdict: string;
  counts: { right: number; left: number; fairway: number; total: number };
  explanation: string;
  provenance: string | null;
  early: boolean;
  confident: boolean;
};

const count = (a: Shot[], k: Shot) => a.reduce((n, x) => (x === k ? n + 1 : n), 0);
const misses = (a: Shot[]) => a.filter((x) => x !== "fairway").length;

// map the 10-ball read onto a miss + a plain-language sentence the user couldn't have written
export function readFrom(shots: Shot[]): Read {
  const total = shots.length;
  const right = count(shots, "right");
  const left = count(shots, "left");
  const fairway = count(shots, "fairway");
  const counts = { right, left, fairway, total };
  const early = total < 8; // 8+ is a full-confidence read
  const confident = total >= 8;
  // did it fall apart late? (only claim this when we can actually see it)
  const fadesLate =
    total >= 8 && misses(shots.slice(-3)) >= 2 && misses(shots.slice(-3)) > misses(shots.slice(0, 3));

  const missed = right + left;
  const dirEdge = Math.abs(right - left);

  // straight enough that there's no clear directional fault
  if (total > 0 && (missed <= 2 || (dirEdge <= 1 && fairway >= missed))) {
    return {
      miss: "varies",
      verdict: fairway >= total * 0.6 ? "You're straighter than you think." : "No one clear miss yet.",
      counts,
      explanation:
        fairway >= total * 0.6
          ? `${fairway} of ${total} started on your line. There's no slice or hook to chase. The balanced plan sharpens everything a notch.`
          : `The misses went both ways (${left} left, ${right} right). That reads as timing, not a swing fault. The balanced plan settles it down.`,
      provenance: null,
      early,
      confident,
    };
  }

  if (right >= left) {
    return {
      miss: "right",
      verdict: "You lose it right.",
      counts,
      explanation:
        `${right} of ${total} leaked right.${fadesLate ? " The last few were the worst, so it's a slice that grows as you tire." : ""} One fault, not five.`,
      provenance: "Field guide p.162 · slice",
      early,
      confident,
    };
  }

  return {
    miss: "left",
    verdict: "You lose it left.",
    counts,
    explanation:
      `${left} of ${total} leaked left${fadesLate ? ", worse as the session went on" : ""}. A hook that curves or a pull that starts there. Either way it's one start-line fault.`,
    provenance: "Field guide p.163 · hook",
    early,
    confident,
  };
}

// the four-week framing shown on the reveal, per detected miss
export function planFraming(miss: Read["miss"]): { thesis: string; rows: [string, string][] } {
  if (miss === "right" || miss === "left") {
    return {
      thesis: "Square the start line, then hold it when you're tired.",
      rows: [
        ["Weeks 1-2 · Aim", "4 sessions"],
        ["Week 3 · Path", "2 sessions"],
        ["Week 4 · Re-test", "Same ten balls"],
      ],
    };
  }
  return {
    thesis: "Groove clean contact and a repeatable start line across every area.",
    rows: [
      ["Weeks 1-2 · Foundations", "4 sessions"],
      ["Week 3 · Pressure", "2 sessions"],
      ["Week 4 · Re-test", "Same ten balls"],
    ],
  };
}
