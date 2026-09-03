"use client";

import { useMemo, useState } from "react";
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

const total = LIBRARY.reduce((n, g) => n + g.drills.length, 0);

export function Library({ onBack }: { onBack?: () => void }) {
  const [q, setQ] = useState("");
  const [area, setArea] = useState<string | null>(null);

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LIBRARY
      .filter((g) => !area || g.area === area)
      .map((g) => ({
        ...g,
        drills: needle
          ? g.drills.filter((d) => (d.name + " " + d.how).toLowerCase().includes(needle))
          : g.drills,
      }))
      .filter((g) => g.drills.length);
  }, [q, area]);

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
            <div className="hdr-eyebrow">Bench · {total} drills</div>
            <div className="hdr-title">Drill library</div>
            <div className="hdr-sub">Alternates to swap in for any area&apos;s focus drill</div>
          </div>
        </div>
      </header>

      <div className="screen">
        <div className="field">
          <Icon name="search" size={19} color="var(--icon-muted)" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder="Search drills, cues, focus points…" />
        </div>

        <div className="chips">
          <button className={"chip-btn" + (area === null ? " on" : "")} onClick={() => setArea(null)}>All</button>
          {LIBRARY.map((g) => (
            <button key={g.area} className={"chip-btn" + (area === g.area ? " on" : "")}
                    onClick={() => setArea(g.area)}>
              {label(g.area).name}
            </button>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="hist-empty">No drills match “{q}”.</div>
        )}

        {groups.map((group) => {
          const { name, sub } = label(group.area);
          return (
            <div className="grp" key={group.area}>
              <div className="sec-head">
                <span className="icon-tile sm"><Icon name={iconFor(group.area)} size={15} /></span>
                <h3>{name}{sub && <span className="lib-sub">{sub}</span>}</h3>
                <span className="count-pill">{group.drills.length}</span>
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
