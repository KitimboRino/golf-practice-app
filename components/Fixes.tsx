"use client";

import { useState } from "react";
import { CATALOG, Area, Fault, detectFaults } from "@/lib/faults";
import { SavedSession } from "@/lib/db";
import { Icon } from "./Icon";

const GROUPS: { area: Area; label: string; icon: string }[] = [
  { area: "driving", label: "Driving", icon: "sports_golf" },
  { area: "irons", label: "Irons", icon: "golf_course" },
  { area: "chipping", label: "Chipping", icon: "swipe_up" },
];

const MISS_TO_FAULT: Record<string, string> = { right: "slice", left: "hook", strike: "fat" };

function yourMiss(history: SavedSession[], plannedMiss: string): { fault: Fault; context: string | null } | null {
  const latest = history[history.length - 1];
  if (latest) {
    const hits = detectFaults(latest);
    if (hits.length) {
      const d = latest.driving;
      const total = d.fairway + d.left + d.right;
      const missed = d.left + d.right;
      const context = total >= 4 && missed
        ? `${missed} of ${total} tee shots missed ${d.right >= d.left ? "right" : "left"} last session`
        : null;
      return { fault: hits[0].fault, context };
    }
  }
  const id = MISS_TO_FAULT[plannedMiss];
  const f = id && CATALOG.find((x) => x.id === id);
  return f ? { fault: f, context: "From your setup answer" } : null;
}

export function Fixes({
  onBack, history = [], plannedMiss = "", onPractice,
}: {
  onBack?: () => void;
  history?: SavedSession[];
  plannedMiss?: string;
  onPractice?: (fault: Fault) => void;
}) {
  const [selected, setSelected] = useState<Fault | null>(null);
  const mine = yourMiss(history, plannedMiss);
  const hero = selected ?? mine?.fault ?? null;
  const heroContext = selected ? null : mine?.context ?? null;
  const rest = CATALOG.filter((f) => f.id !== hero?.id);

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
          </div>
        </div>
      </header>

      <div className="screen">
        {hero ? (
          <div className="fault-hero">
            <div className="eyebrow" style={{ color: "var(--clay)" }}>
              <Icon name="my_location" size={15} />
              {heroContext ?? "Your miss"}
            </div>
            <div className="fault-hero-pat">{hero.pattern}</div>
            <div className="fault-hero-lines">
              <div className="fault-line"><span className="fault-k">Likely</span>{hero.fault}</div>
              <div className="fault-line"><span className="fault-k fix">Fix</span>{hero.fix}</div>
            </div>
            {onPractice && (
              <button className="fault-hero-go" onClick={() => onPractice(hero)}>
                <Icon name="sports_golf" size={16} />Practice this fix now
              </button>
            )}
          </div>
        ) : (
          <div className="fault-note">
            <span className="icon-tile sm dim"><Icon name="info" size={15} /></span>
            <span>Log a session and the pattern you&apos;re fighting shows up here with the fix ready.</span>
          </div>
        )}

        <div className="fault-note">
          <span className="icon-tile sm dim"><Icon name="info" size={15} /></span>
          <span>A miss pattern points to the most likely fault, not a certain one — try it first, but a lesson beats a table.</span>
        </div>

        {GROUPS.map((g) => {
          const rows = rest.filter((f) => f.area === g.area);
          if (!rows.length) return null;
          return (
            <div className="grp" key={g.area}>
              <div className="sec-head">
                <span className="icon-tile sm"><Icon name={g.icon} size={15} /></span>
                <h3>{g.label}</h3>
                <span className="count-pill">{rows.length}</span>
              </div>
              <div className="hist">
                {rows.map((f) => (
                  <button key={f.id} className="fault-row" onClick={() => setSelected(f)}>
                    <span>
                      <b>{f.pattern}</b>
                      <small>{f.fault.split(" — ")[0]}</small>
                    </span>
                    <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
