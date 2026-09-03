"use client";

import { useState } from "react";
import { WARMUP } from "@/lib/prep";
import { Icon } from "./Icon";

// Shown once per calendar day before a fresh session. A guided run — one movement
// at a time. Skip stays first-class; both Skip and finishing proceed to logging.
export function Warmup({ onSkip, onReady }: { onSkip: () => void; onReady: () => void }) {
  const [done, setDone] = useState<number[]>([]);
  const doneSet = new Set(done);
  const currentIdx = WARMUP.findIndex((_, i) => !doneSet.has(i));
  const current = currentIdx >= 0 ? WARMUP[currentIdx] : null;
  const upcoming = WARMUP.map((w, i) => ({ w, i })).filter(({ i }) => i > currentIdx && !doneSet.has(i));
  const allDone = currentIdx < 0;

  const markDone = () => currentIdx >= 0 && setDone([...done, currentIdx]);

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-eyebrow">Pre-session</div>
            <div className="hdr-title">Warm up</div>
          </div>
          <button className="link-btn" onClick={onSkip}>Skip</button>
        </div>
        <div>
          <div className="grp-lbl-row" style={{ marginBottom: 8 }}>
            <span className="eyebrow dim">Mobility routine</span>
            <span className="num" style={{ color: "var(--text-2)", fontWeight: 700 }}>
              {done.length} of {WARMUP.length}
            </span>
          </div>
          <div className="pbar"><span style={{ width: `${(done.length / WARMUP.length) * 100}%` }} /></div>
        </div>
      </header>

      <div className="screen">
        {current ? (
          <div className="warm-now">
            <div className="warm-now-head">
              <span className="eyebrow"><Icon name="self_improvement" size={15} />Now</span>
              <span className="count-pill">{currentIdx + 1} of {WARMUP.length}</span>
            </div>
            <div className="warm-now-name">{current.name}</div>
            <div className="warm-now-how">{current.how}</div>
            <div className="warm-now-actions">
              <button className="cta" onClick={markDone}><Icon name="check" size={21} />Done</button>
              <button className="icon-btn" onClick={() => setDone([...done, currentIdx])} aria-label="Skip this one">
                <Icon name="redo" size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="warm-now" style={{ textAlign: "center" }}>
            <span className="icon-tile lg glow" style={{ margin: "0 auto" }}><Icon name="check" size={24} fill /></span>
            <div className="warm-now-name" style={{ textAlign: "center" }}>Warmed up</div>
            <div className="warm-now-how" style={{ textAlign: "center" }}>All seven movements done. Your body's ready.</div>
          </div>
        )}

        {upcoming.length > 0 && (
          <div className="grp">
            <div className="eyebrow dim">Still to come</div>
            <div className="hist">
              {upcoming.map(({ w, i }) => (
                <div key={i} className="warm-todo">
                  <Icon name="radio_button_unchecked" size={19} color="var(--icon-muted)" />
                  <span>{w.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {done.length > 0 && (
          <div className="grp">
            <div className="eyebrow dim">Done</div>
            <div className="chips">
              {done.map((i) => (
                <span key={i} className="chip" style={{ height: 34 }}>
                  <Icon name="check" size={15} />{WARMUP[i].name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button className="cta" onClick={onReady} disabled={!allDone && done.length === 0}>
          <Icon name="play_arrow" size={22} fill />
          {allDone ? "Start logging" : "I'm ready — start logging"}
        </button>
      </div>
    </>
  );
}
