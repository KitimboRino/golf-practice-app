"use client";

import { useState } from "react";
import { SavedSession } from "@/lib/db";
import { PLAN } from "@/lib/plan";
import { solidPct, fairwayPct, puttPct } from "@/lib/stats";
import { Icon } from "./Icon";

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(+d) ? iso : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const wkNum = (id: string) => id.replace(/[^0-9]/g, "") || "0";
const sLabel = (l: string) => {
  const n = l.replace(/[^0-9]/g, "");
  if (!n) return l;
  return "S" + n[0] + (/test/i.test(l) ? " Test" : "");
};

export function Trends({
  history, onDelete, onStart,
}: {
  history: SavedSession[];
  onDelete: (id: string) => void;
  onStart: () => void;
}) {
  const [showAll, setShowAll] = useState(false);

  if (history.length === 0) {
    const s = PLAN[0].sessions[0];
    return (
      <>
        <header className="hdr">
          <div className="hdr-row">
            <div>
              <div className="hdr-title">Trends</div>
              <div className="hdr-sub">No sessions yet</div>
            </div>
          </div>
        </header>
        <div className="empty-wrap">
          <div className="empty-card">
            <svg viewBox="0 0 260 76" style={{ width: "100%", height: 76, display: "block" }}>
              <line x1="6" y1="66" x2="254" y2="66" className="chart-base" />
              <path d="M6 56 L68 44 L130 48 L192 28 L254 14" fill="none" stroke="var(--border)" strokeWidth="2.2" strokeDasharray="4 7" strokeLinecap="round" />
              <circle cx="6" cy="56" r="5" fill="var(--green)" />
              <circle cx="6" cy="56" r="11" fill="none" stroke="var(--green)" strokeOpacity="0.3" strokeWidth="1.5" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <div className="empty-h">Your first line starts today</div>
              <div className="empty-p">
                Log one range session and this page fills in — solid strikes, fairways found,
                putts made, session by session.
              </div>
            </div>
            <button className="cta" onClick={onStart}>
              <Icon name="play_arrow" size={22} fill />Log your first session
            </button>
          </div>
          <div className="grp" style={{ padding: "0 4px" }}>
            <div className="grp-lbl">{PLAN[0].short} · {PLAN[0].title} starts with</div>
            <div className="empty-drills">
              <div><Icon name="near_me" size={18} color="var(--blue)" />{s.drive.name}</div>
              <div><Icon name="stacked_line_chart" size={18} color="var(--blue)" />{s.iron.name}</div>
              <div><Icon name="door_sliding" size={18} color="var(--blue)" />{s.chip.name}</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const solid = history.map(solidPct);
  const fair = history.map(fairwayPct);
  const putt = history.map(puttPct);
  const shown = showAll ? history : history.slice(-4);

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-title">Trends</div>
            <div className="hdr-sub">
              {history.length} {history.length === 1 ? "session" : "sessions"} · weeks 1–4
            </div>
          </div>
          <button className="icon-btn" aria-label="Filter"><Icon name="tune" size={22} /></button>
        </div>
      </header>

      <div className="screen">
        <ChartCard title="Solid strike %" icon="sports_golf" data={solid} />
        <ChartCard title="Fairways found %" icon="golf_course" data={fair} />
        <ChartCard title="Putts made %" icon="adjust" data={putt} />

        <div className="grp" style={{ paddingTop: 8 }}>
          <div className="label-row"><Icon name="history" size={16} />History</div>
          <div className="hist">
            {shown.slice().reverse().map((r) => (
              <div className="hist-row" key={r.id}>
                <div className="hist-l">
                  <div className="wk">W{wkNum(r.weekId)} · {sLabel(r.sessionLabel)}</div>
                  <div className="dt">{fmtDate(r.date)}</div>
                </div>
                <div className="hist-r">
                  <div className="hist-solid num">{solidPct(r)}%</div>
                  <button
                    className="hist-del"
                    aria-label="Delete session"
                    onClick={() => { if (confirm("Delete this session?")) onDelete(r.id); }}
                  >
                    <Icon name="delete" size={19} />
                  </button>
                </div>
              </div>
            ))}
            {history.length > 4 && (
              <button className="hist-more" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Show fewer" : `Show all ${history.length} sessions`}
                <Icon name={showAll ? "expand_less" : "expand_more"} size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ChartCard({
  title, icon, data,
}: {
  title: string;
  icon: string;
  data: number[];
}) {
  const n = data.length;
  const last = data[n - 1];
  const delta = n > 1 ? last - data[n - 2] : null;

  const X = (i: number) => (n <= 1 ? 150 : 10 + i * (280 / (n - 1)));
  const Y = (v: number) => 78 - (v / 100) * 64;
  const line = data.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  const area = `${line} L ${X(n - 1).toFixed(1)} 78 L ${X(0).toFixed(1)} 78 Z`;
  const gid = "ar-" + title.replace(/\W/g, "");

  return (
    <div className="chart">
      <div className="chart-top">
        <div>
          <div className="chart-t"><Icon name={icon} size={18} color="var(--icon-muted)" />{title}</div>
          {delta !== null && (
            <div className={"chart-delta" + (delta < 0 ? " down" : "")}>
              <Icon name={delta < 0 ? "arrow_downward" : "arrow_upward"} size={15} />
              {Math.abs(delta)} pts vs last session
            </div>
          )}
        </div>
        <div className="chart-val num">{last}<span className="u">%</span></div>
      </div>
      <svg viewBox="0 0 300 86">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "currentColor", stopOpacity: "var(--area-stop)" }} />
            <stop offset="1" style={{ stopColor: "currentColor", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <line x1="10" y1="78" x2="290" y2="78" className="chart-base" />
        <line x1="10" y1="14" x2="290" y2="14" className="chart-grid" />
        {n > 1 && <path d={area} fill={`url(#${gid})`} />}
        <path d={line} className="chart-line" />
        <circle cx={X(n - 1)} cy={Y(last)} r="4.5" className="chart-marker" />
      </svg>
      <div className="chart-ax"><span>S1</span><span>S{n}</span></div>
    </div>
  );
}
