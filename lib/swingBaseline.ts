import type { SwingPhase } from "./db";

// Stage 2's baseline — NOT derived from real swing footage (no reference
// clips were sourced; see the plan doc). These are rough ranges synthesized
// from published amateur-golfer figures across several instruction sources:
// GOLFTEC's shoulder/hip-turn benchmarks, SwingTRU's shoulder-tilt data, the
// Titleist Performance Institute's X-Factor figure, and Mottram & Pirozzolo
// (1994) on hip/shoulder rotation. These sources disagree with each other by
// a wide margin — e.g. published amateur shoulder turn at the top ranges
// from the mid-70s to high-80s depending on the source and method — so
// these are deliberately wide bands, not precise targets.
//
// More fundamentally: all of those figures come from 3D motion-capture or
// force-plate labs. This app measures a 2D angle from a single phone camera
// image, which is a genuinely different, cruder measurement — rotation
// toward or away from the camera reads as less turn than it really is. Don't
// expect close correspondence to a lab figure; this is a rough compass
// heading, not a protractor.
export type AngleRange = { min: number; max: number };
export type PhaseBaseline = {
  spineTiltDeg: AngleRange;
  shoulderTurnDeg: AngleRange;
  hipTurnDeg: AngleRange;
};

// shoulderTurnDeg/hipTurnDeg are relative to address (this app's own
// definition — see lib/swingAngles.ts), so address itself is ~0 by
// construction; the small range there is just measurement noise, not a
// meaningful target.
export const SWING_BASELINE: Record<SwingPhase, PhaseBaseline> = {
  address: {
    spineTiltDeg: { min: 28, max: 42 },
    shoulderTurnDeg: { min: 0, max: 8 },
    hipTurnDeg: { min: 0, max: 8 },
  },
  top: {
    spineTiltDeg: { min: 25, max: 40 },
    shoulderTurnDeg: { min: 65, max: 88 },
    hipTurnDeg: { min: 20, max: 48 },
  },
  impact: {
    spineTiltDeg: { min: 20, max: 35 },
    shoulderTurnDeg: { min: 10, max: 30 },
    hipTurnDeg: { min: 20, max: 40 },
  },
  finish: {
    spineTiltDeg: { min: 5, max: 20 },
    shoulderTurnDeg: { min: 70, max: 100 },
    hipTurnDeg: { min: 60, max: 90 },
  },
};

export type RangeStatus = "low" | "in" | "high";

export function statusFor(value: number, range: AngleRange): RangeStatus {
  if (value < range.min) return "low";
  if (value > range.max) return "high";
  return "in";
}
