"use client";

import { useState } from "react";
import { Icon } from "./Icon";

// Name-only editor, reached from the Plan-header greeting after onboarding.
// (The first-run miss flow lives in components/FirstRun.tsx.)
export function Welcome({
  name = "", onDone, onCancel,
}: {
  isEdit?: boolean;
  name?: string;
  onDone: (name: string, miss: string) => void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState(name);
  const save = () => onDone(v.trim(), "");

  return (
    <div className="welcome-wrap">
      <div className="welcome edit">
        <label className="welcome-lbl" htmlFor="name-field">Your name</label>
        <div className="field welcome-field">
          <Icon name="person" size={19} color="var(--icon-muted)" />
          <input
            id="name-field"
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="Optional"
            maxLength={24}
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
          />
        </div>
        <button className="cta" onClick={save}>
          <Icon name="check" size={22} fill />Save
        </button>
        {onCancel && <button className="btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}
