import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as poseDetection from "@tensorflow-models/pose-detection";
import type { PoseFrame } from "./swingPhases";

// Self-hosted (public/models/movenet-lightning/, precached in public/sw.js)
// rather than loaded from TF Hub/Kaggle — keeps the CSP's connect-src
// untouched and means swing check works fully offline after the first load,
// same reasoning as every other feature in this app.
const MODEL_URL = "/models/movenet-lightning/model.json";
const SAMPLE_FPS = 15; // sampled, not every encoded frame — plenty for a swing

let detectorPromise: Promise<poseDetection.PoseDetector> | null = null;

function getDetector(): Promise<poseDetection.PoseDetector> {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      await tf.setBackend("webgl");
      await tf.ready();
      return poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        modelUrl: MODEL_URL,
      });
    })();
  }
  return detectorPromise;
}

function seekTo(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = t;
  });
}

function loadVideo(blob: Blob): Promise<HTMLVideoElement> {
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.src = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => reject(new Error("Couldn't read the recorded clip"));
  });
}

// Decodes the recorded clip by seeking a hidden <video> frame by frame (not
// real-time playback) and running pose estimation on each sampled frame via
// an offscreen canvas. Record-then-analyze, not live — far more forgiving on
// a phone than running inference during capture itself.
export async function analyzeSwingVideo(
  blob: Blob,
  onProgress?: (pct: number) => void,
): Promise<PoseFrame[]> {
  const detector = await getDetector();
  const video = await loadVideo(blob);
  try {
    const duration = video.duration;
    const step = 1 / SAMPLE_FPS;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");

    const times: number[] = [];
    for (let t = 0; t < duration; t += step) times.push(t);

    const frames: PoseFrame[] = [];
    for (let i = 0; i < times.length; i++) {
      const t = times[i];
      await seekTo(video, t);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const poses = await detector.estimatePoses(canvas, { flipHorizontal: false });
      if (poses[0]) frames.push({ keypoints: poses[0].keypoints, t: t * 1000 });
      onProgress?.(Math.round(((i + 1) / times.length) * 100));
    }
    return frames;
  } finally {
    URL.revokeObjectURL(video.src);
  }
}

// A single-frame snapshot as a small data URL, for the results screen —
// never the full clip.
export async function frameThumbnail(blob: Blob, tSeconds: number, maxWidth = 160): Promise<string> {
  const video = await loadVideo(blob);
  try {
    await seekTo(video, tSeconds);
    const scale = maxWidth / video.videoWidth;
    const canvas = document.createElement("canvas");
    canvas.width = maxWidth;
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7);
  } finally {
    URL.revokeObjectURL(video.src);
  }
}
