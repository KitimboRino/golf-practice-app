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
      <div className={"welcome" + (isEdit ? " edit" : "")}>
        {!isEdit && (
          <div className="welcome-hero">
            <svg className="welcome-arc" viewBox="0 0 360 170" aria-hidden="true">
              <defs>
                <linearGradient id="wtraj" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: "var(--green)", stopOpacity: 0.04 }} />
                  <stop offset="55%" style={{ stopColor: "var(--green)", stopOpacity: 0.55 }} />
                  <stop offset="100%" style={{ stopColor: "var(--blue-icon)", stopOpacity: 0.85 }} />
                </linearGradient>
                <radialGradient id="whalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" style={{ stopColor: "var(--green)", stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: "var(--green)", stopOpacity: 0 }} />
                </radialGradient>
              </defs>
              <circle cx="180" cy="90" r="74" fill="url(#whalo)" />
              <path d="M16 150 C 88 124 138 82 180 86 C 222 90 272 48 344 28"
                    fill="none" stroke="url(#wtraj)" strokeWidth="2"
                    strokeDasharray="3 6" strokeLinecap="round" />
              <circle cx="104" cy="120" r="1.6" fill="var(--green)" fillOpacity="0.5" />
              <circle cx="246" cy="60" r="1.6" fill="var(--green)" fillOpacity="0.6" />
              <circle cx="300" cy="42" r="2" fill="var(--blue-icon)" fillOpacity="0.7" />
              <circle cx="344" cy="28" r="8.5" fill="none" stroke="var(--green)" strokeOpacity="0.35" strokeWidth="1.2" />
              <circle className="welcome-arc-tip" cx="344" cy="28" r="3.6" fill="var(--green)" />
            </svg>
            <div className="welcome-mark"><Icon name="sports_golf" size={30} fill /></div>
          </div>
        )}

        <h1 className="welcome-h">
          {isEdit ? "What should we call you?" : <>Welcome to <span className="grad">RangeCard</span></>}
        </h1>
        {!isEdit && (
          <p className="welcome-p">
            Log your range sessions against the 4-week plan and watch the lines move.
            It all stays on your device.
          </p>
        )}

        <label className="welcome-lbl" htmlFor="wname">
          {isEdit ? "Your name" : "What should we call you?"}
          {!isEdit && <span> · optional</span>}
        </label>
        <div className="field welcome-field">
          <Icon name="person" size={19} color="var(--icon-muted)" />
          <input
            id="wname"
            value={v}
            onChange={(e) => setV(e.target.value)}
            placeholder="Your name"
            maxLength={24}
            autoFocus={isEdit}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          />
          <span className="field-enter">Enter</span>
        </div>
        {!isEdit && (
          <div className="welcome-hint">
            <Icon name="lock" size={13} />You can add or change it later.
          </div>
        )}

        <button className="cta" onClick={submit}>
          {isEdit
            ? <><Icon name="check" size={22} fill />Save</>
            : <>Let&rsquo;s go<Icon name="arrow_forward" size={20} className="cta-arrow" /></>}
        </button>
        {isEdit && onCancel && (
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        )}
        {!isEdit && (
          <div className="welcome-badge">
            <span className="dot" />No account · offline-first
          </div>
        )}
      </div>
    </div>
  );
}
