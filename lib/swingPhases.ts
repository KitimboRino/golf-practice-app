import type { Keypoint } from "@tensorflow-models/pose-detection";

export type PoseFrame = { keypoints: Keypoint[]; t: number }; // t = ms from clip start

const MIN_SCORE = 0.3;

function leadWristY(frame: PoseFrame): number | null {
  // Lead arm = left arm for a right-handed golfer, the only orientation this
  // first pass assumes. A left-handed toggle is a reasonable later addition.
  const w = frame.keypoints.find((k) => k.name === "left_wrist");
  if (!w || (w.score ?? 0) < MIN_SCORE) return null;
  return w.y; // pixel space — smaller y is higher on screen
}

export type PhaseIndices = { address: number; top: number; impact: number; finish: number };

// Simple heuristic over the lead wrist's height, not a trained model (no
// labeled swing data exists to train one — see the plan doc). Address is the
// first stable low point early in the clip; top is the highest point the
// wrist reaches; impact is the fastest return toward address height after
// the top; finish is where the motion settles afterward. Approximate by
// design — documented here, not hidden.
export function detectPhases(frames: PoseFrame[]): PhaseIndices | null {
  const ys = frames.map(leadWristY);
  const valid = ys
    .map((y, i) => (y == null ? null : i))
    .filter((i): i is number => i != null);
  if (valid.length < 8) return null; // not enough confidently-tracked frames

  const firstThird = valid.filter((i) => i < frames.length / 3);
  const addressPool = firstThird.length ? firstThird : valid;
  const address = addressPool.reduce((best, i) => (ys[i]! > ys[best]! ? i : best), addressPool[0]);

  const top = valid.reduce((best, i) => (ys[i]! < ys[best]! ? i : best), valid[0]);

  const afterTop = valid.filter((i) => i > top);
  if (!afterTop.length) return null;
  let impact = afterTop[0];
  let bestScore = -Infinity;
  for (let n = 1; n < afterTop.length; n++) {
    const i = afterTop[n];
    const prev = afterTop[n - 1];
    const velocity = Math.abs(ys[i]! - ys[prev]!);
    const closenessToAddress = -Math.abs(ys[i]! - ys[address]!);
    const score = velocity + closenessToAddress;
    if (score > bestScore) { bestScore = score; impact = i; }
  }

  const afterImpact = valid.filter((i) => i > impact);
  const finish = afterImpact.length ? afterImpact[afterImpact.length - 1] : valid[valid.length - 1];

  if (!(address < top && top < impact && impact <= finish)) return null;
  return { address, top, impact, finish };
}
