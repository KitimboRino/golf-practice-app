"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
import { tapFx, bumpFx, doneFx } from "@/lib/haptics";
import { uuid, saveSwing, SwingPhase, SwingMeasurement } from "@/lib/db";
import { detectPhases } from "@/lib/swingPhases";
import { measurePhases } from "@/lib/swingAngles";
import { SWING_BASELINE, statusFor } from "@/lib/swingBaseline";
import { localDate } from "@/lib/date";

const RECORD_MS = 4000;
const COUNTDOWN_FROM = 3; // seconds — only for the manual button; auto-detect must fire instantly
const PHASE_ORDER: SwingPhase[] = ["address", "top", "impact", "finish"];
const PHASE_LABEL: Record<SwingPhase, string> = {
  address: "Address", top: "Top of backswing", impact: "Impact", finish: "Finish",
};

// Motion auto-detect (watches the live preview, not a model — the pose model
// only ever runs on the finished clip, per Stage 1's record-then-analyze
// design). A cheap frame-diff on a tiny downsampled canvas: once the feed
// has been quiet for a stretch (golfer has settled into address, phone
// propped up and nobody adjusting it), it arms; the first motion spike past
// that point is taken as the swing starting and triggers the same record()
// the manual button calls. Tuned loose on purpose — a false trigger just
// means an extra clip to discard, a missed trigger means falling back to
// the always-available manual button, so erring toward triggering is the
// safer failure mode either way.
const MOTION_SAMPLE = 48; // px, square — small on purpose, this just needs a rough motion signal
const MOTION_SAMPLE_MS = 90; // ~11fps sampling is plenty for this
const QUIET_THRESHOLD = 6; // avg per-pixel delta (0-255) below this counts as "still"
const MOTION_THRESHOLD = 18; // above this counts as "something moved"
const QUIET_STREAK_NEEDED = 8; // consecutive quiet samples (~0.7s) before arming

type Stage = "intro" | "camera" | "recording" | "processing" | "results";
type ArmState = "settling" | "ready" | null;

const today = () => localDate();

// Stage 1 of the swing-check feature (see the plan doc): record a swing,
// run on-device pose estimation, show the golfer their own measured joint
// angles at each phase. No judgement, no fault language — there's no
// reference baseline to compare against yet. The raw video is processed
// entirely on-device and discarded once the measurements are computed;
// only the derived numbers and small thumbnails are stored.
export function SwingCheck({ onBack }: { onBack: () => void }) {
  const [supported, setSupported] = useState(false);
  const [checked, setChecked] = useState(false);
  const [stage, setStage] = useState<Stage>("intro");
  const [progress, setProgress] = useState(0);
  const [measurements, setMeasurements] = useState<Record<SwingPhase, SwingMeasurement> | null>(null);
  const [autoDetect, setAutoDetect] = useState(true);
  // which outline to line up against; face-on is what the angles are built for
  const [view, setViewState] = useState<GuideView>("face");
  useEffect(() => {
    try { if (localStorage.getItem("swingView") === "dtl") setViewState("dtl"); } catch { /* ignore */ }
  }, []);
  const setView = (v: GuideView) => {
    tapFx();
    setViewState(v);
    try { localStorage.setItem("swingView", v); } catch { /* ignore */ }
  };
  const [armState, setArmState] = useState<ArmState>(null); // mirrors armStateRef, for display only
  const [countdown, setCountdown] = useState<number | null>(null); // manual-button only
  const [recordKey, setRecordKey] = useState(0); // bumped each recording start, so the progress ring replays
  const [secondsLeft, setSecondsLeft] = useState(0);
  const toast = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);
  const armStateRef = useRef<ArmState>(null); // authoritative state for the rAF loop's sync decisions
  const quietStreakRef = useRef(0);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia);
    setChecked(true);
  }, []);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    };
  }, []);

  // Attaches the live stream once the <video> element actually exists — it
  // only mounts for stage "camera"/"recording", so attaching it inline
  // inside startCamera() (before that render happens) silently no-ops and
  // leaves the preview blank. Runs on every stage change rather than just
  // once, since the element unmounts/remounts across camera <-> recording.
  useEffect(() => {
    if ((stage === "camera" || stage === "recording") && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => { /* autoplay can reject harmlessly; the feed still shows */ });
    }
  }, [stage]);

  // Manual-button countdown — ticks every second with a haptic tap, then
  // fires the real record() at zero. Auto-detect never goes through this; it
  // calls record() directly, since the whole point is starting the instant
  // motion is seen, not after a delay that would miss the swing.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      // eslint-disable-next-line react-hooks/immutability -- effects run after render, by which point record is defined
      record();
      return;
    }
    const t = window.setTimeout(() => {
      tapFx();
      setCountdown((c) => (c === null ? null : c - 1));
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  // Drives the numeric "4 3 2 1" readout during recording — separate from
  // the ring's own smooth CSS animation (driven by transition, not this),
  // this just needs to tick once a second.
  useEffect(() => {
    if (stage !== "recording") return;
    setSecondsLeft(Math.ceil(RECORD_MS / 1000));
    const start = Date.now();
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((RECORD_MS - (Date.now() - start)) / 1000));
      setSecondsLeft(left);
      if (left === 0) clearInterval(id);
    }, 200);
    return () => clearInterval(id);
  }, [stage]);

  // Motion auto-detect — see the constants block above for the reasoning.
  // Only watches while actually on the camera screen with auto-detect on;
  // stops cleanly the moment recording starts (own stage effect dependency),
  // a manual countdown begins (otherwise it could fire mid-countdown and
  // race with the countdown's own eventual record() call), or the screen
  // is left.
  useEffect(() => {
    if (stage !== "camera" || !autoDetect || countdown !== null) {
      armStateRef.current = null;
      setArmState(null);
      return;
    }
    armStateRef.current = "settling";
    setArmState("settling");
    quietStreakRef.current = 0;
    prevFrameRef.current = null;

    const canvas = document.createElement("canvas");
    canvas.width = MOTION_SAMPLE;
    canvas.height = MOTION_SAMPLE;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let stopped = false;
    let rafId = 0;
    let lastSampleAt = 0;

    const tick = (now: number) => {
      if (stopped) return;
      rafId = requestAnimationFrame(tick);
      if (!ctx || !videoRef.current || videoRef.current.readyState < 2) return;
      if (now - lastSampleAt < MOTION_SAMPLE_MS) return;
      lastSampleAt = now;

      ctx.drawImage(videoRef.current, 0, 0, MOTION_SAMPLE, MOTION_SAMPLE);
      const frame = ctx.getImageData(0, 0, MOTION_SAMPLE, MOTION_SAMPLE).data;
      const prev = prevFrameRef.current;
      prevFrameRef.current = frame;
      if (!prev) return;

      let diffSum = 0;
      for (let i = 1; i < frame.length; i += 4) diffSum += Math.abs(frame[i] - prev[i]); // green channel, cheap luma proxy
      const avgDiff = diffSum / (MOTION_SAMPLE * MOTION_SAMPLE);

      if (armStateRef.current === "settling") {
        if (avgDiff < QUIET_THRESHOLD) {
          quietStreakRef.current += 1;
          if (quietStreakRef.current >= QUIET_STREAK_NEEDED) {
            armStateRef.current = "ready";
            setArmState("ready");
          }
        } else {
          quietStreakRef.current = 0;
        }
      } else if (armStateRef.current === "ready" && avgDiff > MOTION_THRESHOLD) {
        stopped = true;
        cancelAnimationFrame(rafId);
        armStateRef.current = null;
        setArmState(null);
        record();
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, autoDetect, countdown]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Acquires a fresh stream and moves to the "camera" stage. Used both for
  // the first start and to recover after a failed analysis — the recorder's
  // onstop already released the previous stream, so "camera" without a new
  // one would be a black preview whose record() silently no-ops.
  const openCamera = async () => {
    try {
      // `ideal`, not a bare string — a bare facingMode is a hard constraint
      // that throws NotFoundError on any device that doesn't cleanly expose
      // that capability (confirmed in testing); `ideal` degrades gracefully
      // to whatever camera is available instead of failing outright.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      // left the screen while the permission prompt / camera was opening —
      // release it now, or the camera stays on with nothing to stop it
      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      // Don't attach to videoRef here — the <video> element only mounts once
      // stage flips to "camera", so videoRef.current is still null at this
      // point. The effect below attaches the stream once it actually exists.
      setStage("camera");
    } catch {
      toast.show("Can't use the camera — check camera permission");
      setStage("intro");
    }
  };

  const startCamera = () => {
    tapFx();
    return openCamera();
  };

  // After a failed analysis: explain, then put the golfer straight back in
  // front of a live camera for another try.
  const retryCapture = (message: string) => {
    toast.show(message);
    return openCamera();
  };

  const process = async (blob: Blob) => {
    setStage("processing");
    setProgress(0);
    try {
      // TensorFlow and the pose model are ~1.7 MB of script: fetch them only
      // when a clip is actually being analysed, not with the app shell
      const { analyzeSwingVideo, frameThumbnail } = await import("@/lib/swingPose");
      const frames = await analyzeSwingVideo(blob, setProgress);
      const phases = detectPhases(frames);
      if (!phases) {
        await retryCapture("Couldn't follow the swing clearly enough in that clip — try again with your full body in frame");
        return;
      }
      const thumbnails: Record<SwingPhase, string> = {
        address: await frameThumbnail(blob, frames[phases.address].t / 1000),
        top: await frameThumbnail(blob, frames[phases.top].t / 1000),
        impact: await frameThumbnail(blob, frames[phases.impact].t / 1000),
        finish: await frameThumbnail(blob, frames[phases.finish].t / 1000),
      };
      const result = measurePhases(frames, phases, thumbnails);
      if (!result) {
        await retryCapture("Couldn't get a clear enough read on your position — try again with better lighting or a closer frame");
        return;
      }
      doneFx();
      setMeasurements(result);
      setStage("results");
      // results are already on screen — a failed save shouldn't bounce the
      // golfer back to the camera, just tell them it wasn't kept
      saveSwing({ id: uuid(), date: today(), measurements: result, createdAt: Date.now() })
        .catch(() => toast.show("Couldn't save this swing to your history"));
    } catch {
      await retryCapture("Something went wrong analyzing that clip — try again");
    }
  };

  const record = () => {
    const stream = streamRef.current;
    if (!stream || recorderRef.current) return; // already recording — auto-detect and the manual button can both call this
    bumpFx(); // a stronger tap than the countdown ticks — this is the real thing starting
    setRecordKey((k) => k + 1); // replays the progress-ring CSS animation even on back-to-back recordings
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: pickMimeType() });
    recorder.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      recorderRef.current = null;
      stopCamera();
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      process(blob);
    };
    recorderRef.current = recorder;
    recorder.start();
    setStage("recording");
    stopTimerRef.current = window.setTimeout(() => recorder.stop(), RECORD_MS);
  };

  const restart = () => {
    tapFx();
    setMeasurements(null);
    setStage("intro");
  };

  if (!checked) return null;

  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="hdr-title">Swing check</h1>
            <div className="hdr-sub">Record a swing, see your measured positions</div>
          </div>
        </div>
      </header>

      <div className="screen">
        {!supported && (
          <div className="fault-note">
            <span className="icon-tile sm dim"><Icon name="videocam_off" size={15} /></span>
            <span>Camera recording isn&apos;t available on this device or browser.</span>
          </div>
        )}

        {supported && stage === "intro" && (
          <div className="swingcheck-intro">
            <div className="fault-note">
              <span className="icon-tile sm dim"><Icon name="info" size={15} /></span>
              <span>
                Processed entirely on this device — the video never leaves your phone, and
                isn&apos;t saved. Only the measured numbers are kept.
              </span>
            </div>
            <div className="swingcheck-setup">
              <div className="rgrp-lbl">Before you record</div>
              <ul className="swingcheck-tips">
                <li>Stand about 8ft (2.5m) back with your full body in frame: face-on gives the truest numbers, down the line works too</li>
                <li>Prop the phone up rather than holding it</li>
                <li>A 4-second clip is plenty — the swing itself is quick</li>
                <li>Recording starts on its own once it sees you swing — no need to tap anything after you&apos;re set up</li>
              </ul>
            </div>
            <button className="cta" onClick={startCamera}>
              <Icon name="videocam" size={22} fill />Start camera
            </button>
          </div>
        )}

        {supported && (stage === "camera" || stage === "recording") && (
          <div className="swingcheck-capture">
            {stage === "camera" && (
              <div className="seg swingcheck-views" role="group" aria-label="Camera angle">
                <button aria-pressed={view === "face"} onClick={() => setView("face")}>Face-on</button>
                <button aria-pressed={view === "dtl"} onClick={() => setView("dtl")}>Down the line</button>
              </div>
            )}
            <div className="swingcheck-preview">
              <video ref={videoRef} playsInline muted className="swingcheck-video" />
              {view === "face" ? <GuideFaceOn /> : <GuideDownLine />}
              {stage === "recording" && (
                <span className="swingcheck-rec" key={recordKey}>
                  <RecordingRing ms={RECORD_MS} />
                  <span className="swingcheck-rec-n num">{secondsLeft}</span>
                </span>
              )}
              {stage === "camera" && countdown !== null && (
                <span className="swingcheck-countdown num" key={countdown}>{countdown || "Go"}</span>
              )}
              {stage === "camera" && countdown === null && armState && (
                <span className={"swingcheck-arm " + armState}>
                  <span className="swingcheck-dot" />
                  {armState === "settling" ? "Settling…" : "Ready — swing when you like"}
                </span>
              )}
            </div>
            <div className="swingcheck-step">
              {stage === "recording"
                ? "Recording…"
                : countdown !== null
                  ? "Get into your stance…"
                  : armState === "ready"
                    ? "Watching — it'll start recording the moment you move"
                    : armState === "settling"
                      ? `${VIEW_HINT[view]} — hold still a moment`
                      : VIEW_HINT[view]}
            </div>
            <button
              className="cta"
              onClick={() => { tapFx(); setCountdown(COUNTDOWN_FROM); }}
              disabled={stage === "recording" || countdown !== null}
            >
              <Icon name="fiber_manual_record" size={20} fill />
              {stage === "recording" ? "Recording…" : countdown !== null ? "Starting…" : "Record now"}
            </button>
            {stage === "camera" && countdown === null && (
              <button
                className="swingcheck-autotoggle"
                onClick={() => { tapFx(); setAutoDetect((v) => !v); }}
              >
                <Icon name={autoDetect ? "toggle_on" : "toggle_off"} size={20} fill={autoDetect} />
                {autoDetect ? "Auto-detect on — tap to turn off" : "Auto-detect off — tap to turn on"}
              </button>
            )}
          </div>
        )}

        {stage === "processing" && (
          <div className="swingcheck-processing">
            <div className="swingcheck-spinner" aria-hidden />
            <div className="swingcheck-step">Analyzing your swing… {progress}%</div>
          </div>
        )}

        {stage === "results" && measurements && (
          <div className="swingcheck-results">
            <div className="fault-note">
              <span className="icon-tile sm dim"><Icon name="info" size={15} /></span>
              <span>
                The shaded range is a rough compass, not a target — synthesized from
                published amateur-golfer figures (not your own footage), and measured here
                from one phone camera angle rather than the 3D motion-capture those figures
                came from. Treat it as a direction, not a verdict.
              </span>
            </div>
            {view === "dtl" && (
              <div className="fault-note">
                <span className="icon-tile sm dim"><Icon name="info" size={15} /></span>
                <span>
                  Filmed down the line. From the side your shoulders and hips overlap in the
                  frame, so turn and tilt read rougher than face-on. Use it to compare swings
                  filmed the same way.
                </span>
              </div>
            )}
            <div className="swingcheck-grid">
              {PHASE_ORDER.map((phase) => {
                const m = measurements[phase];
                const base = SWING_BASELINE[phase];
                const rows: { label: string; value: number; status: ReturnType<typeof statusFor> }[] = [
                  { label: "Spine tilt", value: m.spineTiltDeg, status: statusFor(m.spineTiltDeg, base.spineTiltDeg) },
                  { label: "Shoulder turn", value: m.shoulderTurnDeg, status: statusFor(m.shoulderTurnDeg, base.shoulderTurnDeg) },
                  { label: "Hip turn", value: m.hipTurnDeg, status: statusFor(m.hipTurnDeg, base.hipTurnDeg) },
                ];
                return (
                  <div className="swingcheck-phase" key={phase}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.thumbnailDataUrl} alt={`${PHASE_LABEL[phase]} position`} className="swingcheck-thumb" />
                    <div className="swingcheck-phase-lbl">{PHASE_LABEL[phase]}</div>
                    <div className="swingcheck-phase-vals">
                      {rows.map((r) => (
                        <span key={r.label} className={"swingcheck-val " + r.status}>
                          {r.label} {r.value}°
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="cta" onClick={restart}>
              <Icon name="videocam" size={22} fill />Record another
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// A real countdown ring, not just a pulsing dot — mounts fully "drawn" and
// then animates down to empty over `ms`, via a CSS transition on
// stroke-dashoffset. A plain two-rule CSS trick (base state + an override
// selector with higher specificity) does NOT work for this: both rules
// apply in the same paint, so there's never an actual "before" frame to
// transition from and the browser just renders the end state instantly.
// The double requestAnimationFrame here is what guarantees the "full ring"
// state is genuinely painted on screen first, so the change to "empty" one
// tick later is a real transition instead of an instant jump.
function RecordingRing({ ms }: { ms: number }) {
  const [full, setFull] = useState(true);
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setFull(false));
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, []);
  return (
    <svg className="swingcheck-ring" viewBox="0 0 44 44" aria-hidden>
      <circle className="swingcheck-ring-track" cx="22" cy="22" r="19" />
      <circle
        className="swingcheck-ring-fill"
        cx="22" cy="22" r="19"
        style={{ strokeDashoffset: full ? 119.4 : 0, transitionDuration: `${ms}ms` }}
      />
    </svg>
  );
}

function pickMimeType(): string {
  const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "video/webm";
}

type GuideView = "face" | "dtl";
const VIEW_HINT: Record<GuideView, string> = {
  face: "Full body in frame, face-on, about 8ft back",
  dtl: "Full body in frame, behind your hands on the target line, about 8ft back",
};

// Translucent golfer-at-address outlines to line up against, one per camera
// angle. Decorative: not computed from the feed or the pose model.
function GuideFaceOn() {
  return (
    <svg className="swingcheck-guide face" viewBox="0 0 160 300" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <path className="sg-b" d="M57 124 C51 146 47 170 47 196 C47 220 41 244 41 264 L31 272 C28 277 32 280 39 280 L57 280 C60 278 59 270 56 265 C57 244 61 222 65 200 C69 184 74 170 80 162 C86 170 91 184 95 200 C99 222 103 244 104 265 C101 270 100 278 103 280 L121 280 C128 280 132 277 129 272 L119 264 C119 244 113 220 113 196 C113 170 109 146 103 124 Z" />
      <line className="sg-s" x1="81" y1="166" x2="77" y2="262" />
      <path className="sg-c" d="M66 261 C66 257 71 256 77 257 L85 258 C89 259 89 266 84 268 L71 268 C67 267 66 264 66 261 Z" />
      {/* upper body tilted away from the target: trail shoulder lower, head behind the ball */}
      <g transform="rotate(-4 80 130)">
        <path className="sg-b" d="M70 58 C58 60 46 62 42 72 C40 82 46 96 52 106 C56 114 58 122 60 132 L100 132 C102 122 104 114 108 106 C114 96 120 82 118 72 C114 62 102 60 90 58 Z" />
        <path className="sg-a" d="M42 70 C40 82 50 104 60 124 C66 138 72 150 76 160 L84 158 C80 146 74 130 70 116 C64 98 58 82 54 70 Z" />
        <path className="sg-a" d="M118 70 C120 82 110 104 100 124 C94 138 88 150 84 160 L76 158 C80 146 86 130 90 116 C96 98 102 82 106 70 Z" />
        <ellipse className="sg-a" cx="80" cy="162" rx="7.5" ry="7" />
        <ellipse className="sg-b" cx="80" cy="46" rx="11.5" ry="12.5" />
        <path className="sg-c" d="M68 43 C68 30 92 30 92 43 Z" />
        <path className="sg-c" d="M65 43 C72 40 88 40 95 43 C96 46 92 48 88 47 C83 45 77 45 72 47 C68 48 64 46 65 43 Z" />
      </g>
    </svg>
  );
}

function GuideDownLine() {
  return (
    <svg className="swingcheck-guide dtl" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <path className="sg-b" d="M118 82 C108 90 98 106 90 122 C84 134 76 142 74 154 C72 166 78 174 86 176 C92 186 95 200 95 214 C95 232 92 250 92 264 C90 270 86 274 86 278 L88 281 L124 281 C130 281 129 274 122 272 L106 266 C106 250 111 230 114 214 C116 200 113 186 111 174 C113 166 118 158 123 150 C131 138 139 122 141 108 C142 100 138 92 134 88 L140 76 L126 68 Z" />
      <circle className="sg-b" cx="136" cy="64" r="12" />
      <path className="sg-c" d="M124 61 C121 48 138 44 145 53 L158 62 C160 64 157 66 153 65 L142 61 C136 58 129 59 124 61 Z" />
      <path className="sg-a" d="M124 94 C124 86 136 84 138 94 C142 118 146 142 148 160 C149 168 141 171 137 166 C134 142 129 118 124 94 Z" />
      <line className="sg-s" x1="145" y1="166" x2="184" y2="262" />
      <path className="sg-c" d="M180 259 L188 262 C197 264 198 271 192 272 L180 271 C176 269 176 262 180 259 Z" />
    </svg>
  );
}
