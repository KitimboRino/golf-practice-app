"use client";

import { LIBRARY } from "@/lib/library";
import { Icon } from "./Icon";

const iconFor = (area: string) => {
  const a = area.toLowerCase();
  if (a.startsWith("driv")) return "sports_golf";
  if (a.startsWith("iron")) return "golf_course";
  if (a.startsWith("chip")) return "swipe_up";
  if (a.startsWith("pitch")) return "arrow_outward";
  if (a.startsWith("putt")) return "adjust";
  return "sports_golf";
};

function label(raw: string) {
  const m = raw.match(/^\s*([^(]+?)\s*(\(.*\))?\s*$/);
  const name = (m?.[1] ?? raw).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return { name, sub: m?.[2] ?? "" };
}

export function Library({ onBack }: { onBack?: () => void }) {
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
            <div className="hdr-title">Drill library</div>
            <div className="hdr-sub">Alternates to swap in for any area&apos;s focus drill</div>
          </div>
        </div>
      </header>

      <div className="screen">
        {LIBRARY.map((group) => {
          const { name, sub } = label(group.area);
          return (
            <div className="grp" key={group.area}>
              <div className="label-row">
                <Icon name={iconFor(group.area)} size={16} />
                {name}{sub && <span className="lib-sub">{sub}</span>}
              </div>
              {group.drills.map((d) => (
                <div className="lib" key={d.name}>
                  <div className="lib-name">{d.name}</div>
                  <div className="lib-how">{d.how}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
