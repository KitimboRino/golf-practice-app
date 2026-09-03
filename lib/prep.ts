// lib/prep.ts
// Warm-up routine, setup checklist, session flow, and safety note.
// Sourced from the Golf Instruction Reference Handbook.
//
// Suggested uses:
//  1) A "Warm up" step shown before a session starts (checklist the golfer ticks).
//  2) A reference "Prep" tab (warm-up + setup + session flow).
//  3) The session-flow lines as a collapsible coaching note on the Log screen.

export type PrepItem = { name: string; how: string };

export const WARMUP: PrepItem[] = [
  { name: "Shoulders", how: "Hold the club at the bottom of the grip; swing the arm and club in a circle around the shoulder 5–6 times each way, one arm at a time." },
  { name: "Upper arms & sides", how: "Club above your head, feet apart; bend gently to each side." },
  { name: "Back", how: "Hold the club at both ends, bend over with one hand on a knee and turn the other hand and club outward, keeping the shaft roughly parallel to the ground. Repeat the other side." },
  { name: "Legs", how: "One leg in front of the other, front knee bent and back leg straight; let the back heel gently touch down. Both sides." },
  { name: "Ankles & calves", how: "Lift one foot and slowly rotate it. Both legs." },
  { name: "Body turn", how: "Hold the club at both ends behind your neck; turn hips and shoulders while keeping your head as still as possible." },
  { name: "Forearms", how: "Arms out in front, clench fists and rotate the wrists." },
];

export const SETUP_CHECK: PrepItem[] = [
  { name: "Grip", how: "One consistent grip. Overlapping suits longer fingers and balances the hands; interlocking suits shorter or thicker fingers; the 10-finger grip suits weaker hands." },
  { name: "Aim", how: "Feet run parallel to the ball-to-target line. Pick a spot up to a metre ahead of the ball on that line and align to it. Leading edge of the clubface square to the target." },
  { name: "Shoulders", how: "Parallel to the target line — shoulder alignment often decides the downswing path of the hands and club." },
  { name: "Balance", how: "Weight ~50% on each foot, and within each foot split evenly between heel and ball. Test it: feet slightly apart, eyes closed, feel where the weight sits." },
  { name: "Watch the ball", how: "With lots to think about, the thing most often forgotten is simply watching the ball — often the single most valuable point." },
];

export const SESSION_FLOW: string[] = [
  "Warm up properly first. Never start cold.",
  "Ease in — a few relaxed swings, then a few balls off a tee.",
  "Pick one or two focus areas. Don't try to fix everything at once.",
  "Get to the cause, not the symptom — a driver fault often starts in the irons, so fix it there first.",
  "Build up in stages: putting → chipping → pitching → full swing.",
  "Finish on a good shot (or a few clean practice swings). Always leave on a high.",
  "Review what improved and set what the next session will cover.",
];

export const SESSION_PRINCIPLES: string[] = [
  "Keep it simple — one thought at a time. Over-tinkering does more harm than good.",
  "Don't let it drag. Once you're tired you've stopped learning.",
  "Fun and interest = learning. A light, engaged session beats a grim one.",
  "Add a target and a stake to every drill so range reps transfer to the course.",
  "Remove distractions — no phone.",
];

export const SAFETY =
  "Before swinging, be aware of where you're hitting and where others are. Know where you can and can't stand. Take care of yourself and those around you.";
