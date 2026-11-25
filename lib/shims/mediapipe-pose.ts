// Stand-in for `@mediapipe/pose`, aliased in next.config.js.
//
// @tensorflow-models/pose-detection statically imports `Pose` from
// @mediapipe/pose for its BlazePose-on-MediaPipe runtime. That package is a
// browser-global script with no ES exports, which Turbopack (the default
// bundler since Next 16) rejects at build time. This app only runs MoveNet on
// the TF.js runtime (lib/swingPose.ts) and never reaches that code path, so
// the import is satisfied with a class that fails loudly if it ever is.
export class Pose {
  constructor() {
    throw new Error(
      "The MediaPipe pose runtime isn't bundled — use a TF.js-runtime model (see lib/swingPose.ts).",
    );
  }
}
