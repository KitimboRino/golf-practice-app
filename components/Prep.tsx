"use client";

import { useState } from "react";
import {
  WARMUP, SETUP_CHECK, SESSION_FLOW, SESSION_PRINCIPLES, SAFETY,
} from "@/lib/prep";
import { Icon } from "./Icon";

type Tab = "before" | "during" | "home";

const SETUP_ICON: Record<string, string> = {
  Grip: "back_hand", Aim: "target", Shoulders: "accessibility_new",
  Balance: "balance", "Watch the ball": "visibility",
};

export function Prep({ onBack }: { onBack?: () => void }) {
  const [tab, setTab] = useState<Tab>("before");
  const [openSetup, setOpenSetup] = useState<string | null>(SETUP_CHECK[0]?.name ?? null);

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
          </div>
        </div>
        <div className="segmented">
          {(["before", "during", "home"] as Tab[]).map((t) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
              {t === "before" ? "Before" : t === "during" ? "During" : "At home"}
            </button>
          ))}
        </div>
      </header>

      <div className="screen">
        <div className="stick">
          <Icon name="health_and_safety" size={18} color="var(--blue-icon)" style={{ marginTop: 1 }} />
          <div className="stick-b"><b>Safety</b> {SAFETY}</div>
        </div>

        {tab === "before" && (
          <>
            <div className="grp-lbl">Five things to check before the first ball. Tap one to expand.</div>
            {SETUP_CHECK.map((s) => {
              const open = openSetup === s.name;
              return (
                <div key={s.name} className={"prep-acc" + (open ? " open" : "")}>
                  <button className="prep-acc-head" onClick={() => setOpenSetup(open ? null : s.name)}>
                    <span className="block-name">
                      <Icon name={SETUP_ICON[s.name] ?? "check"} size={20}
                            color={open ? "var(--green)" : "var(--icon-muted)"} />
                      {s.name}
                    </span>
                    <Icon name="expand_more" size={22} color="var(--icon-muted)"
                          className={"rot-chev" + (open ? " open" : "")} />
                  </button>
                  {open && <div className="prep-acc-body">{s.how}</div>}
                </div>
              );
            })}
            <div className="onething" style={{ marginTop: 4 }}>
              <div className="lbl"><span className="eyebrow"><Icon name="format_quote" size={15} /> The one that matters</span></div>
              <div className="onething-body" style={{ fontSize: 16, color: "var(--text)" }}>
                With so much to think about, the thing most often forgotten is simply watching the ball.
              </div>
            </div>
          </>
        )}

        {tab === "during" && (
          <>
            <div className="grp-lbl">The order to work through a session.</div>
            <div className="prep-card">
              <ol className="flow-list">
                {SESSION_FLOW.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
            <div className="grp-lbl" style={{ marginTop: 4 }}>Warm-up runs first — {WARMUP.length} movements, on its own screen when you start a session.</div>
          </>
        )}

        {tab === "home" && (
          <>
            <div className="grp-lbl">Read these between sessions, not at the range.</div>
            <div className="prep-card">
              <ul className="bullet-list" style={{ margin: "8px 0" }}>
                {SESSION_PRINCIPLES.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}
