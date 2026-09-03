"use client";

import { useMemo, useState } from "react";
import { LIBRARY } from "@/lib/library";
import { DrillOverrides, DrillOverride } from "@/lib/db";
import { Fault } from "@/lib/faults";
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

// which session area a LIBRARY group maps to (for the "use in session" swap)
const areaKeyFor = (raw: string): keyof DrillOverrides | null => {
  const a = raw.toLowerCase();
  if (a.startsWith("driv")) return "driving";
  if (a.startsWith("iron")) return "irons";
  if (a.startsWith("chip")) return "chipping";
  if (a.startsWith("pitch")) return "pitching";
  if (a.startsWith("putt")) return "putting";
  return null;
};

function label(raw: string) {
  const m = raw.match(/^\s*([^(]+?)\s*(\(.*\))?\s*$/);
  const name = (m?.[1] ?? raw).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return { name, sub: m?.[2] ?? "" };
}

const total = LIBRARY.reduce((n, g) => n + g.drills.length, 0);

// which library area a logged/planned miss points at
const missArea = (m: string) =>
  m === "right" || m === "left" ? "DRIVING (off the tee)"
  : m === "strike" ? "IRONS"
  : null;

// the library area a Fixes fault belongs to
const FAULT_LIB_AREA: Record<string, string> = {
  driving: "DRIVING (off the tee)",
  irons: "IRONS",
  chipping: "CHIPPING",
};

// cue words that mark a drill as relevant to a directional / strike miss
const RIGHT_CUES = /slice|out-to-in|anti-slice|sync|release|path|channel/i;
const STRIKE_CUES = /low point|contact|ball-first|clean|towel|divot|weight/i;

// per-fault cue words, used when the screen is opened from a Fixes card
const FAULT_CUES: Record<string, RegExp> = {
  slice: /slice|out-to-in|anti-slice|sync|release|path|channel|swish|turn/i,
  push: /left|clear|swish|sync|turn/i,
  hook: /grip|hook|unwind|inside|sync|choke|control/i,
  sky: /width|arc|sweep|low|turn your back|tee-height/i,
  top: /spine|posture|height|shadow|balance/i,
  "heavy-chip": /brush|hard-surface|ball position|hands ahead|strike|clean|putting technique/i,
  shank: /path|inside|feet together|elbow|sync/i,
  pull: /inside|path|feet together|intermediate|shadow/i,
};

export function Library({
  onBack, plannedMiss = "", overrides = {}, onSwap, focusFault = null,
}: {
  onBack?: () => void;
  history?: import("@/lib/db").SavedSession[];
  plannedMiss?: string;
  overrides?: DrillOverrides;
  onSwap?: (area: keyof DrillOverrides, drill: DrillOverride | null) => void;
  focusFault?: Fault | null;
}) {
  const focusArea = focusFault ? FAULT_LIB_AREA[focusFault.area] ?? null : null;
  const missTarget = focusArea ?? missArea(plannedMiss);

  const [q, setQ] = useState("");
  const [area, setArea] = useState<string | null>(missTarget);
  const [forMiss, setForMiss] = useState(!!missTarget);

  const cues = focusFault
    ? FAULT_CUES[focusFault.id] ?? RIGHT_CUES
    : plannedMiss === "strike" ? STRIKE_CUES : RIGHT_CUES;

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LIBRARY
      .filter((g) => !area || g.area === area)
      .map((g) => {
        let drills = needle
          ? g.drills.filter((d) => (d.name + " " + d.how).toLowerCase().includes(needle))
          : [...g.drills];
        if (forMiss) {
          drills = [...drills].sort((a, b) => {
            const am = cues.test(a.name + " " + a.how) ? 0 : 1;
            const bm = cues.test(b.name + " " + b.how) ? 0 : 1;
            return am - bm;
          });
        }
        return { ...g, drills };
      })
      .filter((g) => g.drills.length);
  }, [q, area, forMiss, cues]);

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
            <div className="hdr-sub">Swap any of these into today&apos;s session</div>
          </div>
        </div>
      </header>

      <div className="screen">
        {focusFault && (
          <div className="lib-focus">
            <span className="icon-tile sm"><Icon name="build" size={15} /></span>
            <span>
              <b>{focusFault.pattern}</b>
              <small>Pick a drill below and add it to your next session</small>
            </span>
          </div>
        )}

        <div className="field">
          <Icon name="search" size={19} color="var(--icon-muted)" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder="Search drills, cues, focus points…" />
        </div>

        <div className="chips">
          {missTarget && (
            <button className={"chip-btn" + (forMiss ? " on" : "")}
                    onClick={() => { setForMiss(!forMiss); if (!forMiss) setArea(missTarget); }}>
              For my miss
            </button>
          )}
          <button className={"chip-btn" + (area === null && !forMiss ? " on" : "")}
                  onClick={() => { setArea(null); setForMiss(false); }}>All</button>
          {LIBRARY.map((g) => (
            <button key={g.area} className={"chip-btn" + (area === g.area ? " on" : "")}
                    onClick={() => { setArea(g.area); setForMiss(false); }}>
              {label(g.area).name}
            </button>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="hist-empty">No drills match “{q}”.</div>
        )}

        {groups.map((group) => {
          const { name, sub } = label(group.area);
          const ak = areaKeyFor(group.area);
          return (
            <div className="grp" key={group.area}>
              <div className="sec-head">
                <span className="icon-tile sm"><Icon name={iconFor(group.area)} size={15} /></span>
                <h3>{name}{sub && <span className="lib-sub">{sub}</span>}</h3>
                <span className="count-pill">{group.drills.length}</span>
              </div>
              {group.drills.map((d) => {
                const active = ak ? overrides[ak]?.name === d.name : false;
                return (
                  <div className={"lib" + (active ? " swapped" : "")} key={d.name}>
                    <div className="lib-top">
                      <div className="lib-name">{d.name}</div>
                      {d.ref && <span className="lib-ref">{d.ref}</span>}
                    </div>
                    <div className="lib-how"><span className="lib-k">Do</span>{d.how}</div>
                    {d.why && <div className="lib-why"><span className="lib-k">Why</span>{d.why}</div>}
                    {onSwap && ak && (
                      <button className={"lib-swap" + (active ? " on" : "")}
                              onClick={() => onSwap(ak, active ? null : { name: d.name, how: d.how })}>
                        <Icon name={active ? "check" : "swap_horiz"} size={14} />
                        {active ? "In today’s session" : "Use in today’s session"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
