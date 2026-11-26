"use client";

import { useState } from "react";
import type { SavedSession } from "@/lib/db";
import { isAdhoc } from "@/lib/db";

// Strata: every session is one layer, stacked oldest at the bottom like rock
// strata. Each layer is split into the five practice areas, each filled in
// that area's colour to the session's success rate in it. Over weeks the
// stack shows which colours are growing — the shape of your game changing.

type AreaKey = "chipping" | "pitching" | "irons" | "driving" | "putting";

const AREAS: { key: AreaKey; short: string; name: string; rate: (s: SavedSession) => number | null }[] = [
  { key: "chipping", short: "Chip", name: "Chipping", rate: (s) => pct(s.chipping.on, s.chipping.on + s.chipping.off) },
  { key: "pitching", short: "Pitch", name: "Pitching", rate: (s) => { const p = s.pitching ?? { close: 0, short: 0, long: 0 }; return pct(p.close, p.close + p.short + p.long); } },
  { key: "irons", short: "Irons", name: "Irons", rate: (s) => pct(s.irons.solid, s.irons.solid + s.irons.fat + s.irons.thin) },
  { key: "driving", short: "Drive", name: "Driving", rate: (s) => pct(s.driving.fairway, s.driving.fairway + s.driving.left + s.driving.right) },
  { key: "putting", short: "Putt", name: "Putting", rate: (s) => pct(s.putting.in, s.putting.in + s.putting.out) },
];
// null = the area wasn't logged that session (shown empty, never as 0%)
function pct(good: number, total: number): number | null {
  return total ? Math.round((good / total) * 100) : null;
}

const MAX_LAYERS = 14;
const tagOf = (s: SavedSession) =>
  isAdhoc(s) ? "Quick" : `W${s.weekId.replace(/[^0-9]/g, "") || "?"}·${s.sessionLabel.replace(/[^0-9]/g, "").slice(0, 1) || "?"}`;
const dateOf = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(+d) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

export function Strata({ history }: { history: SavedSession[] }) {
  // newest first, so it renders at the top of the stack
  const layers = history.slice(-MAX_LAYERS).reverse();
  const [picked, setPicked] = useState<string | null>(layers[0]?.id ?? null);
  if (layers.length < 2) return null;
  const sel = layers.find((s) => s.id === picked) ?? layers[0];

  return (
    <section className="strata" aria-labelledby="strata-h">
      <div className="strata-head">
        <h2 id="strata-h" className="strata-title">Your strata</h2>
        <p className="strata-sub">One layer per session, newest on top. Each colour fills to that area&apos;s success rate.</p>
      </div>

      <div className="strata-key" aria-hidden="true">
        <span />
        {AREAS.map((a) => (
          <span key={a.key} className={`strata-key-i area-${a.key}`}><i />{a.short}</span>
        ))}
      </div>

      <div className="strata-stack" role="group" aria-label="Sessions, newest first">
        {layers.map((s, r) => {
          const on = s.id === sel.id;
          const rates = AREAS.map((a) => a.rate(s));
          const spoken = AREAS.map((a, i) => `${a.name} ${rates[i] === null ? "not logged" : rates[i] + "%"}`).join(", ");
          return (
            <button
              key={s.id}
              className={"strata-layer" + (on ? " on" : "")}
              style={{ "--r": r } as React.CSSProperties}
              aria-pressed={on}
              aria-label={`${tagOf(s)}, ${dateOf(s.date)}: ${spoken}`}
              onClick={() => setPicked(s.id)}
            >
              <span className="strata-tag">{tagOf(s)}</span>
              {AREAS.map((a, i) => (
                <span key={a.key} className={`strata-cell area-${a.key}` + (rates[i] === null ? " none" : "")}>
                  <i style={{ "--w": (rates[i] ?? 0) / 100 } as React.CSSProperties} />
                </span>
              ))}
            </button>
          );
        })}
      </div>

      <div className="strata-detail" aria-live="polite">
        <span className="strata-detail-h">{tagOf(sel)} · {dateOf(sel.date)}</span>
        <span className="strata-detail-row">
          {AREAS.map((a) => {
            const v = a.rate(sel);
            return (
              <span key={a.key} className={`strata-detail-i area-${a.key}`}>
                <i aria-hidden="true" />{a.short} <b className="num">{v === null ? "–" : `${v}%`}</b>
              </span>
            );
          })}
        </span>
      </div>
    </section>
  );
}
