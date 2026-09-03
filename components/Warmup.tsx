"use client";

import { useState } from "react";
import { WARMUP } from "@/lib/prep";
import { Icon } from "./Icon";

// Shown once per calendar day before a fresh session. A prompt, not a gate —
// both Skip and "Ready" proceed to logging.
export function Warmup({ onSkip, onReady }: { onSkip: () => void; onReady: () => void }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-title">Warm up</div>
            <div className="hdr-sub">A few minutes now — never start cold</div>
          </div>
          <button className="link-btn" onClick={onSkip}>Skip</button>
        </div>
      </header>

      <div className="screen">
        <div className="checklist">
          {WARMUP.map((w, i) => {
            const on = done.has(i);
            return (
              <button key={i} className={"check-row" + (on ? " on" : "")}
                      onClick={() => toggle(i)} aria-pressed={on}>
                <span className="check-box"><Icon name={on ? "check" : ""} size={15} /></span>
                <span className="pitem"><b>{w.name}</b><span>{w.how}</span></span>
              </button>
            );
          })}
        </div>

        <button className="cta" onClick={onReady}>
          <Icon name="play_arrow" size={22} fill />Ready — start logging
        </button>
      </div>
    </>
  );
}
