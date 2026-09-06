"use client";

import { useEffect, useState } from "react";
import { ROUTINE, ROUTINE_REPS_KEY } from "@/lib/routine";
import { getMeta, setMeta } from "@/lib/db";
import { tapFx, doneFx } from "@/lib/haptics";
import { Icon } from "./Icon";

export function Routine({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<"read" | "rehearse">("read");
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [reps, setReps] = useState(0);

  useEffect(() => {
    getMeta<number>(ROUTINE_REPS_KEY).then((n) => setReps(typeof n === "number" ? n : 0));
  }, []);

  const start = () => {
    setIdx(0);
    setDone(false);
    setMode("rehearse");
  };

  const advance = () => {
    if (idx < ROUTINE.length - 1) {
      tapFx();
      setIdx(idx + 1);
      return;
    }
    // reached the end of the sequence
    doneFx();
    setDone(true);
    setReps((n) => {
      const next = n + 1;
      setMeta(ROUTINE_REPS_KEY, next);
      return next;
    });
  };

  const backToRead = () => {
    setMode("read");
    setIdx(0);
    setDone(false);
  };

  // ---- read mode ---------------------------------------------------------
  if (mode === "read") {
    return (
      <>
        <header className="hdr">
          <div className="hdr-row" style={{ alignItems: "center" }}>
            <button className="icon-btn" onClick={onBack} aria-label="Back">
              <Icon name="arrow_back" size={22} />
            </button>
            <div style={{ flex: 1 }}>
              <div className="hdr-title">Pre-shot routine</div>
              <div className="hdr-sub">Same steps, every shot</div>
            </div>
          </div>
        </header>

        <div className="screen">
          <p className="routine-intro">
            The routine matters more than any single step in it. Read it through, then
            rehearse until it runs on its own — at home, on the range, before every shot.
          </p>

          <ol className="routine-list">
            {ROUTINE.map((s, i) => (
              <li key={s.key}>
                <span className="routine-n num">{i + 1}</span>
                <span className="routine-step">
                  <b>{s.title}</b>
                  <small>{s.cue}</small>
                </span>
              </li>
            ))}
          </ol>

          <button className="cta" onClick={start}>
            <Icon name="play_arrow" size={22} fill />Rehearse it
          </button>

          {reps > 0 && (
            <p className="routine-reps">
              <Icon name="check_circle" size={15} color="var(--green)" />
              Rehearsed {reps} {reps === 1 ? "time" : "times"}
            </p>
          )}
        </div>
      </>
    );
  }

  // ---- rehearse mode ----------------------------------------------------
  const step = ROUTINE[idx];

  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={backToRead} aria-label="Stop rehearsing">
            <Icon name="close" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="hdr-eyebrow">{done ? "Done" : "Rehearsing"}</div>
          </div>
        </div>
        <div className="routine-dots" aria-hidden>
          {ROUTINE.map((s, i) => (
            <span key={s.key} className={done || i <= idx ? "on" : ""} />
          ))}
        </div>
      </header>

      <div className="screen">
        {done ? (
          <div className="routine-rehearse routine-complete">
            <span className="icon-tile lg glow"><Icon name="check" size={26} fill /></span>
            <div className="routine-complete-h">That&apos;s the routine.</div>
            <div className="routine-complete-p">
              Six steps, same every time. Rehearsed {reps} {reps === 1 ? "time" : "times"}.
            </div>
            <div className="routine-done-actions">
              <button className="cta" onClick={start}>
                <Icon name="replay" size={20} />Rehearse again
              </button>
              <button className="btn-ghost" onClick={backToRead}>Back to the steps</button>
            </div>
          </div>
        ) : (
          <button className="routine-rehearse routine-stage" onClick={advance}>
            <span className="routine-stage-inner" key={idx}>
              <span className="routine-stage-n num">{idx + 1} / {ROUTINE.length}</span>
              <span className="routine-stage-title">{step.title}</span>
              <span className="routine-stage-cue">{step.cue}</span>
            </span>
            <span className="routine-tap">
              <Icon name="touch_app" size={16} />
              {idx < ROUTINE.length - 1 ? "Tap to continue" : "Tap to finish"}
            </span>
          </button>
        )}
      </div>
    </>
  );
}
