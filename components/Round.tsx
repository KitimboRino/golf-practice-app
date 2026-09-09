"use client";

import { useState } from "react";
import { RoundHole, SavedRound, AreaKey } from "@/lib/db";
import {
  LiveRound, RoundStats, freshHoles, roundStats, roundLabel,
  leakReport, practiceNoun, LeakCategory, LEAK_BENCHMARK,
} from "@/lib/round";
import { holeStrategy } from "@/lib/course";
import { useConfirm } from "./Confirm";
import { tapFx, bumpFx } from "@/lib/haptics";
import { Icon } from "./Icon";
import { Glyph } from "./Glyph";

type PracticeFocus = { title: string; body: string };

const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(+d) ? iso : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

// score relative to par, in golfer's terms
const scoreTerm = (rel: number): string => {
  if (rel <= -3) return "Albatross";
  if (rel === -2) return "Eagle";
  if (rel === -1) return "Birdie";
  if (rel === 0) return "Par";
  if (rel === 1) return "Bogey";
  if (rel === 2) return "Double";
  if (rel === 3) return "Triple";
  return `+${rel}`;
};
// round total against par, e.g. "+3", "E", "−2"
const toParLabel = (n: number) => (n === 0 ? "E" : n > 0 ? `+${n}` : `−${Math.abs(n)}`);

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
// scoring trend — a sparkline of to-par (normalised to 18) across recent rounds

function ScoringTrend({ trend, latest }: { trend: number[]; latest: RoundStats }) {
  const n = trend.length;
  const lo = Math.min(...trend, 0);
  const hi = Math.max(...trend, 0);
  const span = hi - lo || 1;
  const W = 300, H = 80, PAD = 8;
  const x = (i: number) => (n === 1 ? W / 2 : PAD + (i / (n - 1)) * (W - 2 * PAD));
  const y = (v: number) => H - PAD - ((v - lo) / span) * (H - 2 * PAD); // lower to-par sits higher
  const pts = trend.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const first = trend[0];
  const last = trend[n - 1];
  const dir = last < first - 0.5 ? "improving" : last > first + 0.5 ? "slipping" : "flat";

  return (
    <div className="chart" style={{ marginTop: 2 }}>
      <div className="chart-top">
        <div className="chart-t"><Icon name="show_chart" size={17} color="var(--green)" />Scoring</div>
        <div className="chart-val num">
          {toParLabel(latest.toPar)}<span className="u"> last round</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <line x1="0" y1={y(0)} x2={W} y2={y(0)} className="chart-grid" vectorEffect="non-scaling-stroke" />
        <polyline points={pts} className="chart-line" vectorEffect="non-scaling-stroke" />
        <circle cx={x(n - 1)} cy={y(last)} r="3.5" className="chart-marker" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="chart-ax">
        <span>{n} round{n === 1 ? "" : "s"}</span>
        <span className={`leak-dir ${dir}`}>
          <Icon name={DIR_ICON[dir]} size={13} />
          {dir === "improving" ? "trending lower" : dir === "slipping" ? "creeping up" : "steady"}
        </span>
      </div>
    </div>
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

  // scoring trend — to-par normalised to 18 holes so 9s and 18s sit on one axis
  const scoredRounds = rounds
    .map((r) => ({ r, s: roundStats(r.holeData) }))
    .filter(({ s }) => s.scoredHoles >= 5)
    .slice(-8);
  const trend = scoredRounds.map(({ s }) => (s.toPar / s.scoredHoles) * 18);
  const latest = scoredRounds[scoredRounds.length - 1]?.s;

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

        {trend.length >= 2 && latest && <ScoringTrend trend={trend} latest={latest} />}

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
                            {fmtDate(r.date)} · {r.holes} holes
                            {st.girPct !== null && ` · GIR ${st.girPct}%`}
                          </div>
                        </div>
                      </button>
                      <div className="hist-r">
                        <div className="hist-solid num">
                          {st.scoredHoles ? toParLabel(st.toPar) : st.girPct === null ? "–" : `${st.girPct}%`}
                        </div>
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

// A gentle, collapsed-by-default nudge from lib/course.ts, matched to the hole.
function StrategyStrip({
  par, missedFairway, holeIndex,
}: {
  par: 3 | 4 | 5;
  missedFairway: boolean;
  holeIndex: number;
}) {
  const strat = holeStrategy({ par, missedFairway }, holeIndex);
  if (!strat.rules.length) return null;
  return (
    <details className="strat-strip">
      <summary>
        <Icon name="lightbulb" size={15} color="var(--blue-icon)" />
        Strategy&nbsp;·&nbsp;{strat.reason}
        <Icon name="expand_more" size={18} className="flowstrip-chev" />
      </summary>
      <div className="strat-body">
        {strat.rules.map((r) => (
          <div className="strat-rule" key={r.rule}>
            <b>{r.rule}</b>
            <span>{r.detail}</span>
          </div>
        ))}
      </div>
    </details>
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
  // holes where the golfer actually tapped a fairway result (the model defaults
  // fairwayHit to false, so we can't infer a miss from the value alone)
  const [fwAnswered, setFwAnswered] = useState<Set<number>>(() => new Set());

  const setHole = (patch: Partial<RoundHole>) => {
    const next = round.holeData.slice();
    next[i] = { ...next[i], ...patch };
    onChange({ ...round, holeData: next });
  };

  const setPar = (par: 3 | 4 | 5) => {
    tapFx();
    // par 3 has no fairway; switching off par 3 leaves it unanswered
    setHole({ par, fairwayHit: par === 3 ? null : (h.fairwayHit ?? undefined) });
  };
  const setScore = (d: number) => {
    // first tap lands on par, then +/- adjusts from there
    const v = Math.max(1, Math.min(h.par + 10, h.score == null ? h.par : h.score + d));
    if (h.score != null && v === h.score) { bumpFx(); return; }
    tapFx();
    setHole({ score: v });
  };
  const setFairway = (result: "hit" | "left" | "right") => {
    tapFx();
    setFwAnswered((s) => new Set(s).add(i));
    setHole(result === "hit"
      ? { fairwayHit: true, fairwayMiss: undefined }
      : { fairwayHit: false, fairwayMiss: result });
  };
  const setGir = (gir: boolean) => {
    tapFx();
    // green hit → up-and-down is N/A; green missed → leave it unanswered
    setHole({ gir, upAndDown: gir ? null : h.upAndDown });
  };
  const setPutts = (d: number) => {
    const v = Math.max(0, Math.min(8, (h.putts ?? 0) + d));
    if (h.putts != null && v === h.putts) { bumpFx(); return; }
    tapFx();
    setHole({ putts: v });
  };
  const setUpDown = (v: boolean) => { tapFx(); setHole({ upAndDown: v }); };
  const setPenalty = (d: number) => {
    const v = Math.max(0, Math.min(6, (h.penalties ?? 0) + d));
    if (v === (h.penalties ?? 0)) { bumpFx(); return; }
    tapFx();
    setHole({ penalties: v || undefined });
  };

  const go = (d: number) => {
    const c = Math.max(0, Math.min(round.holes - 1, i + d));
    if (c !== i) onChange({ ...round, current: c });
  };
  const finish = () => onFinish(round);

  const editing = !!round.id;
  async function quit() {
    const ok = await confirm({
      title: editing ? "Discard changes?" : "Discard this round?",
      body: editing
        ? "This round stays as it was — your edits won't be saved."
        : "The holes you've logged won't be saved.",
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
            <div className="hdr-eyebrow">{editing ? "Editing · " : ""}{round.course || "Round"}</div>
            <div className="hdr-title sm">Hole {i + 1} of {round.holes}</div>
            <div className="hdr-sub sm">
              {[
                st.scoredHoles > 0 && `${toParLabel(st.toPar)} thru ${st.scoredHoles}`,
                st.firOf > 0 && `FIR ${st.firMade}/${st.firOf}`,
                st.girOf > 0 && `GIR ${st.girMade}/${st.girOf}`,
                st.puttsOf > 0 && `${st.putts} putt${st.putts === 1 ? "" : "s"}`,
              ].filter(Boolean).join(" · ") || "Tap to log this hole"}
            </div>
          </div>
          <button className="link-btn" onClick={quit}>{editing ? "Cancel" : "Discard"}</button>
        </div>
        <div className="stepdots" aria-hidden>
          {Array.from({ length: round.holes }, (_, n) => (
            <i key={n} className={n < i ? "done" : n === i ? "cur" : ""} />
          ))}
        </div>
      </header>

      <div className="screen log">
        {/* key by hole so it starts collapsed each hole, but still updates live
            as par / fairway change on the current hole */}
        <StrategyStrip
          key={i}
          par={h.par}
          missedFairway={h.fairwayHit === false && fwAnswered.has(i)}
          holeIndex={i}
        />

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

        <div className="rgrp">
          <div className="rgrp-lbl">Score</div>
          <div className="score-step">
            <button aria-label="One fewer stroke" onClick={() => setScore(-1)} disabled={h.score != null && h.score <= 1}>
              <Icon name="remove" size={24} />
            </button>
            <span className="score-step-val">
              <span className="num">{h.score ?? "–"}</span>
              {h.score != null && (
                <small className={h.score < h.par ? "under" : h.score > h.par ? "over" : ""}>
                  {scoreTerm(h.score - h.par)}
                </small>
              )}
            </span>
            <button aria-label="One more stroke" onClick={() => setScore(1)}>
              <Icon name="add" size={24} />
            </button>
          </div>
        </div>

        {h.par !== 3 && (
          <div className="rgrp">
            <div className="rgrp-lbl">Fairway</div>
            <div className="rrow">
              <Bin on={h.fairwayHit === true} label="Hit" tone="yes" icon="check" onClick={() => setFairway("hit")} />
              <Bin on={h.fairwayMiss === "left"} label="Left" tone="no" icon="arrow_back" onClick={() => setFairway("left")} />
              <Bin on={h.fairwayMiss === "right"} label="Right" tone="no" icon="arrow_forward" onClick={() => setFairway("right")} />
            </div>
          </div>
        )}

        <div className="rgrp">
          <div className="rgrp-lbl">Green in regulation</div>
          <div className="rrow">
            <Bin on={h.gir === true} label="Hit" tone="yes" icon="check" onClick={() => setGir(true)} />
            <Bin on={h.gir === false} label="Missed" tone="no" icon="close" onClick={() => setGir(false)} />
          </div>
        </div>

        <div className="rgrp">
          <div className="rgrp-lbl">Putts</div>
          <div className="putt-step">
            <button aria-label="One fewer putt" onClick={() => setPutts(-1)} disabled={h.putts != null && h.putts <= 0}>
              <Icon name="remove" size={24} />
            </button>
            <span className="num">{h.putts ?? "–"}</span>
            <button aria-label="One more putt" onClick={() => setPutts(1)}>
              <Icon name="add" size={24} />
            </button>
          </div>
        </div>

        {h.gir === false && (
          <div className="rgrp">
            <div className="rgrp-lbl">Up &amp; down</div>
            <div className="rrow">
              <Bin on={h.upAndDown === true} label="Got it" tone="yes" icon="check" onClick={() => setUpDown(true)} />
              <Bin on={h.upAndDown === false} label="No" tone="no" icon="close" onClick={() => setUpDown(false)} />
            </div>
          </div>
        )}

        <div className="pen-row">
          <span className="rgrp-lbl">Penalty strokes</span>
          <div className="pen-step">
            <button aria-label="One fewer penalty stroke" onClick={() => setPenalty(-1)} disabled={!(h.penalties ?? 0)}>
              <Icon name="remove" size={18} />
            </button>
            <span className="num">{h.penalties ?? 0}</span>
            <button aria-label="One more penalty stroke" onClick={() => setPenalty(1)}>
              <Icon name="add" size={18} />
            </button>
          </div>
        </div>

        {last && (
          <div className="rgrp">
            <div className="rgrp-lbl">Round note <span style={{ color: "var(--hint)", fontWeight: 600 }}>(optional)</span></div>
            <textarea
              className="notes"
              rows={2}
              maxLength={500}
              value={round.note ?? ""}
              onChange={(e) => onChange({ ...round, note: e.target.value })}
              placeholder="Anything to remember from this round?"
            />
          </div>
        )}

        <div className="rnav">
          <button className="btn-ghost" onClick={() => go(-1)} disabled={i === 0}>
            <Icon name="arrow_back" size={18} />Back
          </button>
          {last ? (
            <button className="cta rnav-finish" onClick={finish}>
              <Icon name="done_all" size={20} />{editing ? "Save changes" : "Finish round"}
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
  round, fresh, onDone, onEdit,
}: {
  round: SavedRound;
  fresh: boolean;
  onDone: () => void;
  onEdit?: () => void;
}) {
  const s = roundStats(round.holeData);

  const breakdown = [
    s.birdies && `${s.birdies} birdie${s.birdies === 1 ? "" : "s"}`,
    s.pars && `${s.pars} par${s.pars === 1 ? "" : "s"}`,
    s.bogeys && `${s.bogeys} bogey${s.bogeys === 1 ? "" : "s"}`,
    s.doubles && `${s.doubles} double+`,
  ].filter(Boolean).join(" · ");

  const rows: { label: string; value: string; sub?: string }[] = [
    {
      label: "Score",
      value: s.scoredHoles
        ? `${s.strokes}${s.scoredHoles < round.holeData.length ? ` / ${s.scoredHoles}` : ""}`
        : "—",
      sub: s.scoredHoles
        ? `${toParLabel(s.toPar)} to par${breakdown ? ` · ${breakdown}` : ""}`
        : "not logged",
    },
    {
      label: "Fairways hit",
      value: s.firPct === null ? "—" : `${s.firPct}%`,
      sub: s.firOf
        ? `${s.firMade} of ${s.firOf}${
            s.fairwayLeft || s.fairwayRight ? ` · missed ${s.fairwayLeft}L / ${s.fairwayRight}R` : ""
          }`
        : "no par 4s or 5s",
    },
    {
      label: "Greens in regulation",
      value: s.girPct === null ? "—" : `${s.girPct}%`,
      sub: s.girOf ? `${s.girMade} of ${s.girOf}` : "not logged",
    },
    {
      label: "Total putts",
      value: s.puttsOf ? `${s.putts}` : "—",
      sub: s.puttsPerHole === null ? "not logged" : `${s.puttsPerHole} per hole`,
    },
    {
      label: "Scrambling",
      value: s.scramblePct === null ? "—" : `${s.scramblePct}%`,
      sub: s.scrambleOf ? `${s.scrambleMade} of ${s.scrambleOf} greens missed` : "hit every green",
    },
    { label: "Three-putts", value: `${s.threePutts}`, sub: s.threePutts === 1 ? "hole" : "holes" },
  ];
  if (s.penalties > 0) {
    rows.push({
      label: "Penalty strokes",
      value: `${s.penalties}`,
      sub: `on ${s.penaltyHoles} hole${s.penaltyHoles === 1 ? "" : "s"}`,
    });
  }

  function share() {
    const lines = [
      `RangeCard · ${roundLabel(round)} · ${fmtDate(round.date)}`,
      s.scoredHoles ? `Score ${s.strokes} (${toParLabel(s.toPar)})${breakdown ? ` — ${breakdown}` : ""}` : null,
      `Fairways ${s.firPct === null ? "n/a" : s.firPct + "%"} (${s.firMade}/${s.firOf})`,
      `GIR ${s.girPct === null ? "n/a" : s.girPct + "%"} (${s.girMade}/${s.girOf})`,
      `Putts ${s.putts} · ${s.puttsPerHole ?? "n/a"}/hole · ${s.threePutts} three-putt${s.threePutts === 1 ? "" : "s"}`,
      `Scrambling ${s.scramblePct === null ? "n/a" : s.scramblePct + "%"}`,
      s.penalties > 0 ? `Penalties ${s.penalties}` : null,
    ].filter(Boolean).join("\n");
    if (navigator.share) navigator.share({ text: lines }).catch(() => {});
    else navigator.clipboard?.writeText(lines).catch(() => {});
  }

  return (
    <div className="welcome-wrap" style={{ alignItems: "flex-start", paddingTop: "calc(34px + env(safe-area-inset-top))" }}>
      <div className="receipt">
        <div className="receipt-top">
          <span className="icon-tile lg glow">
            {fresh ? <Glyph name="flag" /> : <Icon name="golf_course" size={26} fill />}
          </span>
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

        {round.note?.trim() && (
          <div className="receipt-note">
            <div className="eyebrow dim"><Icon name="bookmark" size={14} color="var(--blue-icon)" /> From this round</div>
            <div className="receipt-quote">&ldquo;{round.note.trim()}&rdquo;</div>
          </div>
        )}

        <div className="receipt-actions">
          <button className="cta" onClick={share}>
            <Icon name="ios_share" size={22} />Share this card
          </button>
          {!fresh && onEdit && (
            <button className="btn-ghost" onClick={onEdit}>
              <Icon name="edit" size={17} />Edit round
            </button>
          )}
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
