"use client";

import { useRef, useState } from "react";
import { SavedSession, SavedRound, AreaKey, exportBackup, importBackup, isAdhoc } from "@/lib/db";
import { PLAN } from "@/lib/plan";
import { solidPct, fairwayPct, puttPct, pitchPct } from "@/lib/stats";
import { roundStats } from "@/lib/round";
import { detectFaults } from "@/lib/faults";
import { verdict, areaMoves, AREA_RATES } from "@/lib/verdict";
import { Goal, goalProgress } from "@/lib/goal";
import { AreaIcon } from "./AreaIcon";
import { useCountUp } from "@/lib/useCountUp";
import { useToast } from "./Toast";
import { useConfirm } from "./Confirm";
import { Icon } from "./Icon";
import { Glyph } from "./Glyph";
import { Mark } from "./Mark";

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(+d) ? iso : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
const wkNum = (id: string) => id.replace(/[^0-9]/g, "") || "0";
// solid rate for plan sessions; for a quick session, the first logged area's rate
const rowRate = (s: SavedSession): number => {
  if (!isAdhoc(s)) return solidPct(s);
  for (const a of AREA_RATES) { const r = a.rate(s); if (r !== null) return r; }
  return 0;
};
const sLabel = (l: string) => {
  const n = l.replace(/[^0-9]/g, "");
  if (!n) return l;
  return "S" + n[0] + (/test/i.test(l) ? " Test" : "");
};

function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Trends({
  history, rounds, onDelete, onEdit, onStart, onImported, onBack, openData,
  goal, onSaveGoal, onClearGoal,
}: {
  history: SavedSession[];
  rounds: SavedRound[];
  onDelete: (id: string) => void;
  onEdit: (s: SavedSession) => void;
  onStart: () => void;
  onImported: () => void;
  onBack: () => void;
  openData?: boolean; // jump straight to the Data & backup menu — the More screen's "Back them up" link
  goal: Goal | null;
  onSaveGoal: (g: Goal) => void;
  onClearGoal: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [showData, setShowData] = useState(!!openData);
  const [openId, setOpenId] = useState<string | null>(null);
  const [wkFilter, setWkFilter] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { confirm } = useConfirm();

  async function doExport() {
    downloadText(`rangecard-${new Date().toISOString().slice(0, 10)}.json`, await exportBackup());
    setShowData(false);
  }

  async function doImport(file: File) {
    if (!/\.json$/i.test(file.name) && file.type && !/json/.test(file.type)) {
      toast.show("Pick a .json backup file");
      return;
    }
    if (file.size > 8_000_000) {
      toast.show("That file is too large to import");
      return;
    }
    const ok = await confirm({
      title: "Import this backup?",
      body: "Sessions, rounds and games from the file are merged in. Anything with the same id as a record you already have is overwritten.",
      confirmLabel: "Import",
    });
    if (!ok) return;
    try {
      const { added, skipped } = await importBackup(await file.text());
      onImported();
      setShowData(false);
      toast.show(
        `Imported ${added} record${added === 1 ? "" : "s"}` +
        (skipped ? `, skipped ${skipped} invalid row${skipped === 1 ? "" : "s"}` : ""),
      );
    } catch (e) {
      toast.show(e instanceof Error ? e.message : "Could not read that file");
    }
  }

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept="application/json,.json"
      hidden
      onChange={(e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f) doImport(f);
      }}
    />
  );

  if (history.length === 0) {
    const s = PLAN[0].sessions[0];
    return (
      <>
        <header className="hdr">
          <div className="hdr-row" style={{ alignItems: "center" }}>
            <button className="icon-btn" onClick={onBack} aria-label="Back">
              <Icon name="arrow_back" size={22} />
            </button>
            <div style={{ flex: 1 }}>
              <div className="hdr-title">Trends</div>
              <div className="hdr-sub">No sessions yet</div>
            </div>
          </div>
        </header>
        <div className="empty-wrap">
          <Mark size={300} className="empty-watermark" />
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
                Log one range session and this page fills in: solid strikes, fairways found,
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
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={17} />Restore from a backup
          </button>
          {fileInput}
        </div>
      </>
    );
  }

  // each chart only plots sessions that actually logged that area
  // (a quick putting-only session shouldn't drop the fairways line to 0)
  const driveN = (s: SavedSession) => s.driving.fairway + s.driving.left + s.driving.right;
  const ironN = (s: SavedSession) => s.irons.solid + s.irons.fat + s.irons.thin;
  const pitchN = (s: SavedSession) => { const p = s.pitching ?? { close: 0, short: 0, long: 0 }; return p.close + p.short + p.long; };
  const puttN = (s: SavedSession) => s.putting.in + s.putting.out;

  const solid = history.filter((s) => driveN(s) + ironN(s) > 0).map(solidPct);
  const fair = history.filter((s) => driveN(s) > 0).map(fairwayPct);
  const putt = history.filter((s) => puttN(s) > 0).map(puttPct);
  const pitch = history.filter((s) => pitchN(s) > 0).map(pitchPct);
  const pitchLogged = history.some((s) => pitchN(s) > 0);

  const weeks = PLAN.filter((w) => history.some((s) => s.weekId === w.id));
  const histRows = wkFilter ? history.filter((s) => s.weekId === wkFilter) : history;
  const shown = showAll ? histRows : histRows.slice(-4);

  // baseline (first logged session) vs Test day — or vs latest if the test isn't logged yet
  // quick sessions are excluded — the compare is a plan-progress view
  const planHist = history.filter((s) => !isAdhoc(s));
  const baseline = planHist[0];
  const testIdx = planHist.findIndex((s) => s.weekId === "week4" && /test/i.test(s.sessionLabel));
  const target = testIdx >= 0 ? planHist[testIdx] : planHist[planHist.length - 1];
  const showCompare = planHist.length >= 2 && !!baseline && !!target && baseline.id !== target.id;

  return (
    <>
      <header className="hero">
        <div className="hero-row">
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="hero-h">Trends</div>
            <div className="hero-sub">
              {history.length} {history.length === 1 ? "session" : "sessions"} · weeks 1-4
            </div>
          </div>
          <button
            className={"icon-btn" + (showData ? " on" : "")}
            aria-label="Data & backup"
            aria-expanded={showData}
            onClick={() => setShowData((v) => !v)}
          >
            <Icon name="tune" size={22} />
          </button>
        </div>
      </header>

      <div className="sheet">
        {showData && (
          <div className="datamenu">
            <button onClick={doExport}>
              <Icon name="download" size={19} color="var(--icon-muted)" />
              <span><b>Export backup</b><small>{history.length} sessions → .json file</small></span>
            </button>
            <button onClick={() => fileRef.current?.click()}>
              <Icon name="upload" size={19} color="var(--icon-muted)" />
              <span><b>Import backup</b><small>Merge sessions from a .json file</small></span>
            </button>
          </div>
        )}
        {fileInput}

        <VerdictCard history={history} />

        <GoalCard history={history} goal={goal} onSave={onSaveGoal} onClear={onClearGoal} />

        <PracticeToRound history={history} rounds={rounds} />

        {detectFaults(history[history.length - 1]).map((h, i) => (
          <div className="coach" key={`${h.fault.id}-${i}`}>
            <Icon name="conversion_path" size={18} color="var(--blue-icon)" style={{ marginTop: 1 }} />
            <div className="coach-body">
              <div className="coach-h">{h.fault.pattern}</div>
              <div className="coach-note">{h.note}</div>
              <div className="coach-fix">
                <b>Fix</b>{h.fault.fix}
              </div>
            </div>
          </div>
        ))}

        {showCompare && (
          <Compare baseline={baseline} target={target} isTest={testIdx >= 0} />
        )}

        <ChartCard title="Solid strike %" icon="sports_golf" data={solid} />
        <ChartCard title="Fairways found %" icon="golf_course" data={fair} />
        {pitchLogged && <ChartCard title="Pitch accuracy %" icon="arrow_outward" data={pitch} />}
        <ChartCard title="Putts made %" icon="adjust" data={putt} />

        <MissPatterns history={history} />

        <div className="grp" style={{ paddingTop: 8 }}>
          <div className="sec-head">
            <span className="icon-tile sm"><Icon name="history" size={15} /></span>
            <h3>Session history</h3>
            <span className="count-pill">{histRows.length}</span>
          </div>
          {weeks.length > 1 && (
            <div className="chips">
              <button className={"chip-btn" + (wkFilter === null ? " on" : "")}
                      onClick={() => setWkFilter(null)}>All</button>
              {weeks.map((w) => (
                <button key={w.id}
                        className={"chip-btn" + (wkFilter === w.id ? " on" : "")}
                        onClick={() => { setWkFilter(w.id); setShowAll(true); }}>
                  W{wkNum(w.id)}
                </button>
              ))}
            </div>
          )}
          <div className="hist">
            {shown.slice().reverse().map((r) => {
              const open = openId === r.id;
              return (
                <div className="hist-item" key={r.id}>
                  <div className="hist-row">
                    <button
                      className="hist-open"
                      aria-expanded={open}
                      onClick={() => setOpenId(open ? null : r.id)}
                    >
                      <div className="hist-l">
                        <div className="wk">
                          {isAdhoc(r) ? "Quick session" : `W${wkNum(r.weekId)} · ${sLabel(r.sessionLabel)}`}
                          {r.notes && <Icon name="edit_note" size={14} color="var(--icon-muted)" />}
                        </div>
                        <div className="dt">{fmtDate(r.date)}</div>
                      </div>
                    </button>
                    <div className="hist-r">
                      <div className="hist-solid num">{rowRate(r)}%</div>
                      <button
                        className="hist-del"
                        aria-label="Delete session"
                        onClick={() => onDelete(r.id)}
                      >
                        <Icon name="delete" size={19} />
                      </button>
                      <Icon name="expand_more" size={20} color="var(--icon-muted)"
                            className={"hist-chev" + (open ? " open" : "")} />
                    </div>
                  </div>
                  {open && (
                    <div className="hist-detail">
                      <div className="hist-tallies num">
                        <span><b>Driving</b> {r.driving.fairway}/{r.driving.left}/{r.driving.right}</span>
                        <span><b>Irons</b> {r.irons.solid}/{r.irons.fat}/{r.irons.thin}</span>
                        <span><b>Chipping</b> {r.chipping.on}/{r.chipping.off}
                          {r.chipping.bestClub ? ` · ${r.chipping.bestClub}` : ""}</span>
                        <span><b>Putting</b> {r.putting.in}/{r.putting.out}</span>
                      </div>
                      <div className={"hist-note" + (r.notes ? "" : " empty")}>
                        {r.notes || "No notes for this session"}
                      </div>
                      <button className="btn-ghost sm" onClick={() => onEdit(r)}>
                        <Icon name="edit" size={16} />Edit session
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {shown.length === 0 && (
              <div className="hist-empty">No sessions in this week yet.</div>
            )}
            {histRows.length > 4 && (
              <button className="hist-more" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Show fewer" : `Show all ${histRows.length} sessions`}
                <Icon name="expand_more" size={18} className={"rot-chev" + (showAll ? " open" : "")} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function VerdictCard({ history }: { history: SavedSession[] }) {
  const v = verdict(history);
  if (!v) return null;
  const { gaining, slipping } = areaMoves(history);
  const bars = Math.round((v.confidence / 4) * 4);
  return (
    <>
      <div className={"verdict " + v.tone}>
        <div className="verdict-h">{v.headline}</div>
        <div className="verdict-detail">{v.detail}</div>
        <div className="verdict-bars">
          {[0, 1, 2, 3].map((i) => <span key={i} className={i < bars ? "on" : ""} />)}
        </div>
        <div className="verdict-conf">{v.note}</div>
      </div>
      {(gaining || slipping) && (
        <div className="moves">
          {gaining && (
            <div className="move up">
              <div className="eyebrow"><Icon name="arrow_upward" size={15} />Gaining</div>
              <div className="move-area">{gaining.label}</div>
              <div className="move-note">{gaining.note}</div>
            </div>
          )}
          {slipping && (
            <div className="move down">
              <div className="eyebrow"><Icon name="arrow_downward" size={15} />Slipping</div>
              <div className="move-area">{slipping.label}</div>
              <div className="move-note">{slipping.note}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function GoalCard({
  history, goal, onSave, onClear,
}: {
  history: SavedSession[];
  goal: Goal | null;
  onSave: (g: Goal) => void;
  onClear: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [area, setArea] = useState<AreaKey>(goal?.area ?? "driving");
  const [target, setTarget] = useState(goal?.targetPct ?? 75);
  const [byDate, setByDate] = useState(goal?.byDate ?? "");

  function startEdit() {
    setArea(goal?.area ?? "driving");
    setTarget(goal?.targetPct ?? 75);
    setByDate(goal?.byDate ?? "");
    setEditing(true);
  }

  function save() {
    onSave({ area, targetPct: target, byDate: byDate || undefined, createdAt: goal?.createdAt ?? Date.now() });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="chart goalcard">
        <div className="sec-head">
          <span className="icon-tile sm"><Icon name="flag" size={15} /></span>
          <h3>{goal ? "Edit goal" : "Set a goal"}</h3>
        </div>
        <div className="goal-area-row">
          <div className="rgrp-lbl">Area</div>
          <div className="chips">
            {AREA_RATES.map((a) => (
              <button key={a.key} className={"chip-btn" + (area === a.key ? " on" : "")}
                      aria-pressed={area === a.key}
                      onClick={() => setArea(a.key as AreaKey)}>
                <AreaIcon area={a.key as AreaKey} size={15} />{a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="putt-step">
          <button onClick={() => setTarget((t) => Math.max(5, t - 5))} aria-label="Lower target">
            <Icon name="remove" size={20} />
          </button>
          <span className="num">{target}%</span>
          <button onClick={() => setTarget((t) => Math.min(100, t + 5))} aria-label="Raise target">
            <Icon name="add" size={20} />
          </button>
        </div>
        <div className="setup-row">
          <div className="rgrp-lbl">By (optional)</div>
          <input className="datefield" type="date" value={byDate}
                 min={new Date().toISOString().slice(0, 10)}
                 onChange={(e) => setByDate(e.target.value)} />
        </div>
        <div className="goal-actions">
          <button className="cta" onClick={save}><Icon name="flag" size={17} />{goal ? "Save" : "Set goal"}</button>
          <button className="btn-ghost sm" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <button className="more-row" onClick={startEdit}>
        <span className="more-ic"><Icon name="flag" size={20} color="var(--green)" /></span>
        <span className="more-txt">
          <b>Set a goal</b>
          <span>Pick an area and a target, track it right here</span>
        </span>
        <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
      </button>
    );
  }

  const def = AREA_RATES.find((a) => a.key === goal.area)!;
  const prog = goalProgress(history, goal);
  const pct = prog.currentPct;
  const fillPct = pct === null ? 0 : Math.min(100, Math.round((pct / goal.targetPct) * 100));

  return (
    <div className={"chart goalcard" + (prog.met ? " met" : "")}>
      <div className="sec-head">
        <span className="icon-tile sm"><AreaIcon area={goal.area} size={15} /></span>
        <h3>{def.label} goal</h3>
        <button className="goal-edit" onClick={startEdit} aria-label="Edit goal"><Icon name="edit" size={16} /></button>
      </div>
      {prog.met ? (
        <div className="goal-met">
          <Icon name="emoji_events" size={20} fill color="var(--green)" />
          <span>Goal reached — {pct}% against a {goal.targetPct}% target.</span>
        </div>
      ) : pct === null ? (
        <div className="goal-empty">Log a {def.label.toLowerCase()} session to start tracking this.</div>
      ) : (
        <>
          <div className="goal-track">
            <div className="goal-fill" style={{ width: `${fillPct}%` }} />
          </div>
          <div className="goal-meta">
            <span>{pct}% current</span>
            <span>{goal.targetPct}% target</span>
          </div>
        </>
      )}
      {goal.byDate && !prog.met && (
        <div className="goal-days">
          {prog.daysLeft !== null && prog.daysLeft >= 0
            ? `${prog.daysLeft} day${prog.daysLeft === 1 ? "" : "s"} left`
            : "Past your target date"}
        </div>
      )}
      <button className="goal-clear" onClick={onClear}>Clear goal</button>
    </div>
  );
}

// Range sessions and on-course rounds are tracked as two separate domains
// everywhere else in this app (Trends never reads rounds; Round never reads
// sessions) — this is the one place that puts a practice metric and its
// on-course counterpart side by side, so "is the range work paying off"
// has an actual answer instead of two charts in two different tabs.
function avgEarlyVsRecent(vals: number[]): { early: number; recent: number } | null {
  if (vals.length < 2) return null;
  const n = Math.max(1, Math.min(3, Math.floor(vals.length / 2)));
  const avg = (a: number[]) => Math.round(a.reduce((x, y) => x + y, 0) / a.length);
  return { early: avg(vals.slice(0, n)), recent: avg(vals.slice(-n)) };
}

function PracticeToRound({ history, rounds }: { history: SavedSession[]; rounds: SavedRound[] }) {
  const driveVals = history
    .filter((s) => s.driving.fairway + s.driving.left + s.driving.right > 0)
    .map(fairwayPct);
  const strikeVals = history
    .filter((s) =>
      s.driving.fairway + s.driving.left + s.driving.right +
      s.irons.solid + s.irons.fat + s.irons.thin > 0)
    .map(solidPct);
  const firVals = rounds
    .map((r) => roundStats(r.holeData).firPct)
    .filter((v): v is number => v !== null);
  const girVals = rounds
    .map((r) => roundStats(r.holeData).girPct)
    .filter((v): v is number => v !== null);

  const pairs = [
    { label: "Fairways", practiceLabel: "Range · start line", courseLabel: "Course · fairways hit",
      practice: avgEarlyVsRecent(driveVals), course: avgEarlyVsRecent(firVals) },
    { label: "Ball-striking", practiceLabel: "Range · solid contact", courseLabel: "Course · greens in reg.",
      practice: avgEarlyVsRecent(strikeVals), course: avgEarlyVsRecent(girVals) },
  ].filter((p): p is typeof p & { practice: { early: number; recent: number }; course: { early: number; recent: number } } =>
    !!p.practice && !!p.course);

  // needs real movement on both ends before saying anything about transfer —
  // a 1-2 point wobble either way is just noise, not a verdict
  if (!pairs.length) return null;

  return (
    <div className="chart p2r">
      <div className="sec-head">
        <span className="icon-tile sm"><Icon name="trending_flat" size={15} /></span>
        <h3>Is it showing up on the course?</h3>
      </div>
      {pairs.map((p) => {
        const practiceDelta = p.practice.recent - p.practice.early;
        const courseDelta = p.course.recent - p.course.early;
        const transferring = practiceDelta >= 3 && courseDelta > 0;
        const notYet = practiceDelta >= 3 && courseDelta <= 0;
        return (
          <div className="p2r-row" key={p.label}>
            <div className="p2r-h">{p.label}</div>
            <div className="p2r-pair">
              <div className="p2r-side">
                <span className="p2r-lbl">{p.practiceLabel}</span>
                <span className="p2r-num num">{p.practice.early}<small>%</small> → {p.practice.recent}<small>%</small></span>
              </div>
              <div className="p2r-side">
                <span className="p2r-lbl">{p.courseLabel}</span>
                <span className="p2r-num num">{p.course.early}<small>%</small> → {p.course.recent}<small>%</small></span>
              </div>
            </div>
            <div className={"p2r-note" + (transferring ? " good" : notYet ? " warn" : "")}>
              {transferring
                ? "Showing up on the course too."
                : notYet
                ? "Moving at the range, not yet on the course — worth testing under more pressure."
                : "Not enough movement yet to call it either way."}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MissPatterns({ history }: { history: SavedSession[] }) {
  const sum = (fn: (s: SavedSession) => number) => history.reduce((a, s) => a + fn(s), 0);
  const pit = (s: SavedSession) => s.pitching ?? { close: 0, short: 0, long: 0 };
  const drove = history.some((s) => s.driving.fairway + s.driving.left + s.driving.right > 0);
  const ironed = history.some((s) => s.irons.solid + s.irons.fat + s.irons.thin > 0);
  const pitched = history.some((s) => { const p = pit(s); return p.close + p.short + p.long > 0; });
  if (!drove && !ironed && !pitched) return null;

  return (
    <div className="chart">
      <div className="sec-head" style={{ marginBottom: 2 }}>
        <span className="icon-tile sm"><Icon name="explore" size={15} /></span>
        <h3>Miss patterns</h3>
        <span className="count-pill">Bias</span>
      </div>
      {drove && (
        <MissBar label="Driving" leftName="Left" rightName="Right"
                 left={sum((s) => s.driving.left)} right={sum((s) => s.driving.right)} />
      )}
      {ironed && (
        <MissBar label="Irons" leftName="Fat" rightName="Thin"
                 left={sum((s) => s.irons.fat)} right={sum((s) => s.irons.thin)} />
      )}
      {pitched && (
        <MissBar label="Pitching" leftName="Short" rightName="Long"
                 left={sum((s) => pit(s).short)} right={sum((s) => pit(s).long)} />
      )}
    </div>
  );
}

function MissBar({
  label, leftName, rightName, left, right,
}: {
  label: string; leftName: string; rightName: string; left: number; right: number;
}) {
  const total = left + right;
  const lPct = total ? Math.round((left / total) * 100) : 0;
  const rPct = total ? 100 - lPct : 0;
  const lead = !total ? null : lPct >= 65 ? leftName : rPct >= 65 ? rightName : null;

  return (
    <div className="miss">
      <div className="miss-head">
        <span className="miss-title">{label}</span>
        <span className="miss-counts num">
          {total
            ? `${left} ${leftName.toLowerCase()} · ${right} ${rightName.toLowerCase()}`
            : "no misses logged"}
        </span>
      </div>
      {total ? (
        <>
          <div className="bias-track">
            <span className="l" style={{ width: `${lPct}%` }} />
            <span className="r" style={{ width: `${rPct}%` }} />
          </div>
          <div className="bias-ends"><span>{leftName}</span><span>{rightName}</span></div>
        </>
      ) : (
        <div className="miss-clean"><Icon name="check_circle" size={15} />Clean strikes only</div>
      )}
      {lead && <div className="miss-take">Leaning {lead.toLowerCase()}</div>}
    </div>
  );
}

function Compare({
  baseline, target, isTest,
}: {
  baseline: SavedSession;
  target: SavedSession;
  isTest: boolean;
}) {
  const rows: { name: string; fn: (s: SavedSession) => number }[] = [
    { name: "Solid strike", fn: solidPct },
    { name: "Fairways found", fn: fairwayPct },
    { name: "Putts made", fn: puttPct },
  ];
  const tag = (s: SavedSession) => `W${wkNum(s.weekId)}·${sLabel(s.sessionLabel)}`;

  return (
    <div className="compare">
      <div className="compare-head">
        <div className="chart-t">
          <Icon name="flag" size={18} color="var(--icon-muted)" />
          Baseline → {isTest ? "Test day" : "Latest"}
        </div>
        <div className="compare-sub">
          {tag(baseline)} · {fmtDate(baseline.date)} &nbsp;→&nbsp; {tag(target)} · {fmtDate(target.date)}
        </div>
      </div>
      {rows.map(({ name, fn }) => {
        const from = fn(baseline);
        const to = fn(target);
        const d = to - from;
        const tone = d > 0 ? "up" : d < 0 ? "down" : "flat";
        return (
          <div className="compare-row" key={name}>
            <div className="compare-label">{name}</div>
            <div className="compare-nums num">
              <span className="from">{from}%</span>
              <Icon name="arrow_forward" size={14} color="var(--icon-muted)" />
              <span className="to">{to}%</span>
            </div>
            <div className={"compare-delta " + tone}>
              {d > 0 ? "+" : d < 0 ? "−" : "±"}{Math.abs(d)}
            </div>
          </div>
        );
      })}
    </div>
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
  const shownVal = useCountUp(last);

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
        <div className="chart-val num">{shownVal}<span className="u">%</span></div>
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
