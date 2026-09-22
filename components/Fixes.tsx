"use client";

import { useState } from "react";
import { CATALOG, Area, Fault, detectFaults } from "@/lib/faults";
import { SavedSession } from "@/lib/db";
import { Icon } from "./Icon";
import { AreaIcon } from "./AreaIcon";

const GROUPS: { area: Area; label: string }[] = [
  { area: "driving", label: "Driving" },
  { area: "irons", label: "Irons" },
  { area: "chipping", label: "Chipping" },
];

const MISS_TO_FAULT: Record<string, string> = { right: "slice", left: "hook", strike: "fat" };

// Ball-flight sketch for each fault — the shape of the miss, at a glance,
// instead of only reading the pattern text. Address (green dot, bottom-centre)
// → path (clay) → landing (clay dot), against a dashed "where you aimed" line.
// Same inline-SVG, zero-asset idiom as the Trends/Round empty-state sketches.
const FLIGHT: Record<string, { d: string; end: [number, number] }> = {
  slice:        { d: "M50 90 C40 66 40 40 70 12", end: [70, 12] },
  push:         { d: "M50 90 L66 12", end: [66, 12] },
  hook:         { d: "M50 90 C64 66 64 40 34 12", end: [34, 12] },
  sky:          { d: "M50 90 C46 60 48 40 50 22", end: [50, 22] },
  top:          { d: "M50 90 C60 89 72 87 84 85", end: [84, 85] },
  "heavy-chip": { d: "M50 90 C55 82 60 78 64 80", end: [64, 80] },
  shank:        { d: "M50 90 L88 58", end: [88, 58] },
  pull:         { d: "M50 90 L34 12", end: [34, 12] },
};

function FlightPath({ id, size = 84 }: { id: string; size?: number }) {
  const f = FLIGHT[id] ?? FLIGHT.push;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="flight-path" aria-hidden>
      <line x1="50" y1="90" x2="50" y2="10" className="flight-target" />
      <path d={f.d} fill="none" className="flight-line" />
      <circle cx="50" cy="90" r="3.5" className="flight-ball" />
      <circle cx={f.end[0]} cy={f.end[1]} r="3.5" className="flight-land" />
    </svg>
  );
}

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
  onBack, history = [], plannedMiss = "", onPractice, onBrowseDrills,
}: {
  onBack?: () => void;
  history?: SavedSession[];
  plannedMiss?: string;
  onPractice?: (fault: Fault) => void;
  onBrowseDrills?: (fault: Fault) => void;
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
            <div className="hdr-title">Fixes</div>
          </div>
        </div>
      </header>

      <div className="screen">
        {hero ? (
          <div className="fault-hero">
            <div className="fault-hero-top">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow" style={{ color: "var(--clay)" }}>
                  <Icon name="my_location" size={15} />
                  {heroContext ?? "Your miss"}
                </div>
                <div className="fault-hero-pat">{hero.pattern}</div>
              </div>
              <FlightPath id={hero.id} size={76} />
            </div>
            <div className="fault-hero-lines">
              <div className="fault-line"><span className="fault-k">Likely</span><b>{hero.name}.</b> {hero.fault}</div>
              <div className="fault-line"><span className="fault-k fix">Fix</span>{hero.fix}</div>
            </div>
            <div className="fault-hero-actions">
              {onPractice && (
                <button className="fault-hero-go" onClick={() => onPractice(hero)}>
                  <Icon name="bolt" size={16} fill />Practice this now
                </button>
              )}
              {onBrowseDrills && (
                <button className="fault-hero-alt" onClick={() => onBrowseDrills(hero)}>
                  <Icon name="menu_book" size={15} />Drills
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="fault-note">
            <span className="icon-tile sm dim"><Icon name="info" size={15} /></span>
            <span>Log a session and the pattern you&apos;re fighting shows up here with the fix ready.</span>
          </div>
        )}

        <div className="fault-note">
          <span className="icon-tile sm dim"><Icon name="info" size={15} /></span>
          <span>A miss pattern points to the most likely fault, not a certain one. Try it first, but a lesson beats a table.</span>
        </div>

        {GROUPS.map((g) => {
          const rows = rest.filter((f) => f.area === g.area);
          if (!rows.length) return null;
          return (
            <div className="grp" key={g.area}>
              <div className="sec-head">
                <span className="icon-tile sm"><AreaIcon area={g.area} size={15} /></span>
                <h3>{g.label}</h3>
                <span className="count-pill">{rows.length}</span>
              </div>
              <div className="hist">
                {rows.map((f) => (
                  <button key={f.id} className="fault-row" onClick={() => setSelected(f)}>
                    <FlightPath id={f.id} size={34} />
                    <span>
                      <b>{f.pattern}</b>
                      <small>{f.name}</small>
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
