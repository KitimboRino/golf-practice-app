"use client";

import {
  WARMUP, SETUP_CHECK, SESSION_FLOW, SESSION_PRINCIPLES, SAFETY,
} from "@/lib/prep";
import { Icon } from "./Icon";

export function Prep({ onBack }: { onBack?: () => void }) {
  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          {onBack && (
            <button className="icon-btn" onClick={onBack} aria-label="Back">
              <Icon name="arrow_back" size={22} />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div className="hdr-eyebrow">Protocol</div>
            <div className="hdr-title">Prep</div>
            <div className="hdr-sub">Warm-up, setup, and how to run a session</div>
          </div>
        </div>
      </header>

      <div className="screen">
        <div className="stick">
          <Icon name="health_and_safety" size={18} color="var(--blue-icon)" style={{ marginTop: 1 }} />
          <div className="stick-b"><b>Safety</b> {SAFETY}</div>
        </div>

        <div className="grp">
          <div className="sec-head">
            <span className="icon-tile sm"><Icon name="self_improvement" size={15} /></span>
            <h3>Warm-up</h3>
            <span className="count-pill">{WARMUP.length} drills</span>
          </div>
          <div className="prep-card">
            {WARMUP.map((w) => (
              <div className="pitem" key={w.name}><b>{w.name}</b><span>{w.how}</span></div>
            ))}
          </div>
        </div>

        <div className="grp">
          <div className="sec-head">
            <span className="icon-tile sm"><Icon name="target" size={15} /></span>
            <h3>Setup check</h3>
            <span className="count-pill">{SETUP_CHECK.length}</span>
          </div>
          <div className="prep-card">
            {SETUP_CHECK.map((s) => (
              <div className="pitem" key={s.name}><b>{s.name}</b><span>{s.how}</span></div>
            ))}
          </div>
        </div>

        <div className="grp">
          <div className="sec-head">
            <span className="icon-tile sm"><Icon name="checklist" size={15} /></span>
            <h3>Session flow</h3>
          </div>
          <div className="prep-card">
            <ol className="flow-list">
              {SESSION_FLOW.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <div className="prep-sub">Principles</div>
            <ul className="bullet-list">
              {SESSION_PRINCIPLES.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
