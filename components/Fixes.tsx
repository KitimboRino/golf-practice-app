"use client";

import { CATALOG, Area } from "@/lib/faults";
import { Icon } from "./Icon";

const GROUPS: { area: Area; label: string; icon: string }[] = [
  { area: "driving", label: "Driving", icon: "sports_golf" },
  { area: "irons", label: "Irons", icon: "golf_course" },
  { area: "chipping", label: "Chipping", icon: "swipe_up" },
];

export function Fixes() {
  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-title">Fixes</div>
            <div className="hdr-sub">Common miss patterns and the first thing to try</div>
          </div>
        </div>
      </header>

      <div className="screen">
        <div className="fault-note">
          <Icon name="info" size={16} color="var(--icon-muted)" />
          <span>
            A miss pattern points to the most likely fault, not a certain one — try it
            first, but a lesson beats a table.
          </span>
        </div>

        {GROUPS.map((g) => {
          const rows = CATALOG.filter((f) => f.area === g.area);
          if (!rows.length) return null;
          return (
            <div className="grp" key={g.area}>
              <div className="label-row"><Icon name={g.icon} size={16} />{g.label}</div>
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
