"use client";

import { useState } from "react";
import { Icon } from "./Icon";

export function Welcome({
  isEdit, name = "", onDone, onCancel,
}: {
  isEdit?: boolean;
  name?: string;
  onDone: (name: string) => void;
  onCancel?: () => void;
}) {
  const [v, setV] = useState(name);
  const submit = () => onDone(v.trim());

  return (
    <div className="welcome-wrap">
      <div className="welcome">
        {!isEdit && (
          <div className="welcome-mark"><Icon name="sports_golf" size={30} fill /></div>
        )}
        <div className="welcome-h">
          {isEdit ? "What should we call you?" : "Welcome to RangeCard"}
        </div>
        {!isEdit && (
          <div className="welcome-p">
            Log your range sessions against the 4-week plan and watch the lines move.
            It all stays on your device.
          </div>
        )}

        <div className="field welcome-field">
          <Icon name="person" size={19} color="var(--icon-muted)" />
          <input
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="Your name"
            maxLength={24}
            autoFocus={isEdit}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
        </div>
        {!isEdit && <div className="welcome-hint">Optional — you can add it later.</div>}

        <button className="cta" onClick={submit}>
          <Icon name={isEdit ? "check" : "play_arrow"} size={22} fill />
          {isEdit ? "Save" : "Let’s go"}
        </button>
        {isEdit && onCancel && (
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </div>
  );
}
