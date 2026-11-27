"use client";

import { useState } from "react";
import { RoundHole, SavedRound, SavedSession, AreaKey } from "@/lib/db";
import { scoringByPar, blowUps, teeMissSide, fairwaysByTeeClub, frontBack, holeHistory, HoleHistory } from "@/lib/roundPatterns";
import {
  LiveRound, RoundStats, freshHoles, roundStats, roundLabel,
  leakReport, practiceNoun, LeakCategory, LEAK_BENCHMARK,
  approachBreakdown, ApproachReport,
} from "@/lib/round";
import { holeStrategy } from "@/lib/course";
import { COURSES, CoursePreset, findCourse, holesForPreset } from "@/lib/courses";
import { shareCard } from "@/lib/shareCard";
import { useConfirm } from "./Confirm";
import { useToast } from "./Toast";
import { tapFx, bumpFx } from "@/lib/haptics";
import { Icon } from "./Icon";
import { AreaIcon } from "./AreaIcon";
import { GlareToggle } from "./GlareToggle";
import { CourseDiagram, COURSE_DIAGRAM } from "./CourseDiagram";
import { GreenDistance } from "./GreenDistance";
import { PhotoHeader } from "./PhotoHeader";
import { localDate } from "@/lib/date";

type PracticeFocus = { title: string; body: string; setup?: Partial<Record<AreaKey, { club?: string; dist?: number }>> };

const today = () => localDate();
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
  liveRound, onChange, onStart, onFinish, onDiscard, rounds, history, onViewRound, onDeleteRound, onPractice, initialDiag = false,
}: {
  initialDiag?: boolean; // open on "Where you're losing shots" (from the home card)
  liveRound: LiveRound | null;
  onChange: (r: LiveRound) => void;
  onStart: (r: LiveRound) => void;
  onFinish: (r: LiveRound) => void;
  onDiscard: () => void;
  rounds: SavedRound[];
  history: SavedSession[]; // range sessions, for the tee-miss comparison
  onViewRound: (r: SavedRound) => void;
  onDeleteRound: (id: string) => void;
  onPractice: (areas: AreaKey[], focus: PracticeFocus) => void;
}) {
  const [diag, setDiag] = useState(initialDiag);

  if (liveRound) {
    return <RoundPlay round={liveRound} rounds={rounds} onChange={onChange} onFinish={onFinish} onDiscard={onDiscard} />;
  }
  if (diag && rounds.length) {
    return <RoundDiagnostic rounds={rounds} history={history} onBack={() => setDiag(false)} onPractice={onPractice} />;
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
  const [courseId, setCourseId] = useState<string | null>(null);
  const preset = courseId ? findCourse(courseId) : undefined;

  const pickHoles = (n: 9 | 18) => {
    tapFx();
    setHoles(n);
    // a preset that doesn't cover this many holes can't stay selected —
    // Jinja's card, for one, is only corroborated for 9
    if (preset && preset.holes !== n) { setCourseId(null); setCourse(""); }
  };

  const pickCourse = (c: CoursePreset) => {
    tapFx();
    if (courseId === c.id) { setCourseId(null); setCourse(""); return; }
    setCourseId(c.id);
    setCourse(c.name);
    // the course drives hole count here, not the other way round — picking
    // Jinja (9 holes only) should just take you to a 9-hole round, not hide
    // the chip until you've guessed to switch hole count first
    setHoles(c.holes);
  };

  const start = () => {
    onStart({
      date: today(),
      course: course.trim(),
      holes,
      holeData: preset ? holesForPreset(preset) : freshHoles(holes),
      current: 0,
      startedAt: Date.now(),
    });
  };

  const recent = [...rounds].reverse().slice(0, 6);

  // courses typed on earlier rounds (not the presets above), newest first, so
  // the next round here uses the same name and hole history can find it
  const norm = (c: string) => c.trim().toLowerCase().replace(/\s+/g, " ");
  const presetKeys = new Set(COURSES.map((c) => norm(c.name)));
  const played: string[] = [];
  for (const r of [...rounds].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt))) {
    const name = (r.course ?? "").trim();
    if (name && !presetKeys.has(norm(name)) && !played.some((p) => norm(p) === norm(name))) played.push(name);
    if (played.length === 4) break;
  }

  // scoring trend — to-par normalised to 18 holes so 9s and 18s sit on one axis
  const scoredRounds = rounds
    .map((r) => ({ r, s: roundStats(r.holeData) }))
    .filter(({ s }) => s.scoredHoles >= 5)
    .slice(-8);
  const trend = scoredRounds.map(({ s }) => (s.toPar / s.scoredHoles) * 18);
  const latest = scoredRounds[scoredRounds.length - 1]?.s;

  return (
    <>
      <PhotoHeader
        src="/course-sunset.webp"
        alt="A green framed by a raked bunker at sunset, flags in the distance and hills behind"
        height={280}
        position="30% 50%"
        imgW={599}
        imgH={900}
        bottom={
          <>
            <h1 className="photo-hdr-title">Round</h1>
            <span className="photo-hdr-sub">On-course stats, hole by hole</span>
          </>
        }
      />

      <div className="screen">
        <div className="grp">
          <div className="grp-lbl">How many holes?</div>
          <div className="hole-pick">
            {([9, 18] as const).map((n) => (
              <button
                key={n}
                className={"hole-opt" + (holes === n ? " on" : "")}
                aria-pressed={holes === n}
                onClick={() => pickHoles(n)}
              >
                <span className="hole-opt-n num">{n}</span>
                <span>holes</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grp" style={{ gap: 8 }}>
          <label className="grp-lbl" htmlFor="course">Course <span style={{ color: "var(--hint)" }}>(optional)</span></label>
          <div className="chips">
            {COURSES.map((c) => (
              <button key={c.id} className={"chip-btn" + (courseId === c.id ? " on" : "")}
                      aria-pressed={courseId === c.id} onClick={() => pickCourse(c)}>
                {c.name}{c.holes !== holes && <span className="chip-note"> · {c.holes} holes</span>}
              </button>
            ))}
          </div>
          {played.length > 0 && (
            <div className="chips" role="group" aria-label="Courses you've played">
              {played.map((name) => (
                <button key={name} className={"chip-btn" + (!courseId && norm(course) === norm(name) ? " on" : "")}
                        aria-pressed={!courseId && norm(course) === norm(name)}
                        onClick={() => { setCourse(name); setCourseId(null); }}>
                  <Icon name="history" size={14} />{name}
                </button>
              ))}
            </div>
          )}
          <div className="field">
            <Icon name="golf_course" size={19} color="var(--icon-muted)" />
            <input
              id="course"
              value={course}
              maxLength={80}
              onChange={(e) => { setCourse(e.target.value); setCourseId(null); }}
              placeholder="e.g. Uganda Golf Club"
            />
          </div>
          {preset && (
            <div className="course-preset-note">
              <Icon name="info" size={14} />
              Par pre-filled from public scorecards, not the club&apos;s own card — worth checking hole by hole as you play.
            </div>
          )}
        </div>

        <button className="cta" onClick={start}>
          <Icon name="play_arrow" size={22} fill />
          Start {holes}-hole round
        </button>

        {rounds.length > 0 ? (
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
        ) : (
          <div className="round-empty">
            {/* a blank card: nine holes waiting, the first one ready */}
            <div className="ghost-card" aria-hidden="true">
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className={"ghost-hole" + (i === 0 ? " first" : "")}>{i + 1}</span>
              ))}
            </div>
            <div className="round-empty-h">Your first round starts the card</div>
            <div className="round-empty-p">
              Log fairways, greens and putts hole by hole. After a couple of rounds this tab
              turns into a scoring trend and a report on where you&apos;re actually losing shots.
            </div>
          </div>
        )}

        {trend.length >= 2 && latest && <ScoringTrend trend={trend} latest={latest} />}

        {recent.length > 0 && (
          <div className="grp" style={{ paddingTop: 6 }}>
            <div className="sec-head">
              <span className="icon-tile sm"><Icon name="history" size={15} /></span>
              <h2>Recent rounds</h2>
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

// A tiny top-down fairway — pin at top, ball where it actually finished. Same
// zero-asset inline-SVG idiom as the Fixes ball-flight sketches, but spatial
// rather than a shape: the tap updates a position, not a curve. Sits at rest
// on the tee (bottom centre, faint) until the hole answers Hit/Left/Right.
function FairwaySketch({ hit, miss }: { hit?: boolean; miss?: "left" | "right" }) {
  const pos: [number, number] =
    hit === true ? [50, 52] : miss === "left" ? [16, 58] : miss === "right" ? [84, 58] : [50, 100];
  const cls = hit === true ? "hit" : miss ? "miss" : "wait";
  return (
    <svg viewBox="0 0 100 110" width={44} height={48} className="fw-sketch" aria-hidden>
      <rect x="0" y="0" width="100" height="110" rx="8" className="fw-rough" />
      <path d="M30 108 L40 8 L60 8 L70 108 Z" className="fw-strip" />
      <circle cx="50" cy="8" r="4" className="fw-pin" />
      <circle cx={pos[0]} cy={pos[1]} r="6.5" className={"fw-ball " + cls} />
    </svg>
  );
}

function Bin({
  on, label, hint, tone, icon, onClick,
}: {
  on: boolean; label: string; hint?: string; tone: "yes" | "no"; icon: string; onClick: () => void;
}) {
  return (
    <button className={`rbtn ${tone}` + (on ? " on" : "") + (hint ? " tall" : "")} aria-pressed={on} onClick={onClick}>
      <span className="rbtn-main"><Icon name={icon} size={20} />{label}</span>
      {hint && <span className="rbtn-hint">{hint}</span>}
    </button>
  );
}

const TEE_CLUBS = ["Driver", "3W", "5W", "Hybrid", "Iron"];
const APPROACH_CLUBS = ["3W", "Hybrid", "Long iron", "Mid iron", "Short iron", "Wedge"];
const APPROACH_YDS = ["<75", "75–100", "100–125", "125–150", "150–175", "175+"];

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
        {strat.rules.map((r) => {
          const diagram = COURSE_DIAGRAM[r.rule];
          return (
            <div className={"strat-rule" + (diagram ? " with-diagram" : "")} key={r.rule}>
              {diagram && <CourseDiagram variant={diagram} size={46} />}
              <div>
                <b>{r.rule}</b>
                <span>{r.detail}</span>
              </div>
            </div>
          );
        })}
      </div>
    </details>
  );
}

// How this hole went on earlier rounds here: one quiet line, no tap needed
function HoleHistoryStrip({ hist }: { hist: HoleHistory }) {
  const lean = hist.missRight > hist.missLeft ? "right" : hist.missLeft > hist.missRight ? "left" : null;
  const fw = hist.fwOf
    ? `Fairway ${hist.fwHit} of ${hist.fwOf}${lean && hist.fwHit < hist.fwOf ? `, misses ${lean}` : ""}`
    : null;
  return (
    <div className="hole-hist">
      <Icon name="history" size={15} />
      <span>
        <b>Before here</b>{" "}
        <span className="num">{hist.recent.join(", ")}</span>
        {hist.played > 1 && <> · avg <span className="num">{fmtOver(hist.avgOver)}</span></>}
        {fw && <> · {fw}</>}
      </span>
    </div>
  );
}

function RoundPlay({
  round, rounds, onChange, onFinish, onDiscard,
}: {
  round: LiveRound;
  rounds: SavedRound[];
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
    // and a par 3 can't have missed a fairway either — clear any left/right
    setHole(par === 3
      ? { par, fairwayHit: null, fairwayMiss: undefined }
      : { par, fairwayHit: h.fairwayHit ?? undefined });
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
  const pick = (k: "teeClub" | "approachClub" | "approachYds", v: string) => {
    tapFx();
    setHole({ [k]: h[k] === v ? undefined : v });
  };
  const detailCount = [h.teeClub, h.approachClub, h.approachYds].filter(Boolean).length;
  const hist = holeHistory(rounds, round.course, i, round.id);

  const goTo = (n: number) => {
    const c = Math.max(0, Math.min(round.holes - 1, n));
    if (c !== i) onChange({ ...round, current: c });
  };
  const go = (d: number) => goTo(i + d);
  const finish = () => onFinish(round);
  const [showGrid, setShowGrid] = useState(false);

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
      <header className="hole-hdr">
        <h1 className="sr-only">Round in progress</h1>
        <div className="hole-hdr-top">
          <span className="kicker hole-course">{editing ? "Editing · " : ""}{round.course || "Round"}</span>
          <div className="hdr-actions">
            <GlareToggle />
            <button className="link-btn" onClick={quit}>{editing ? "Cancel" : "Discard"}</button>
          </div>
        </div>
        <div className="hole-hdr-main">
          <button className="hole-big" onClick={() => { tapFx(); setShowGrid((v) => !v); }}
                  aria-expanded={showGrid}>
            <span className="hole-big-lbl">Hole</span>
            <span className="hole-big-num num">{i + 1}</span>
            <span className="hole-big-of">
              of {round.holes}
              <Icon name="expand_more" size={18} className={"rot-chev" + (showGrid ? " open" : "")} />
            </span>
            <span className="sr-only">. Tap to jump to another hole</span>
          </button>
          <div className="hole-running">
            {st.scoredHoles > 0 ? (
              <>
                <b className="num">{toParLabel(st.toPar)}</b>
                <span>thru {st.scoredHoles}</span>
              </>
            ) : <span>Tap below to log this hole</span>}
            {(st.firOf > 0 || st.girOf > 0 || st.puttsOf > 0) && (
              <span>
                {[
                  st.firOf > 0 && `FIR ${st.firMade}/${st.firOf}`,
                  st.girOf > 0 && `GIR ${st.girMade}/${st.girOf}`,
                  st.puttsOf > 0 && `${st.putts} putt${st.putts === 1 ? "" : "s"}`,
                ].filter(Boolean).join(" · ")}
              </span>
            )}
          </div>
        </div>
        <div className="hole-ticks" aria-hidden
             style={{ gridTemplateColumns: `repeat(${round.holes}, minmax(0, 1fr))` }}>
          {Array.from({ length: round.holes }, (_, n) => (
            <i key={n} className={n < i ? "done" : n === i ? "cur" : ""} />
          ))}
        </div>
        {showGrid && (
          <div className="hole-jump-grid" role="group" aria-label="Jump to hole">
            {Array.from({ length: round.holes }, (_, n) => {
              const logged = round.holeData[n]?.score != null;
              return (
                <button
                  key={n}
                  className={"hole-jump-cell" + (n === i ? " cur" : logged ? " done" : "")}
                  aria-current={n === i ? "step" : undefined}
                  aria-label={`Hole ${n + 1}${n === i ? ", current" : logged ? ", logged" : ", not yet logged"}`}
                  onClick={() => { tapFx(); setShowGrid(false); goTo(n); }}
                >
                  {n + 1}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <div className="screen log">
        {/* key by hole so it starts collapsed each hole, but still updates live
            as par / fairway change on the current hole */}
        {hist && <HoleHistoryStrip hist={hist} />}

        <StrategyStrip
          key={i}
          par={h.par}
          missedFairway={h.fairwayHit === false && fwAnswered.has(i)}
          holeIndex={i}
        />

        <GreenDistance courseName={round.course} holeIndex={i} />

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
                {h.par === p && p === 4 && h.score == null && <span className="rbtn-std">std</span>}
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
            <div className="rgrp-lbl rgrp-lbl-row">
              <span>Fairway <span className="rgrp-sub">tee shot</span></span>
              <span className="fw-head-right">
                {(h.fairwayHit != null) && <span className="rgrp-done">Drive logged</span>}
                <FairwaySketch hit={h.fairwayHit ?? undefined} miss={h.fairwayMiss} />
              </span>
            </div>
            <div className="rrow">
              <Bin on={h.fairwayHit === true} label="Hit" hint="centre" tone="yes" icon="check" onClick={() => setFairway("hit")} />
              <Bin on={h.fairwayMiss === "left"} label="Left" hint="rough / trees" tone="no" icon="arrow_back" onClick={() => setFairway("left")} />
              <Bin on={h.fairwayMiss === "right"} label="Right" hint="rough / trees" tone="no" icon="arrow_forward" onClick={() => setFairway("right")} />
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

        {h.gir === false && (
          <div className="rgrp">
            <div className="rgrp-lbl">Up &amp; down</div>
            <div className="rrow">
              <Bin on={h.upAndDown === true} label="Got it" tone="yes" icon="check" onClick={() => setUpDown(true)} />
              <Bin on={h.upAndDown === false} label="No" tone="no" icon="close" onClick={() => setUpDown(false)} />
            </div>
          </div>
        )}

        <div className="rstat-grid">
          <div className="rstat">
            <div className="rgrp-lbl">Putts</div>
            <div className="putt-step">
              <button aria-label="One fewer putt" onClick={() => setPutts(-1)} disabled={h.putts != null && h.putts <= 0}>
                <Icon name="remove" size={22} />
              </button>
              <span className="num">{h.putts ?? "–"}</span>
              <button aria-label="One more putt" onClick={() => setPutts(1)}>
                <Icon name="add" size={22} />
              </button>
            </div>
          </div>
          <div className="rstat">
            <div className="rgrp-lbl">Penalties</div>
            <div className="putt-step">
              <button aria-label="One fewer penalty stroke" onClick={() => setPenalty(-1)} disabled={!(h.penalties ?? 0)}>
                <Icon name="remove" size={22} />
              </button>
              <span className="num">{h.penalties ?? 0}</span>
              <button aria-label="One more penalty stroke" onClick={() => setPenalty(1)}>
                <Icon name="add" size={22} />
              </button>
            </div>
          </div>
        </div>

        <details className="shot-detail">
          <summary>
            <Icon name="sports_golf" size={15} color="var(--icon-muted)" />
            Shot detail
            {detailCount > 0 && <span className="shot-detail-n">{detailCount}</span>}
            <Icon name="expand_more" size={18} className="flowstrip-chev" />
          </summary>
          <div className="shot-detail-body">
            {h.par !== 3 && (
              <div className="rgrp" style={{ gap: 7 }}>
                <div className="rgrp-lbl">Tee club{h.teeClub && <span className="setup-sel"> · {h.teeClub}</span>}</div>
                <div className="chips">
                  {TEE_CLUBS.map((c) => (
                    <button key={c} className={"chip-btn" + (h.teeClub === c ? " on" : "")}
                            aria-pressed={h.teeClub === c} onClick={() => pick("teeClub", c)}>{c}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="rgrp" style={{ gap: 7 }}>
              <div className="rgrp-lbl">Approach from{h.approachYds && <span className="setup-sel"> · {h.approachYds} yd</span>}</div>
              <div className="chips">
                {APPROACH_YDS.map((v) => (
                  <button key={v} className={"chip-btn" + (h.approachYds === v ? " on" : "")}
                          aria-pressed={h.approachYds === v} onClick={() => pick("approachYds", v)}>{v}</button>
                ))}
              </div>
            </div>
            <div className="rgrp" style={{ gap: 7 }}>
              <div className="rgrp-lbl">Approach club{h.approachClub && <span className="setup-sel"> · {h.approachClub}</span>}</div>
              <div className="chips">
                {APPROACH_CLUBS.map((c) => (
                  <button key={c} className={"chip-btn" + (h.approachClub === c ? " on" : "")}
                          aria-pressed={h.approachClub === c} onClick={() => pick("approachClub", c)}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        </details>

        {last && (
          <div className="rgrp">
            <div className="rgrp-lbl">Round note <span style={{ color: "var(--hint)", fontWeight: 600 }}>(optional)</span></div>
            <textarea
              className="notes"
              aria-label="Round note (optional)"
              rows={2}
              maxLength={500}
              value={round.note ?? ""}
              onChange={(e) => onChange({ ...round, note: e.target.value })}
              placeholder="Anything to remember from this round?"
            />
          </div>
        )}

        <div className="rnav">
          <button className="btn-ghost rnav-back" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous hole">
            <Icon name="arrow_back" size={20} />
          </button>
          {last ? (
            <button className="cta rnav-finish" onClick={finish}>
              <Icon name="done_all" size={20} />{editing ? "Save changes" : "Finish round"}
            </button>
          ) : (
            <button className="cta rnav-next" onClick={() => go(1)}>
              Save &amp; go to hole {i + 2}<Icon name="arrow_forward" size={20} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// scorecard grid — the traditional hole-by-hole card (par row, score row with
// birdie/bogey shapes, OUT/IN/TOTAL), front and back nine stacked. Same
// rel-to-par tiers as scoreTerm() above, just reduced to a shape+colour
// instead of a word: circle = under par, square = over, doubled border one
// tier further out either way.
const toParTone = (score: number | undefined, par: number): "eagle" | "birdie" | "bogey" | "double" | null => {
  if (score == null) return null;
  const rel = score - par;
  if (rel <= -2) return "eagle";
  if (rel === -1) return "birdie";
  if (rel === 0) return null; // par — plain, no shape
  if (rel === 1) return "bogey";
  return "double";
};

function ScoreCardBlock({ holes, startIndex, sumLabel }: { holes: RoundHole[]; startIndex: number; sumLabel: string }) {
  const parSum = holes.reduce((a, h) => a + h.par, 0);
  const allScored = holes.every((h) => h.score != null);
  const scoreSum = holes.reduce((a, h) => a + (h.score ?? 0), 0);
  return (
    <div className="scorecard-block">
      <div className="scorecard-row scorecard-head">
        <span className="scorecard-cell scorecard-lbl">Hole</span>
        {holes.map((_, i) => <span className="scorecard-cell" key={i}>{startIndex + i + 1}</span>)}
        <span className="scorecard-cell scorecard-sum">{sumLabel}</span>
      </div>
      <div className="scorecard-row">
        <span className="scorecard-cell scorecard-lbl dim">Par</span>
        {holes.map((h, i) => <span className="scorecard-cell dim" key={i}>{h.par}</span>)}
        <span className="scorecard-cell scorecard-sum dim">{parSum}</span>
      </div>
      <div className="scorecard-row">
        <span className="scorecard-cell scorecard-lbl">Score</span>
        {holes.map((h, i) => {
          const tone = toParTone(h.score, h.par);
          return (
            <span className="scorecard-cell" key={i}>
              {h.score != null
                ? <span className={"scorecard-score" + (tone ? " " + tone : "")}>{h.score}</span>
                : <span className="scorecard-dash">–</span>}
            </span>
          );
        })}
        <span className="scorecard-cell scorecard-sum">{allScored ? scoreSum : "–"}</span>
      </div>
    </div>
  );
}

function ScoreCard({ holeData, holes }: { holeData: RoundHole[]; holes: 9 | 18 }) {
  const front = holeData.slice(0, 9);
  const back = holeData.slice(9, 18);
  const allScored = holeData.length > 0 && holeData.every((h) => h.score != null);
  const total = holeData.reduce((a, h) => a + (h.score ?? 0), 0);
  const parTotal = holeData.reduce((a, h) => a + h.par, 0);
  return (
    <div className="scorecard">
      <div className="sec-head">
        <span className="icon-tile sm"><Icon name="grid_view" size={15} /></span>
        <h2>Scorecard</h2>
      </div>
      <div className="scorecard-scroll">
        <ScoreCardBlock holes={front} startIndex={0} sumLabel="OUT" />
        {holes === 18 && <ScoreCardBlock holes={back} startIndex={9} sumLabel="IN" />}
      </div>
      <div className="scorecard-total">
        <span>Total</span>
        <span className="num">{allScored ? total : "–"}</span>
        {allScored && <span className="scorecard-total-par">{toParLabel(total - parTotal)}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// summary (a just-finished round, or a saved one from the list)

export function RoundSummary({
  round, fresh, onDone, onEdit, rounds = [],
}: {
  round: SavedRound;
  fresh: boolean;
  onDone: () => void;
  onEdit?: () => void;
  rounds?: SavedRound[]; // all saved rounds, for the "new best" check below
}) {
  const toast = useToast();
  const s = roundStats(round.holeData);

  // best-round check — normalised to-par-per-18, same maths as the Scoring
  // trend, so "best" here means the same thing it means on that chart.
  // Needs at least one earlier round to beat, and only fires on a fresh finish
  // (not when just viewing/editing an old one).
  const norm = (st: RoundStats) => (st.toPar / st.scoredHoles) * 18;
  const priorNorms = rounds
    .filter((r) => r.id !== round.id)
    .map((r) => roundStats(r.holeData))
    .filter((st) => st.scoredHoles > 0)
    .map(norm);
  const isBest = fresh && s.scoredHoles > 0 && priorNorms.length > 0 && norm(s) < Math.min(...priorNorms);

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

  async function share() {
    const lines = [
      `RangeCard · ${roundLabel(round)} · ${fmtDate(round.date)}`,
      s.scoredHoles ? `Score ${s.strokes} (${toParLabel(s.toPar)})${breakdown ? ` — ${breakdown}` : ""}` : null,
      `Fairways ${s.firPct === null ? "n/a" : s.firPct + "%"} (${s.firMade}/${s.firOf})`,
      `GIR ${s.girPct === null ? "n/a" : s.girPct + "%"} (${s.girMade}/${s.girOf})`,
      `Putts ${s.putts} · ${s.puttsPerHole ?? "n/a"}/hole · ${s.threePutts} three-putt${s.threePutts === 1 ? "" : "s"}`,
      `Scrambling ${s.scramblePct === null ? "n/a" : s.scramblePct + "%"}`,
      s.penalties > 0 ? `Penalties ${s.penalties}` : null,
    ].filter(Boolean).join("\n");
    const outcome = await shareCard(
      {
        kicker: fmtDate(round.date),
        title: fresh ? "Round logged" : roundLabel(round),
        meta: `${round.course?.trim() ? `${round.course.trim()} · ` : ""}${round.holes} holes`,
        big: s.scoredHoles ? `${s.strokes}` : "—",
        bigCap: s.scoredHoles ? toParLabel(s.toPar) + " to par" : "not logged",
        bigSub: isBest ? "your best round yet" : breakdown || "",
        // the score is already the card's headline number, so it isn't repeated as a band
        rows: rows.filter((r) => r.label !== "Score").map((r) => ({
          label: r.label, value: r.value, sub: r.sub,
          // each round stat takes the colour of the practice area it points to
          area: ({ "Fairways hit": "driving", "Greens in regulation": "irons", "Total putts": "putting",
                   "Scrambling": "chipping", "Three-putts": "putting", "Penalty strokes": "pitching" } as const)[r.label as "Scrambling"],
        })),
        note: round.note?.trim() || undefined,
        filename: `rangecard-${roundLabel(round).toLowerCase().replace(/\s+/g, "-")}.png`,
      },
      lines,
    );
    if (outcome === "downloaded") toast.show("Card saved — find it in your downloads");
    else if (outcome === "copied") toast.show("Copied to clipboard");
    else if (outcome === "failed") toast.show("Couldn't share that — try again");
  }

  return (
    <div className="receipt-screen round-sum">
      <div className="receipt-top">
        <span className="kicker">
          {fresh ? "Round logged · " : ""}{fmtDate(round.date)} · {round.holes} holes
        </span>
        <button className="icon-btn" onClick={onDone} aria-label="Close">
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="receipt-hero">
        <span className="round-sum-course">{roundLabel(round)}</span>
        <h1 className="round-sum-score">
          <span className="num">{s.scoredHoles ? toParLabel(s.toPar) : "–"}</span>
          {s.scoredHoles > 0 && (
            <span className="round-sum-side">
              <b className="num">{s.strokes}</b>
              <span>
                strokes{s.scoredHoles < round.holeData.length ? ` over ${s.scoredHoles} holes` : ""}
              </span>
            </span>
          )}
        </h1>
        {(isBest || breakdown) && (
          <p className="receipt-lede">
            {isBest && <b>Your best round yet. </b>}{breakdown}
          </p>
        )}
      </div>

      <div className="round-sum-body">
        <div className="tiles">
          <div className="tile banded area-driving">
            <div className="tile-head">
              <span className="eyebrow">Fairways hit</span>
              <span className="icon-tile sm dim"><AreaIcon area="driving" size={15} /></span>
            </div>
            <div className="tile-val num">{s.firPct === null ? "—" : `${s.firPct}%`}</div>
            <div className="tile-foot">
              <span className="tile-lbl">{s.firOf ? `${s.firMade} of ${s.firOf}` : "no par 4s or 5s"}</span>
            </div>
          </div>

          <div className="tile banded area-irons">
            <div className="tile-head">
              <span className="eyebrow">Greens in reg.</span>
              <span className="icon-tile sm dim"><AreaIcon area="irons" size={15} /></span>
            </div>
            <div className="tile-val num">{s.girPct === null ? "—" : `${s.girPct}%`}</div>
            <div className="tile-foot">
              <span className="tile-lbl">{s.girOf ? `${s.girMade} of ${s.girOf}` : "not logged"}</span>
            </div>
          </div>

          <div className="tile banded area-putting">
            <div className="tile-head">
              <span className="eyebrow">Total putts</span>
              <span className="icon-tile sm dim"><AreaIcon area="putting" size={15} /></span>
            </div>
            <div className="tile-val num">{s.puttsOf ? s.putts : "—"}</div>
            <div className="tile-foot">
              <span className="tile-lbl">{s.puttsPerHole === null ? "not logged" : `${s.puttsPerHole} per hole`}</span>
              {s.threePutts > 0 && (
                <span className="delta down">{s.threePutts} 3-putt{s.threePutts === 1 ? "" : "s"}</span>
              )}
            </div>
          </div>

          <div className="tile banded area-chipping">
            <div className="tile-head">
              <span className="eyebrow">Scrambling</span>
              <span className="icon-tile sm dim"><AreaIcon area="chipping" size={15} /></span>
            </div>
            <div className="tile-val num">{s.scramblePct === null ? "—" : `${s.scramblePct}%`}</div>
            <div className="tile-foot">
              <span className="tile-lbl">{s.scrambleOf ? `${s.scrambleMade} of ${s.scrambleOf} missed` : "hit every green"}</span>
            </div>
          </div>

          {s.penalties > 0 && (
            <div className="tile" style={{ gridColumn: "1 / -1" }}>
              <div className="tile-head">
                <span className="eyebrow">Penalty strokes</span>
                <span className="icon-tile sm dim"><Icon name="report" size={15} /></span>
              </div>
              <div className="tile-val num">{s.penalties}</div>
              <div className="tile-foot">
                <span className="tile-lbl">on {s.penaltyHoles} hole{s.penaltyHoles === 1 ? "" : "s"}</span>
              </div>
            </div>
          )}
        </div>

        <ScoreCard holeData={round.holeData} holes={round.holes} />

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

// approach-distance breakdown, shown under the Approach leak card once a few
// holes have logged how far out the approach was
function ApproachStrip({ report }: { report: ApproachReport }) {
  const worst = report.spread >= 15;
  return (
    <div className="leak-appr">
      <div className="leak-appr-h">
        <span>By distance</span>
        <span>{report.attempts} approach{report.attempts === 1 ? "" : "es"} logged</span>
      </div>
      {report.bands.map((b) => (
        <div className="leak-appr-row" key={b.label}>
          <span className="leak-appr-band num">{b.label}</span>
          <span className="leak-appr-track">
            <span
              className={"leak-appr-fill" + (b.label === report.worstLabel && worst ? " weak" : "")}
              style={{ width: `${Math.max(3, b.girPct)}%` }}
            />
          </span>
          <span className="leak-appr-val num">{b.girPct}%</span>
          <span className="leak-appr-of num">{b.girMade}/{b.girOf}</span>
        </div>
      ))}
      {worst && (
        <p className="leak-appr-note">
          Greens-hit rate drops to {report.worstPct}% from {report.worstLabel} yd,
          against your best from {report.bestLabel}. Practise the range that&apos;s leaking.
        </p>
      )}
    </div>
  );
}

function LeakCard({
  cat, rank, onPractice, approach,
}: {
  cat: LeakCategory;
  rank: number;
  onPractice: (areas: AreaKey[], focus: PracticeFocus) => void;
  approach?: ApproachReport | null;
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

      {cat.key === "approach" && approach && <ApproachStrip report={approach} />}

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
  rounds, history, onBack, onPractice,
}: {
  rounds: SavedRound[];
  history: SavedSession[];
  onBack: () => void;
  onPractice: (areas: AreaKey[], focus: PracticeFocus) => void;
}) {
  const report = leakReport(rounds);
  const approach = approachBreakdown(rounds);
  const noLeak = !!report && !report.categories.some((c) => c.status === "below");

  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="hdr-title sm">Where you&apos;re losing shots</h1>
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
              <LeakCard key={c.key} cat={c} rank={i} onPractice={onPractice}
                        approach={c.key === "approach" ? approach : null} />
            ))}

            <RoundPatterns rounds={rounds} history={history} onPractice={onPractice} />
          </>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Patterns — where on the card the shots go (par type, blow-up holes, the
// back nine) and what the habit looks like (miss side, tee club). Each card
// only shows once lib/roundPatterns has enough holes to back it.

const fmtOver = (n: number) => (n === 0 ? "E" : n > 0 ? `+${n.toFixed(1)}` : `−${Math.abs(n).toFixed(1)}`);

const PAR_READ: Record<3 | 4 | 5, string> = {
  3: "That's the tee shot into the green, so it's an irons job.",
  4: "Drive-and-approach holes: the tee shot and the iron in.",
  5: "Usually the lay-up and the wedge in, more than the drive.",
};

// card header: what the pattern is built from, flagged as an early read when
// that's still thin, so 4 tee shots don't look as solid as 40
function PatHead({ title, basis, early }: { title: string; basis: string; early: boolean }) {
  return (
    <div className="pat-th">
      <h3 className="pat-t">{title}</h3>
      <span className="pat-sub">
        {early && <span className="pat-early">Early read</span>}
        {basis}
      </span>
    </div>
  );
}

// which practice areas a par type points at, matching PAR_READ above
const PAR_AREAS: Record<3 | 4 | 5, AreaKey[]> = { 3: ["irons"], 4: ["driving", "irons"], 5: ["irons", "pitching"] };

// the same start-a-session button the leak cards use
function PracticeBtn({ label, areas, title, body, setup, onPractice }: {
  label: string; areas: AreaKey[]; title: string; body: string; setup?: PracticeFocus["setup"];
  onPractice: (areas: AreaKey[], focus: PracticeFocus) => void;
}) {
  return (
    <button className="leak-practice" onClick={() => onPractice(areas, { title, body, setup })}>
      <Icon name="play_arrow" size={16} fill />
      {label}
    </button>
  );
}

function RoundPatterns({ rounds, history, onPractice }: {
  rounds: SavedRound[];
  history: SavedSession[];
  onPractice: (areas: AreaKey[], focus: PracticeFocus) => void;
}) {
  const par = scoringByPar(rounds);
  const blow = blowUps(rounds);
  const miss = teeMissSide(rounds, history);
  const clubs = fairwaysByTeeClub(rounds);
  const nines = frontBack(rounds);
  const any = par || blow || miss || clubs || nines;

  return (
    <section className="pat-sec" aria-labelledby="pat-h">
      <div className="sec-head">
        <span className="icon-tile sm"><Icon name="insights" size={15} /></span>
        <h2 id="pat-h">Patterns</h2>
      </div>

      {!any && (
        <div className="fault-note">
          <span className="icon-tile sm dim"><Icon name="info" size={15} /></span>
          <span>
            Patterns show up as you log more holes: scoring by par, big numbers, which way tee
            shots miss, and front nine against back.
          </span>
        </div>
      )}

      {par && (() => {
        const worst = par.rows.find((r) => r.par === par.worst);
        const max = Math.max(1, ...par.rows.map((r) => r.avgOver));
        return (
          <div className="pat">
            <PatHead title="Scoring by par" basis={`${par.rows.reduce((n, r) => n + r.holes, 0)} holes`}
                     early={par.rows.some((r) => r.holes < 6)} />
            {par.rows.map((r) => (
              <div className="pat-row" key={r.par}>
                <span className="pat-lbl">Par {r.par}</span>
                <span className="pat-track">
                  <span className={"pat-fill" + (r.par === par.worst && r.avgOver > 0 ? " weak" : "")}
                        style={{ width: `${Math.max(3, (Math.max(0, r.avgOver) / max) * 100)}%` }} />
                </span>
                <span className="pat-val num">{fmtOver(r.avgOver)}</span>
                <span className="pat-of num">{r.holes} holes</span>
              </div>
            ))}
            <p className="pat-read">
              {worst && par.worst
                ? <>Par {par.worst}s cost you most, {worst.avgOver.toFixed(1)} over a hole on average. {PAR_READ[par.worst]}</>
                : "No par type stands out: you drop shots about evenly across par 3s, 4s and 5s."}
            </p>
            {worst && par.worst && (
              <PracticeBtn
                label={`Practise ${PAR_AREAS[par.worst].join(" and ")}`}
                areas={PAR_AREAS[par.worst]}
                title={`From your rounds: par ${par.worst}s`}
                body={`Par ${par.worst}s cost you ${worst.avgOver.toFixed(1)} over a hole. ${PAR_READ[par.worst]}`}
                onPractice={onPractice}
              />
            )}
          </div>
        );
      })()}

      {blow && (
        <div className="pat">
          <PatHead title="Big numbers" basis={`per 18 · from ${blow.holes} holes`} early={blow.holes < 27} />
          <div className="pat-stats">
            <div><b className="num">{blow.doublesPerRound}</b><span>doubles or worse a round</span></div>
            <div><b className="num">{blow.costPerRound}</b><span>shots beyond bogey</span></div>
            <div><b className="num">{blow.penaltiesPerRound}</b><span>penalty strokes</span></div>
          </div>
          <p className="pat-read">
            {blow.costPerRound >= 1.5
              ? `Turning those into bogeys would save about ${Math.round(blow.costPerRound)} shot${Math.round(blow.costPerRound) === 1 ? "" : "s"} a round, often just by taking the safe line out of trouble.`
              : "You keep big numbers rare: bogey is your worst case on most holes."}
          </p>
          {blow.penaltiesPerRound >= 1 && (
            <PracticeBtn
              label="Practise driving"
              areas={["driving"]}
              title="From your rounds: keep it in play"
              body={`About ${Math.round(blow.penaltiesPerRound)} penalty stroke${Math.round(blow.penaltiesPerRound) === 1 ? "" : "s"} a round. Pick a target with room on both sides and favour the swing that finds it, not the longest one.`}
              onPractice={onPractice}
            />
          )}
        </div>
      )}

      {miss && (() => {
        const leftPct = 100 - miss.rightPct;
        const side = miss.rightPct >= 60 ? "right" : miss.rightPct <= 40 ? "left" : null;
        return (
          <div className="pat">
            <PatHead title="Tee-shot misses" basis={`${miss.left + miss.right} missed fairways`}
                     early={miss.left + miss.right < 8} />
            <div className="pat-split" role="img" aria-label={`${leftPct}% of missed fairways went left, ${miss.rightPct}% right`}>
              <span className="pat-split-l" style={{ flexBasis: `${leftPct}%` }} />
              <span className="pat-split-r" style={{ flexBasis: `${miss.rightPct}%` }} />
            </div>
            <div className="pat-split-lbls num" aria-hidden="true">
              <span>Left {miss.left}</span><span>Right {miss.right}</span>
            </div>
            <p className="pat-read">
              {side ? `Most missed fairways go ${side} (${side === "right" ? miss.rightPct : leftPct}%).` : "Missed fairways split both ways."}{" "}
              {miss.rangeRightPct === null
                ? "Log a few range sessions with driving to compare this with your practice misses."
                : miss.same
                  ? `The range shows the same pattern (${miss.rangeRightPct}% of misses right), so working on that miss in practice is the right focus.`
                  : `At the range ${miss.rangeRightPct}% of misses go right, so the course miss looks more like aim or pressure than the swing itself.`}
            </p>
            {side && (
              <PracticeBtn
                label="Practise driving"
                areas={["driving"]}
                title={`From your rounds: the miss ${side}`}
                body={`${side === "right" ? miss.rightPct : leftPct}% of your missed fairways go ${side}. Pick a target on every ball, and check your alignment before the swing.`}
                onPractice={onPractice}
              />
            )}
          </div>
        );
      })()}

      {clubs && (() => {
        const best = clubs[0], worst = clubs[clubs.length - 1];
        return (
          <div className="pat">
            <PatHead title="Fairways by tee club" basis={`${clubs.reduce((n, c) => n + c.of, 0)} tee shots`}
                     early={clubs.some((c) => c.of < 6)} />
            {clubs.map((c) => (
              <div className="pat-row" key={c.club}>
                <span className="pat-lbl">{c.club}</span>
                <span className="pat-track">
                  <span className={"pat-fill good" + (c === worst && best.pct - worst.pct >= 15 ? " weak" : "")} style={{ width: `${Math.max(3, c.pct)}%` }} />
                </span>
                <span className="pat-val num">{c.pct}%</span>
                <span className="pat-of num">{c.made}/{c.of}</span>
              </div>
            ))}
            {best.pct - worst.pct >= 15 && (
              <p className="pat-read">
                {best.club} finds {best.pct}% of fairways against {worst.pct}% with {worst.club}. On
                tight holes, {best.club} is the higher-percentage play.
              </p>
            )}
            {best.pct - worst.pct >= 15 && (
              <PracticeBtn
                label={`Practise with ${best.club}`}
                areas={["driving"]}
                title={`From your rounds: tee off with ${best.club}`}
                body={`${best.club} finds ${best.pct}% of fairways, ${worst.club} ${worst.pct}%. Groove ${best.club} as your go-to on tight holes.`}
                setup={{ driving: { club: best.club } }}
                onPractice={onPractice}
              />
            )}
          </div>
        );
      })()}

      {nines && (
        <div className="pat">
          <PatHead title="Front nine vs back nine" basis={`${nines.rounds} rounds of 18`} early={nines.rounds < 3} />
          <div className="pat-stats two">
            <div><b className="num">{fmtOver(nines.front)}</b><span>front nine</span></div>
            <div><b className="num">{fmtOver(nines.back)}</b><span>back nine</span></div>
          </div>
          <p className="pat-read">
            {nines.diff >= 1.5
              ? `The back nine costs about ${nines.diff.toFixed(1)} more shots. That's often energy and focus: eat something and reset at the turn.`
              : nines.diff <= -1.5
                ? `You start slow: the front nine costs about ${Math.abs(nines.diff).toFixed(1)} more. A proper warm-up before the first tee would help.`
                : "Steady across both nines."}
          </p>
        </div>
      )}
    </section>
  );
}
