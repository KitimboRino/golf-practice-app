"use client";

import { useState } from "react";
import { CATALOG, Area, Fault, detectFaults } from "@/lib/faults";
import { SavedSession, SavedSwing } from "@/lib/db";
import { SWING_BASELINE, statusFor } from "@/lib/swingBaseline";
import { Icon } from "./Icon";
import { AreaIcon } from "./AreaIcon";
import { PhotoHeader } from "./PhotoHeader";

const GROUPS: { area: Area; label: string }[] = [
  { area: "driving", label: "Driving" },
  { area: "irons", label: "Irons" },
  { area: "chipping", label: "Chipping" },
  { area: "pitching", label: "Pitching" },
  { area: "putting", label: "Putting" },
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
  // some height, but the dig costs enough energy that it comes up well short
  // of a full pitch's normal arc (contrast with the driving faults above,
  // which all reach near the top of the frame)
  "pitch-dig":  { d: "M50 90 C52 72 56 58 62 46", end: [62, 46] },
  // a putt doesn't fly, it rolls — this stays near the ground line the whole
  // way rather than arcing, the one shape here that isn't a flight at all
  "putt-tension": { d: "M50 90 C54 89 60 88 68 87", end: [68, 87] },
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

// A terse, one-line stat for the hero card's eyebrow — not h.note (that's a
// full explanatory sentence, meant for the Trends "coach" card instead).
// Scoped per fault id rather than always reading driving data: that used to
// be hardcoded here regardless of which fault actually matched, so a
// putting or pitching fault would show a driving tee-shot stat next to it.
// "heavy-chip" is left out on purpose — it's reused for both an irons- and
// a chipping-triggered pattern, so there's no single area to report here
// without knowing which one actually fired; falls back to "Your miss".
function contextFor(fault: Fault, latest: SavedSession): string | null {
  if (fault.id === "slice" || fault.id === "hook") {
    const d = latest.driving;
    const total = d.fairway + d.left + d.right;
    const missed = d.left + d.right;
    return total >= 4 && missed
      ? `${missed} of ${total} tee shots missed ${d.right >= d.left ? "right" : "left"} last session`
      : null;
  }
  if (fault.id === "pitch-dig") {
    const p = latest.pitching ?? { close: 0, short: 0, long: 0 };
    const total = p.close + p.short + p.long;
    return total >= 4 ? `${p.short} of ${total} pitches came up short last session` : null;
  }
  if (fault.id === "putt-tension") {
    const putt = latest.putting;
    const total = putt.in + putt.out;
    return total >= 4 ? `${putt.out} of ${total} putts missed last session` : null;
  }
  return null;
}

// Corroborating evidence from Swing check, not a replacement for the
// ball-flight context above — only for slice/hook, where shoulder/hip
// rotation at the top is actually relevant, and only when the latest swing
// check's top-of-backswing reading falls outside the (already-approximate)
// baseline range. Framed as "worth a look", matching Swing check's own
// "compass, not verdict" tone — this is two rough signals agreeing, not a
// diagnosis.
function swingEvidenceFor(fault: Fault, swings: SavedSwing[]): string | null {
  if (fault.id !== "slice" && fault.id !== "hook") return null;
  const latest = swings[swings.length - 1];
  if (!latest) return null;
  const top = latest.measurements.top;
  const base = SWING_BASELINE.top;
  const shoulderStatus = statusFor(top.shoulderTurnDeg, base.shoulderTurnDeg);
  const hipStatus = statusFor(top.hipTurnDeg, base.hipTurnDeg);
  if (shoulderStatus !== "in") {
    return `Your last swing check also showed shoulder turn at the top ` +
      `${shoulderStatus === "low" ? "below" : "above"} the typical range (${top.shoulderTurnDeg}°) — worth a look`;
  }
  if (hipStatus !== "in") {
    return `Your last swing check also showed hip turn at the top ` +
      `${hipStatus === "low" ? "below" : "above"} the typical range (${top.hipTurnDeg}°) — worth a look`;
  }
  return null;
}

function yourMiss(
  history: SavedSession[], plannedMiss: string, swings: SavedSwing[],
): { fault: Fault; context: string | null; swingEvidence: string | null } | null {
  const latest = history[history.length - 1];
  if (latest) {
    const hits = detectFaults(latest);
    if (hits.length) {
      return {
        fault: hits[0].fault,
        context: contextFor(hits[0].fault, latest),
        swingEvidence: swingEvidenceFor(hits[0].fault, swings),
      };
    }
  }
  const id = MISS_TO_FAULT[plannedMiss];
  const f = id && CATALOG.find((x) => x.id === id);
  return f ? { fault: f, context: "From your setup answer", swingEvidence: swingEvidenceFor(f, swings) } : null;
}

export function Fixes({
  onBack, history = [], plannedMiss = "", swings = [], onPractice, onBrowseDrills,
}: {
  onBack?: () => void;
  history?: SavedSession[];
  plannedMiss?: string;
  swings?: SavedSwing[];
  onPractice?: (fault: Fault) => void;
  onBrowseDrills?: (fault: Fault) => void;
}) {
  const [selected, setSelected] = useState<Fault | null>(null);
  const mine = yourMiss(history, plannedMiss, swings);
  const hero = selected ?? mine?.fault ?? null;
  const heroContext = selected ? null : mine?.context ?? null;
  const heroSwingEvidence = selected ? null : mine?.swingEvidence ?? null;
  const rest = CATALOG.filter((f) => f.id !== hero?.id);

  return (
    <>
      <PhotoHeader
        src="/iron-balls.webp"
        alt="An iron and four golf balls on practice turf"
        height={280}
        position="50% 45%"
        imgW={900}
        imgH={600}
        top={onBack && (
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
        )}
        bottom={
          <>
            <h1 className="photo-hdr-title">Fixes</h1>
            <span className="photo-hdr-sub">Your miss, and the first thing to try</span>
          </>
        }
      />

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
            {heroSwingEvidence && (
              <div className="fault-swing-evidence">
                <Icon name="videocam" size={14} />
                {heroSwingEvidence}
              </div>
            )}
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
