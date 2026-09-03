"use client";

import { useState } from "react";
import { Icon } from "./Icon";

const MISSES: { key: string; title: string; sub: string; icon: string; tone?: "clay" }[] = [
  { key: "right", title: "Right — a slice", sub: "Starts right or curves away late", icon: "east", tone: "clay" },
  { key: "left", title: "Left — a hook", sub: "Pulls left, sometimes hard", icon: "west" },
  { key: "strike", title: "Fat or thin", sub: "Strike is the problem, not the line", icon: "height" },
  { key: "varies", title: "It varies", sub: "Start with the balanced plan", icon: "shuffle" },
];

export function Welcome({
  isEdit, name = "", onDone, onCancel,
}: {
  isEdit?: boolean;
  name?: string;
  onDone: (name: string, miss: string) => void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState(name);

  if (isEdit) {
    return (
      <div className="welcome-wrap">
        <div className="welcome edit">
          <h1 className="welcome-h">What should we call you?</h1>
          <div className="field welcome-field">
            <Icon name="person" size={19} color="var(--icon-muted)" />
            <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Your name"
                   maxLength={24} autoFocus
                   onKeyDown={(e) => { if (e.key === "Enter") onDone(v.trim(), ""); }} />
          </div>
          <button className="cta" onClick={() => onDone(v.trim(), "")}>
            <Icon name="check" size={22} fill />Save
          </button>
          {onCancel && <button className="btn-ghost" onClick={onCancel}>Cancel</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-wrap" style={{ alignItems: "flex-start", paddingTop: 36 }}>
      <div className="welcome" style={{ alignItems: "stretch", textAlign: "left" }}>
        <div className="welcome-mark" style={{ alignSelf: "flex-start" }}>
          <Icon name="sports_golf" size={28} fill />
        </div>
        <h1 className="welcome-h" style={{ textAlign: "left" }}>Where does your bad one go?</h1>
        <p className="welcome-p" style={{ maxWidth: "none" }}>
          One tap and your first four weeks are built around it. Everything stays on this device.
        </p>

        <div className="miss-list">
          {MISSES.map((m) => (
            <button key={m.key} className={"miss-row" + (m.tone ? " " + m.tone : "")}
                    onClick={() => onDone(v.trim(), m.key)}>
              <span>
                <b>{m.title}</b>
                <small>{m.sub}</small>
              </span>
              <Icon name={m.icon} size={24} color={m.tone ? "var(--clay)" : "var(--icon-muted)"} />
            </button>
          ))}
        </div>

        <div className="field welcome-field" style={{ marginTop: 4 }}>
          <Icon name="person" size={19} color="var(--icon-muted)" />
          <input value={v} onChange={(e) => setV(e.target.value)} placeholder="Your name — optional"
                 maxLength={24}
                 onKeyDown={(e) => { if (e.key === "Enter") onDone(v.trim(), "varies"); }} />
        </div>
        <div className="welcome-hint">
          <Icon name="lock" size={13} />No account, no upload. Works offline.
        </div>
      </div>
    </div>
  );
}
