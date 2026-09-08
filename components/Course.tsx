"use client";

import { COURSE } from "@/lib/course";
import { Icon } from "./Icon";

const GROUP_ICON: Record<string, string> = {
  "OFF THE TEE": "sports_golf",
  "APPROACH & PIN STRATEGY": "target",
  "TROUBLE & RECOVERY": "warning",
  "WIND": "air",
  "BUNKERS": "grain",
  "MENTAL KEYS (from the drill book)": "psychology",
};

// "OFF THE TEE" → "Off the tee"; drops any parenthetical
const groupTitle = (g: string) => {
  const base = g.replace(/\s*\(.*\)\s*/, "").trim().toLowerCase();
  return base.charAt(0).toUpperCase() + base.slice(1);
};

export function Course({ onBack }: { onBack: () => void }) {
  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="hdr-title">Course management</div>
            <div className="hdr-sub">Strategy, situation by situation</div>
          </div>
        </div>
      </header>

      <div className="screen">
        <div className="stick">
          <Icon name="golf_course" size={18} color="var(--blue-icon)" style={{ marginTop: 1 }} />
          <div className="stick-b">
            The decisions that turn tracked stats into lower scores. As you log a round,
            the tracker surfaces the rule that fits the hole.
          </div>
        </div>

        {COURSE.map((g) => (
          <div className="grp" key={g.group}>
            <div className="sec-head">
              <span className="icon-tile sm"><Icon name={GROUP_ICON[g.group] ?? "flag"} size={15} /></span>
              <h3>{groupTitle(g.group)}</h3>
              <span className="count-pill">{g.rules.length}</span>
            </div>
            <div className="course-rules">
              {g.rules.map((r) => (
                <div className="course-rule" key={r.rule}>
                  <div className="course-rule-top">
                    <b>{r.rule}</b>
                    {r.ref && <span className="course-rule-ref">{r.ref}</span>}
                  </div>
                  <p>{r.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
