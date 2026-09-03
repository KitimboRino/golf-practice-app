"use client";

import { useState } from "react";
import { CATALOG, Area } from "@/lib/faults";
import { Icon } from "./Icon";

const GROUPS: { area: Area; label: string; icon: string }[] = [
  { area: "driving", label: "Driving", icon: "sports_golf" },
  { area: "irons", label: "Irons", icon: "golf_course" },
  { area: "chipping", label: "Chipping", icon: "swipe_up" },
];

export function Fixes({ onBack }: { onBack?: () => void }) {
  const [filter, setFilter] = useState<Area | null>(null);
  const groups = GROUPS.filter((g) => !filter || g.area === filter);

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
            <div className="hdr-eyebrow">Field guide</div>
            <div className="hdr-title">Fixes</div>
            <div className="hdr-sub">Common miss patterns and the first thing to try</div>
          </div>
        </div>
      </header>

      <div className="screen">
        <div className="fault-note">
          <span className="icon-tile sm dim"><Icon name="info" size={15} /></span>
          <span>
            A miss pattern points to the most likely fault, not a certain one — try it
            first, but a lesson beats a table.
          </span>
        </div>

        <div className="chips">
          <button className={"chip-btn" + (filter === null ? " on" : "")} onClick={() => setFilter(null)}>
            All ({CATALOG.length})
          </button>
          {GROUPS.map((g) => (
            <button key={g.area} className={"chip-btn" + (filter === g.area ? " on" : "")}
                    onClick={() => setFilter(g.area)}>
              {g.label}
            </button>
          ))}
        </div>

        {groups.map((g) => {
          const rows = CATALOG.filter((f) => f.area === g.area);
          if (!rows.length) return null;
          return (
            <div className="grp" key={g.area}>
              <div className="sec-head">
                <span className="icon-tile sm"><Icon name={g.icon} size={15} /></span>
                <h3>{g.label}</h3>
                <span className="count-pill">{rows.length}</span>
              </div>
              {rows.map((f) => (
                <div className="fault" key={f.id}>
                  <div className="fault-pat">{f.pattern}</div>
                  <div className="fault-line">
                    <span className="fault-k">Likely</span>{f.fault}
                  </div>
                  <div className="fault-line">
                    <span className="fault-k fix">Fix</span>{f.fix}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
