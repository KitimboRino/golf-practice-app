"use client";

import { useState } from "react";
import { RoundHole, SavedRound, AreaKey } from "@/lib/db";
import {
  LiveRound, freshHoles, roundStats, roundLabel,
  leakReport, practiceNoun, LeakCategory, LEAK_BENCHMARK,
} from "@/lib/round";
import { useConfirm } from "./Confirm";
import { tapFx, bumpFx } from "@/lib/haptics";
import { Icon } from "./Icon";

type PracticeFocus = { title: string; body: string };

const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(+d) ? iso : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// ---------------------------------------------------------------------------

export function Round({
  liveRound, onChange, onStart, onFinish, onDiscard, rounds, onViewRound, onDeleteRound, onPractice,
}: {
  liveRound: LiveRound | null;
  onChange: (r: LiveRound) => void;
  onStart: (r: LiveRound) => void;
  onFinish: (r: LiveRound) => void;
  onDiscard: () => void;
  rounds: SavedRound[];
  onViewRound: (r: SavedRound) => void;
  onDeleteRound: (id: string) => void;
  onPractice: (areas: AreaKey[], focus: PracticeFocus) => void;
}) {
  const [diag, setDiag] = useState(false);

  if (liveRound) {
    return <RoundPlay round={liveRound} onChange={onChange} onFinish={onFinish} onDiscard={onDiscard} />;
  }
  if (diag && rounds.length) {
    return <RoundDiagnostic rounds={rounds} onBack={() => setDiag(false)} onPractice={onPractice} />;
  }
  return (
    <RoundSetup
      onStart={onStart}
      rounds={rounds}
      onViewRound={onViewRound}
      onDeleteRound={onDeleteRound}
      onDiagnostic={() => setDiag(true)}
    />
  );
}

// ---------------------------------------------------------------------------
// setup

function RoundSetup({
  onStart, rounds, onViewRound, onDeleteRound, onDiagnostic,
}: {
  onStart: (r: LiveRound) => void;
  rounds: SavedRound[];
  onViewRound: (r: SavedRound) => void;
  onDeleteRound: (id: string) => void;
  onDiagnostic: () => void;
}) {
  const [holes, setHoles] = useState<9 | 18>(18);
  const [course, setCourse] = useState("");

  const start = () => {
    onStart({
      date: today(),
      course: course.trim(),
      holes,
      holeData: freshHoles(holes),
      current: 0,
      startedAt: Date.now(),
    });
  };

  const recent = [...rounds].reverse().slice(0, 6);

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-title">Round</div>
            <div className="hdr-sub">On-course stats, hole by hole</div>
          </div>
        </div>
      </header>

      <div className="screen">
        <div className="grp">
          <div className="grp-lbl">How many holes?</div>
          <div className="hole-pick">
            {([9, 18] as const).map((n) => (
              <button
                key={n}
                className={"hole-opt" + (holes === n ? " on" : "")}
                aria-pressed={holes === n}
                onClick={() => setHoles(n)}
              >
                <span className="hole-opt-n num">{n}</span>
                <span>holes</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grp" style={{ gap: 8 }}>
          <label className="grp-lbl" htmlFor="course">Course <span style={{ color: "var(--hint)" }}>(optional)</span></label>
          <div className="field">
            <Icon name="golf_course" size={19} color="var(--icon-muted)" />
            <input
              id="course"
              value={course}
              maxLength={80}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="e.g. Rosapenna, Old Tom Morris"
            />
          </div>
        </div>

        <button className="cta" onClick={start}>
          <Icon name="play_arrow" size={22} fill />
          Start {holes}-hole round
        </button>

        {rounds.length > 0 && (
          <button className="more-row" style={{ marginTop: 4 }} onClick={onDiagnostic}>
            <span className="more-ic"><Icon name="troubleshoot" size={22} color="var(--green)" /></span>
            <span className="more-txt">
              <b>Where you&apos;re losing shots</b>
              <span>
                {rounds.length === 1
                  ? "A rough read from your round"
                  : `A rough read across ${rounds.length} rounds`}
              </span>
            </span>
            <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
          </button>
        )}

        {recent.length > 0 && (
          <div className="grp" style={{ paddingTop: 6 }}>
            <div className="sec-head">
              <span className="icon-tile sm"><Icon name="history" size={15} /></span>
              <h3>Recent rounds</h3>
              <span className="count-pill">{rounds.length}</span>
            </div>
            <div className="hist">
              {recent.map((r) => {
                const st = roundStats(r.holeData);
                return (
                  <div className="hist-item" key={r.id}>
                    <div className="hist-row">
                      <button className="hist-open" onClick={() => onViewRound(r)}>
                        <div className="hist-l">
                          <div className="wk">{roundLabel(r)}</div>
                          <div className="dt">
                            {fmtDate(r.date)} · {r.holes} holes · {st.putts} putts
                          </div>
                        </div>
                      </button>
                      <div className="hist-r">
                        <div className="hist-solid num">{st.girPct}%</div>
                        <button
                          className="hist-del"
                          aria-label={`Delete ${roundLabel(r)}`}
                          onClick={() => onDeleteRound(r.id)}
                        >
                          <Icon name="delete" size={19} />
                        </button>
                        <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// per-hole logger

function Bin({
  on, label, tone, icon, onClick,
}: {
  on: boolean; label: string; tone: "yes" | "no"; icon: string; onClick: () => void;
}) {
  return (
    <button className={`rbtn ${tone}` + (on ? " on" : "")} aria-pressed={on} onClick={onClick}>
      <Icon name={icon} size={20} />
      {label}
    </button>
  );
}

function RoundPlay({
  round, onChange, onFinish, onDiscard,
}: {
  round: LiveRound;
  onChange: (r: LiveRound) => void;
  onFinish: (r: LiveRound) => void;
  onDiscard: () => void;
}) {
  const { confirm } = useConfirm();
  const i = round.current;
  const h = round.holeData[i];
  const last = i === round.holes - 1;
  const st = roundStats(round.holeData.slice(0, i + (h ? 1 : 0)));

  const setHole = (patch: Partial<RoundHole>) => {
    const next = round.holeData.slice();
    next[i] = { ...next[i], ...patch };
    onChange({ ...round, holeData: next });
  };

  const setPar = (par: 3 | 4 | 5) => {
    tapFx();
    setHole({
      par,
      fairwayHit: par === 3 ? null : (h.fairwayHit === null ? false : h.fairwayHit),
    });
  };
  const setFairway = (hit: boolean) => { tapFx(); setHole({ fairwayHit: hit }); };
  const setGir = (gir: boolean) => {
    tapFx();
    setHole({ gir, upAndDown: gir ? false : (h.upAndDown ?? false) });
  };
  const setPutts = (d: number) => {
    const v = Math.max(0, Math.min(8, h.putts + d));
    if (v === h.putts) { bumpFx(); return; }
    tapFx();
    setHole({ putts: v });
  };
  const setUpDown = (v: boolean) => { tapFx(); setHole({ upAndDown: v }); };

  const go = (d: number) => {
    const c = Math.max(0, Math.min(round.holes - 1, i + d));
    if (c !== i) onChange({ ...round, current: c });
  };
  const finish = () => onFinish(round);

  async function quit() {
    const ok = await confirm({
      title: "Discard this round?",
      body: "The holes you've logged won't be saved.",
      confirmLabel: "Discard",
      tone: "danger",
    });
    if (ok) onDiscard();
  }

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-eyebrow">{round.course || "Round"}</div>
            <div className="hdr-title sm">Hole {i + 1} of {round.holes}</div>
            <div className="hdr-sub sm">
              {st.firOf > 0 && `FIR ${st.firMade}/${st.firOf} · `}
              GIR {st.girMade}/{st.girOf} · {st.putts} putt{st.putts === 1 ? "" : "s"}
            </div>
          </div>
          <button className="link-btn" onClick={quit}>Discard</button>
        </div>
        <div className="pbar"><span style={{ transform: `scaleX(${(i + 1) / round.holes})` }} /></div>
      </header>

      <div className="screen log">
        <div className="rgrp">
          <div className="rgrp-lbl">Par</div>
          <div className="rrow">
            {([3, 4, 5] as const).map((p) => (
              <button
                key={p}
                className={"rbtn par" + (h.par === p ? " on" : "")}
                aria-pressed={h.par === p}
                onClick={() => setPar(p)}
              >
                <span className="num">{p}</span>
              </button>
            ))}
          </div>
        </div>

        {h.par !== 3 && (
          <div className="rgrp">
            <div className="rgrp-lbl">Fairway</div>
            <div className="rrow">
              <Bin on={h.fairwayHit === true} label="Hit" tone="yes" icon="check" onClick={() => setFairway(true)} />
              <Bin on={h.fairwayHit === false} label="Missed" tone="no" icon="close" onClick={() => setFairway(false)} />
            </div>
          </div>
        )}

        <div className="rgrp">
          <div className="rgrp-lbl">Green in regulation</div>
          <div className="rrow">
            <Bin on={h.gir} label="Hit" tone="yes" icon="check" onClick={() => setGir(true)} />
            <Bin on={!h.gir} label="Missed" tone="no" icon="close" onClick={() => setGir(false)} />
          </div>
        </div>

        <div className="rgrp">
          <div className="rgrp-lbl">Putts</div>
          <div className="putt-step">
            <button aria-label="One fewer putt" onClick={() => setPutts(-1)} disabled={h.putts <= 0}>
              <Icon name="remove" size={24} />
            </button>
            <span className="num">{h.putts}</span>
            <button aria-label="One more putt" onClick={() => setPutts(1)}>
              <Icon name="add" size={24} />
            </button>
          </div>
        </div>

        {!h.gir && (
          <div className="rgrp">
            <div className="rgrp-lbl">Up &amp; down</div>
            <div className="rrow">
              <Bin on={h.upAndDown === true} label="Got it" tone="yes" icon="check" onClick={() => setUpDown(true)} />
              <Bin on={h.upAndDown === false} label="No" tone="no" icon="close" onClick={() => setUpDown(false)} />
            </div>
          </div>
        )}

        <div className="rnav">
          <button className="btn-ghost" onClick={() => go(-1)} disabled={i === 0}>
            <Icon name="arrow_back" size={18} />Back
          </button>
          {last ? (
            <button className="cta rnav-finish" onClick={finish}>
              <Icon name="done_all" size={20} />Finish round
            </button>
          ) : (
            <button className="cta rnav-next" onClick={() => go(1)}>
              Next hole<Icon name="arrow_forward" size={20} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// summary (a just-finished round, or a saved one from the list)

export function RoundSummary({
  round, fresh, onDone,
}: {
  round: SavedRound;
  fresh: boolean;
  onDone: () => void;
}) {
  const s = roundStats(round.holeData);

  const rows: { label: string; value: string; sub?: string }[] = [
    {
      label: "Fairways hit",
      value: s.firPct === null ? "—" : `${s.firPct}%`,
      sub: s.firOf ? `${s.firMade} of ${s.firOf}` : "no par 4s or 5s",
    },
    { label: "Greens in regulation", value: `${s.girPct}%`, sub: `${s.girMade} of ${s.girOf}` },
    { label: "Total putts", value: `${s.putts}`, sub: `${s.puttsPerHole} per hole` },
    {
      label: "Scrambling",
      value: s.scramblePct === null ? "—" : `${s.scramblePct}%`,
      sub: s.scrambleOf ? `${s.scrambleMade} of ${s.scrambleOf} greens missed` : "hit every green",
    },
    { label: "Three-putts", value: `${s.threePutts}`, sub: s.threePutts === 1 ? "hole" : "holes" },
  ];

  function share() {
    const lines = [
      `RangeCard · ${roundLabel(round)} · ${fmtDate(round.date)}`,
      `Fairways ${s.firPct === null ? "n/a" : s.firPct + "%"} (${s.firMade}/${s.firOf})`,
      `GIR ${s.girPct}% (${s.girMade}/${s.girOf})`,
      `Putts ${s.putts} · ${s.puttsPerHole}/hole · ${s.threePutts} three-putt${s.threePutts === 1 ? "" : "s"}`,
      `Scrambling ${s.scramblePct === null ? "n/a" : s.scramblePct + "%"}`,
    ].join("\n");
    if (navigator.share) navigator.share({ text: lines }).catch(() => {});
    else navigator.clipboard?.writeText(lines).catch(() => {});
  }

  return (
    <div className="welcome-wrap" style={{ alignItems: "flex-start", paddingTop: 34 }}>
      <div className="receipt">
        <div className="receipt-top">
          <span className="icon-tile lg glow"><Icon name={fresh ? "check" : "golf_course"} size={26} fill /></span>
          <div className="receipt-h">{fresh ? "Round logged" : roundLabel(round)}</div>
          <div className="receipt-meta">
            {fresh && round.course?.trim() ? `${round.course.trim()} · ` : ""}
            {fmtDate(round.date)} · {round.holes} holes
          </div>
        </div>

        <div className="receipt-moved">
          <div className="round-stat-grid">
            {rows.map((r) => (
              <div className="round-stat" key={r.label}>
                <div className="round-stat-v num">{r.value}</div>
                <div className="round-stat-l">{r.label}</div>
                {r.sub && <div className="round-stat-s">{r.sub}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="receipt-actions">
          <button className="cta" onClick={share}>
            <Icon name="ios_share" size={22} />Share this card
          </button>
          <button className="btn-ghost" onClick={onDone}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// "Where you're losing shots" — leak diagnostic across saved rounds

const DIR_ICON = { improving: "trending_up", slipping: "trending_down", flat: "trending_flat" } as const;

// value/benchmark positions on the 0-100 track for a category
function barGeom(c: LeakCategory): { fillPct: number; markPct: number } {
  if (c.value === null) return { fillPct: 0, markPct: 0 };
  if (c.key === "putting") {
    // display scale: 2.4 putts/hole (poor, left) → 1.5 (great, right)
    const lo = 1.5, hi = 2.4;
    const map = (v: number) => Math.max(2, Math.min(100, ((hi - v) / (hi - lo)) * 100));
    return { fillPct: map(c.value), markPct: map(c.target) };
  }
  return {
    fillPct: Math.max(2, Math.min(100, c.value)),
    markPct: Math.max(0, Math.min(100, c.target)),
  };
}

function LeakSpark({ values, tone }: { values: number[]; tone: "up" | "down" | "flat" }) {
  const n = values.length;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const X = (i: number) => 3 + i * (94 / (n - 1));
  const Y = (v: number) => 23 - ((v - min) / span) * 18;
  const d = values.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  return (
    <svg className="leak-spark" viewBox="0 0 100 26" aria-hidden="true">
      <path d={d} className={tone} />
    </svg>
  );
}

function LeakCard({
  cat, rank, onPractice,
}: {
  cat: LeakCategory;
  rank: number;
  onPractice: (areas: AreaKey[], focus: PracticeFocus) => void;
}) {
  const g = barGeom(cat);
  const isTop = rank === 0 && cat.status === "below";
  const tag =
    cat.status === "below" ? (cat.costPerRound >= 1 ? `~${Math.round(cat.costPerRound)} shots/round` : "under a shot")
    : cat.status === "around" ? "On the mark"
    : cat.status === "above" ? "Strength"
    : "Not enough data";

  return (
    <div className={"leak " + cat.status}>
      <div className="leak-head">
        <span className="leak-rank num">{cat.status === "below" ? `#${rank + 1}` : "·"}</span>
        <span className="leak-title">{cat.label}</span>
        {isTop
          ? <span className="leak-flag">Biggest leak</span>
          : <span className="leak-cost">{tag}</span>}
      </div>

      {cat.measurable && (
        <>
          <div className="leak-track">
            <span className="leak-fill" style={{ width: `${g.fillPct}%` }} />
            <span className="leak-mark" style={{ left: `${g.markPct}%` }} />
          </div>
          <div className="leak-scale num">
            <span>{cat.valueText} {LEAK_BENCHMARK[cat.key].noun}</span>
            <span>benchmark {cat.targetText}</span>
          </div>
        </>
      )}

      <p className="leak-read">{cat.read}</p>

      {cat.trend.length >= 2 && cat.trendDir && (
        <div className="leak-trend">
          <LeakSpark
            values={cat.trend}
            tone={cat.trendDir === "improving" ? "up" : cat.trendDir === "slipping" ? "down" : "flat"}
          />
          <span className={"leak-dir " + cat.trendDir}>
            <Icon name={DIR_ICON[cat.trendDir]} size={14} />
            {cat.trendDir === "improving" ? "Improving" : cat.trendDir === "slipping" ? "Slipping" : "Steady"}
            {" over your last "}{cat.trend.length} rounds
          </span>
        </div>
      )}

      <button
        className="leak-practice"
        onClick={() => onPractice(cat.areas, {
          title: `From your rounds: ${practiceNoun(cat.areas)}`,
          body: cat.read,
        })}
      >
        <Icon name="play_arrow" size={16} fill />
        Practise {practiceNoun(cat.areas)}
      </button>
    </div>
  );
}

export function RoundDiagnostic({
  rounds, onBack, onPractice,
}: {
  rounds: SavedRound[];
  onBack: () => void;
  onPractice: (areas: AreaKey[], focus: PracticeFocus) => void;
}) {
  const report = leakReport(rounds);
  const noLeak = !!report && !report.categories.some((c) => c.status === "below");

  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="hdr-title sm">Where you&apos;re losing shots</div>
            {report && (
              <div className="hdr-sub sm">
                From your last {report.rounds} round{report.rounds === 1 ? "" : "s"} · {report.holes} holes
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="screen">
        {!report ? (
          <p className="leak-read">Log a round first and this page will show you where the shots are going.</p>
        ) : (
          <>
            <p className="app-foot" style={{ marginTop: 0 }}>
              <Icon name="info" size={13} />
              An indicative guide from basic stats — fairways, greens, putts, up-and-downs. Not
              tour-grade strokes-gained; treat the shot numbers as rough signposts.
            </p>

            {noLeak && (
              <div className="leak-clear">
                <Icon name="check_circle" size={18} color="var(--green)" style={{ flex: "none", marginTop: 1 }} />
                <span>No stand-out leak — every part of your game is around the benchmark or better.
                  Keep logging rounds and this will sharpen.</span>
              </div>
            )}

            {report.categories.map((c, i) => (
              <LeakCard key={c.key} cat={c} rank={i} onPractice={onPractice} />
            ))}
          </>
        )}
      </div>
    </>
  );
}
