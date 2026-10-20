import type { Keypoint } from "@tensorflow-models/pose-detection";
import type { SwingMeasurement, SwingPhase } from "./db";
import type { PhaseIndices, PoseFrame } from "./swingPhases";

const MIN_SCORE = 0.3;
type Pt = { x: number; y: number };

function kp(keypoints: Keypoint[], name: string): Keypoint | undefined {
  const k = keypoints.find((x) => x.name === name);
  return k && (k.score ?? 0) >= MIN_SCORE ? k : undefined;
}
function mid(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}
// 0deg = perfectly upright; image y grows downward.
function angleFromVertical(top: Pt, bottom: Pt): number {
  return (Math.atan2(top.x - bottom.x, -(top.y - bottom.y)) * 180) / Math.PI;
}
function angleFromHorizontal(a: Pt, b: Pt): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

type RawAngles = { spineTiltDeg: number; shoulderAngle: number; hipAngle: number };

function rawAnglesAt(keypoints: Keypoint[]): RawAngles | null {
  const ls = kp(keypoints, "left_shoulder"), rs = kp(keypoints, "right_shoulder");
  const lh = kp(keypoints, "left_hip"), rh = kp(keypoints, "right_hip");
  if (!ls || !rs || !lh || !rh) return null;
  return {
    spineTiltDeg: Math.round(Math.abs(angleFromVertical(mid(ls, rs), mid(lh, rh)))),
    shoulderAngle: angleFromHorizontal(ls, rs),
    hipAngle: angleFromHorizontal(lh, rh),
  };
}

const PHASE_ORDER: SwingPhase[] = ["address", "top", "impact", "finish"];

// Shoulder/hip "turn" is expressed relative to the address frame's own
// orientation — the camera's absolute angle is arbitrary, but the change
// from address is what's meaningful. Returns null (not a guess) if any
// phase's keypoints weren't confident enough to trust.
export function measurePhases(
  frames: PoseFrame[],
  phases: PhaseIndices,
  thumbnails: Record<SwingPhase, string>,
): Record<SwingPhase, SwingMeasurement> | null {
  const indices: Record<SwingPhase, number> = {
    address: phases.address, top: phases.top, impact: phases.impact, finish: phases.finish,
  };

  const addressRaw = rawAnglesAt(frames[indices.address].keypoints);
  if (!addressRaw) return null;

  const out: Partial<Record<SwingPhase, SwingMeasurement>> = {};
  for (const phase of PHASE_ORDER) {
    const raw = rawAnglesAt(frames[indices[phase]].keypoints);
    if (!raw) return null;
    out[phase] = {
      spineTiltDeg: raw.spineTiltDeg,
      shoulderTurnDeg: Math.round(Math.abs(raw.shoulderAngle - addressRaw.shoulderAngle)),
      hipTurnDeg: Math.round(Math.abs(raw.hipAngle - addressRaw.hipAngle)),
      thumbnailDataUrl: thumbnails[phase],
    };
  }
  return out as Record<SwingPhase, SwingMeasurement>;
}
