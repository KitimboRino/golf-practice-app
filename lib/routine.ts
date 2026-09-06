// A short pre-shot routine to groove until it runs without you thinking about it.
// This is a coaching aid, not a tracker — reorder, reword or trim these freely.

export type RoutineStep = {
  key: string;
  title: string;
  cue: string;   // one calm line of guidance
};

export const ROUTINE: RoutineStep[] = [
  {
    key: "behind",
    title: "Stand behind the ball",
    cue: "Take your view from directly behind, looking down the line to the target.",
  },
  {
    key: "target",
    title: "Pick a specific target",
    cue: "Not “the green” — a leaf, a patch, a spot. Smaller is better.",
  },
  {
    key: "see",
    title: "See the shot",
    cue: "Watch the ball start, curve, land and settle. One clear picture.",
  },
  {
    key: "rehearsal",
    title: "One rehearsal swing",
    cue: "A single swing that feels the shot you just saw. Then step in.",
  },
  {
    key: "commit",
    title: "Commit — no second thoughts",
    cue: "The decision is made. Any doubt, step off and start the routine again.",
  },
  {
    key: "trust",
    title: "Trust it",
    cue: "Look at the target, look at the ball, swing. No steering.",
  },
];

// meta store key for the optional "times rehearsed" count
export const ROUTINE_REPS_KEY = "routineReps";
