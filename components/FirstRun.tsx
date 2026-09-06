"use client";

import { useState } from "react";
import {
  OnbStage, Shot, READ_TARGET, READ_MIN, readFrom, planFraming,
} from "@/lib/onboarding";
import { useConfirm } from "./Confirm";
import { tapFx, bumpFx } from "@/lib/haptics";
import { Icon } from "./Icon";

const MISSES: { key: string; title: string; sub: string; icon: string }[] = [
  { key: "right", title: "Right, a slice", sub: "Starts right or curves away late", icon: "east" },
  { key: "left", title: "Left, a hook", sub: "Pulls left, sometimes hard", icon: "west" },
  { key: "strike", title: "Fat or thin", sub: "Strike is the problem, not the line", icon: "height" },
  { key: "varies", title: "It varies", sub: "Start with the balanced plan", icon: "shuffle" },
];

const SHOT_LABEL: Record<Shot, string> = { fairway: "on line", left: "miss left", right: "miss right" };
const SHOT_GLYPH: Record<Shot, string> = { fairway: "✓", left: "L", right: "R" };

// "this morning" / "this afternoon" / "tonight"
function timeWord(): string {
  const h = new Date().getHours();
  return h < 12 ? "this morning" : h < 17 ? "this afternoon" : "tonight";
}
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

// ---------------------------------------------------------------------------

export function FirstRun({
  stage, onSetStage, readShots, onReadShots, onComplete,
}: {
  stage: OnbStage;
  onSetStage: (s: OnbStage) => void;
  readShots: Shot[];
  onReadShots: (s: Shot[]) => void;
  onComplete: (miss: string) => void;
}) {
  const [picker, setPicker] = useState<null | { prefill?: string }>(null);

  if (picker) {
    return (
      <MissList
        prefill={picker.prefill}
        onPick={(m) => onComplete(m)}
        onBack={() => setPicker(null)}
      />
    );
  }

  if (stage === "practice") {
    return (
      <PracticeRun
        onDone={() => onSetStage("read")}
        onSkip={() => onSetStage("read")}
      />
    );
  }

  if (stage === "read") {
    return (
      <TheRead
        shots={readShots}
        setShots={onReadShots}
        onDone={() => onSetStage("reveal")}
      />
    );
  }

  if (stage === "reveal") {
    return (
      <TheReveal
        shots={readShots}
        onUsePlan={(m) => onComplete(m)}
        onAdjust={(m) => setPicker({ prefill: m })}
      />
    );
  }

  return <Deal onStart={() => onSetStage("practice")} onKnowMiss={() => setPicker({})} />;
}

// ---------------------------------------------------------------------------
// 3a — The deal

function Deal({ onStart, onKnowMiss }: { onStart: () => void; onKnowMiss: () => void }) {
  const when = timeWord();
  const steps = [
    [`${cap(when)} · 10 balls`, "Five minutes. You find out your miss."],
    ["Four weeks · 8 sessions", "35 minutes each, built around that miss."],
    ["Then we re-test", "Same ten balls. You see the number move, or we change the plan."],
  ];
  return (
    <div className="fr-wrap">
      <div className="fr deal">
        <span className="fr-mark"><Icon name="sports_golf" size={27} fill /></span>
        <h1 className="deal-h">Ten balls {when}, and I&apos;ll tell you what you&apos;re doing.</h1>
        <p className="fr-body">
          No quiz about a swing you can&apos;t see. Hit ten, and RangeCard reads the pattern.
        </p>

        <ol className="step-card">
          {steps.map(([t, b], i) => (
            <li key={t}>
              <span className={"step-badge" + (i === 0 ? " now" : "")}>{i + 1}</span>
              <span><b>{t}</b><small>{b}</small></span>
            </li>
          ))}
        </ol>

        <div className="payoff">
          <span className="payoff-ic"><Icon name="trending_up" size={22} /></span>
          <span>A plan built around your one miss, and a solid-strike number you watch move.</span>
        </div>

        <button className="fr-cta" onClick={onStart}>
          <span><b>Hit ten balls</b><small>About five minutes</small></span>
          <span className="fr-cta-tile"><Icon name="play_arrow" size={24} fill /></span>
        </button>
        <button className="fr-secondary" onClick={onKnowMiss}>I already know my miss</button>

        <p className="fr-foot">
          <Icon name="lock" size={14} />No account. Nothing leaves this phone.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// shared bits

function ShotStrip({
  shots, target, showPct, cursor,
}: {
  shots: Shot[]; target: number; showPct: boolean; cursor: boolean;
}) {
  const on = shots.filter((s) => s === "fairway").length;
  const pct = shots.length ? Math.round((on / shots.length) * 100) : 0;
  const left = target - shots.length;
  return (
    <div className="strip-card">
      <div className="strip-head">
        <span>This session</span>
        <span className="num">
          {showPct
            ? `${pct}% on line`
            : `${shots.length} logged, ${Math.max(0, left)} to go`}
        </span>
      </div>
      <div className="strip" role="list" aria-label="Shots logged this session">
        {Array.from({ length: Math.max(target, shots.length) }).map((_, i) => {
          const s = shots[i];
          const isCursor = cursor && i === shots.length && i < target;
          return (
            <span
              key={i}
              role="listitem"
              aria-label={s ? `Ball ${i + 1}, ${SHOT_LABEL[s]}` : `Ball ${i + 1}, not logged yet`}
              className={"slot" + (s ? " " + s : "") + (isCursor ? " cursor" : "")}
            >
              {s ? SHOT_GLYPH[s] : ""}
            </span>
          );
        })}
      </div>
      <div className="strip-key">
        <span><b>✓</b> on line</span>
        <span><b>L</b> left</span>
        <span><b>R</b> right</span>
      </div>
    </div>
  );
}

function LogButtons({
  counts, onLog, spotlight,
}: {
  counts: { fairway: number; left: number; right: number };
  onLog: (s: Shot) => void;
  spotlight?: Shot | "lr" | null;
}) {
  const dim = (k: Shot | "lr") =>
    spotlight != null && spotlight !== k && !(spotlight === "lr" && (k === "left" || k === "right"))
      ? " inert"
      : "";
  const spot = (k: Shot | "lr") =>
    spotlight === k || (spotlight === "lr" && (k === "left" || k === "right")) ? " spot" : "";
  return (
    <>
      <button
        className={"logbtn" + dim("fairway") + spot("fairway")}
        onClick={() => onLog("fairway")}
        aria-label={`On my line. Logged ${counts.fairway}.`}
      >
        <span className="logbtn-main">
          <Icon name="check_circle" size={26} fill color="var(--green)" />
          <span className="logbtn-txt">
            <b>On my line</b>
            <small>{spotlight === "fairway" ? "Tap me" : "Volume up logs this"}</small>
          </span>
        </span>
        <span className="logbtn-n num">{counts.fairway}</span>
      </button>
      <div className="logbtn-lr">
        <button
          className={"logbtn side left" + dim("lr") + spot("lr")}
          onClick={() => onLog("left")}
          aria-label={`Missed left. Logged ${counts.left}.`}
        >
          <span className="logbtn-n num">{counts.left}</span>
          <span className="logbtn-txt"><b><Icon name="west" size={19} />Left</b></span>
        </button>
        <button
          className={"logbtn side right" + dim("lr") + spot("lr")}
          onClick={() => onLog("right")}
          aria-label={`Missed right. Logged ${counts.right}.`}
        >
          <span className="logbtn-n num">{counts.right}</span>
          <span className="logbtn-txt"><b><Icon name="east" size={19} />Right</b></span>
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// 3b — Practice run (coach marks)

const COACH = [
  { head: "Say that one started at the flag.", body: "Tap the big green button below. That's the whole app, really." },
  { head: "Now say this one missed.", body: "It leaked right. Tap Right. The miss buttons work the same way." },
  { head: "Mis-tapped? Undo it.", body: "One press takes back the last ball. No hold, no dialog." },
];

function PracticeRun({ onDone, onSkip }: { onDone: () => void; onSkip: () => void }) {
  const [step, setStep] = useState(0); // 0,1,2
  const [counts, setCounts] = useState({ fairway: 0, left: 0, right: 0 });
  const [logged, setLogged] = useState<Shot[]>([]);

  const advance = () => {
    if (step < 2) setStep(step + 1);
    else onDone();
  };

  const log = (s: Shot) => {
    if (step === 0 && s !== "fairway") { bumpFx(); return; }
    if (step === 1 && s === "fairway") { bumpFx(); return; }
    if (step === 2) return;
    tapFx();
    setCounts((c) => ({ ...c, [s]: c[s] + 1 }));
    setLogged((l) => [...l, s]);
    advance();
  };
  const undo = () => {
    if (step !== 2 || !logged.length) { if (step !== 2) bumpFx(); return; }
    tapFx();
    const last = logged[logged.length - 1];
    setCounts((c) => ({ ...c, [last]: Math.max(0, c[last] - 1) }));
    setLogged((l) => l.slice(0, -1));
    onDone();
  };

  const spotlight: Shot | "lr" | null = step === 0 ? "fairway" : step === 1 ? "lr" : null;

  return (
    <div className="fr-wrap practice">
      <div className="coach-card">
        <div className="coach-top">
          <span className="coach-step">Step {step + 1} of 3</span>
          <span className="coach-pips">
            {[0, 1, 2].map((i) => <span key={i} className={i <= step ? "on" : ""} />)}
          </span>
        </div>
        <div className="coach-head">{COACH[step].head}</div>
        <div className="coach-body">{COACH[step].body}</div>
      </div>

      <div className="fr-logscreen">
        <div className={"strip-card demo" + (step >= 1 ? "" : " inert")}>
          <div className="strip" role="presentation">
            {Array.from({ length: 10 }).map((_, i) => {
              const s = logged[i];
              return <span key={i} className={"slot" + (s ? " " + s : "")}>{s ? SHOT_GLYPH[s] : ""}</span>;
            })}
          </div>
        </div>
        <LogButtons counts={counts} onLog={log} spotlight={spotlight} />
        <button
          className={"undo-btn" + (step === 2 ? " spot" : " inert")}
          onClick={undo}
        >
          <Icon name="undo" size={18} />Undo last ball
        </button>
      </div>

      <button className="fr-skip" onClick={onSkip}>Skip the practice run</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3c — The read (session zero)

function TheRead({
  shots, setShots, onDone,
}: {
  shots: Shot[]; setShots: (s: Shot[]) => void; onDone: () => void;
}) {
  const { confirm } = useConfirm();
  const [say, setSay] = useState("");

  const counts = {
    fairway: shots.filter((s) => s === "fairway").length,
    left: shots.filter((s) => s === "left").length,
    right: shots.filter((s) => s === "right").length,
  };

  const log = (s: Shot) => {
    if (shots.length >= READ_TARGET) return;
    tapFx();
    const next = [...shots, s];
    setShots(next);
    setSay(`Ball ${next.length}, ${SHOT_LABEL[s]}. ${READ_TARGET - next.length} to go.`);
    if (next.length >= READ_TARGET) setTimeout(onDone, 250);
  };
  const undo = () => {
    if (!shots.length) return;
    tapFx();
    const next = shots.slice(0, -1);
    setShots(next);
    setSay(`Undo. Ball ${shots.length} removed.`);
  };

  async function stopHere() {
    if (shots.length >= READ_MIN) {
      onDone();
      return;
    }
    const ok = await confirm({
      title: `Only ${shots.length} ball${shots.length === 1 ? "" : "s"} so far`,
      body: `Six is enough for a first read. Finish these next time and we'll keep them, or read what you've got now.`,
      confirmLabel: "Read what I've got",
      cancelLabel: "Finish next time",
    });
    if (ok) onDone();
  }

  return (
    <div className="fr-wrap read">
      <header className="fr-head">
        <div>
          <div className="fr-head-title">The read · your first ten</div>
          <div className="fr-head-sub">Ball {Math.min(READ_TARGET, shots.length + 1)} of {READ_TARGET} · any club you like</div>
        </div>
      </header>

      <div className="fr-body-scroll">
        <div className="reassure">
          <Icon name="visibility" size={19} color="var(--blue-icon)" />
          <span>No score {timeWord()}. Bad ones are the useful ones. They&apos;re what builds your plan.</span>
        </div>

        <ShotStrip shots={shots} target={READ_TARGET} showPct={false} cursor />

        <div className="fr-actions">
          <LogButtons counts={counts} onLog={log} />
          <div className="read-foot">
            <button className="undo-btn" onClick={undo} disabled={!shots.length}>
              <Icon name="undo" size={18} />Undo last ball
            </button>
            <button className="undo-btn stop" onClick={stopHere}>
              Stop here<Icon name="arrow_forward" size={18} />
            </button>
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">{say}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3d — Your read (the reveal)

function TheReveal({
  shots, onUsePlan, onAdjust,
}: {
  shots: Shot[]; onUsePlan: (miss: string) => void; onAdjust: (miss: string) => void;
}) {
  const read = readFrom(shots);
  const plan = planFraming(read.miss);
  const bars: [string, number, string][] = [
    ["Right", read.counts.right, "right"],
    ["Left", read.counts.left, "left"],
    ["On line", read.counts.fairway, "fairway"],
  ];
  const max = Math.max(1, read.counts.total);

  return (
    <div className="fr-wrap reveal">
      <div className="fr">
        <div className="reveal-eyebrow">
          Your read · {read.counts.total} ball{read.counts.total === 1 ? "" : "s"}
          {read.early && " (early)"}
        </div>
        <h1 className="reveal-verdict">{read.verdict}</h1>

        <div className={"pattern-card" + (read.miss === "varies" ? " neutral" : "")}>
          {bars.map(([label, n, tone]) => (
            <div className="patrow" key={label}>
              <span className="patlabel">{label}</span>
              <span className="pattrack">
                <span className={"patfill " + tone} style={{ width: `${(n / max) * 100}%` }} />
              </span>
              <span className="patcount num">{n}/{read.counts.total}</span>
            </div>
          ))}
          <p className="pattern-why">{read.explanation}</p>
          {read.provenance && <div className="pattern-prov">{read.provenance}</div>}
        </div>

        <div className="plan-card">
          <div className="plan-eyebrow"><Icon name="flag" size={17} />So here&apos;s your four weeks</div>
          <div className="plan-thesis">{plan.thesis}</div>
          <div className="plan-rows">
            {plan.rows.map(([t, b]) => (
              <div key={t}><b>{t}</b><span>{b}</span></div>
            ))}
          </div>
        </div>

        <button className="fr-cta solid" onClick={() => onUsePlan(read.miss)}>
          Use this plan
        </button>
        <button className="fr-secondary" onClick={() => onAdjust(read.miss)}>
          Not my usual miss
        </button>
        <p className="fr-foot centre">
          Practise when you can. The plan waits for you, it doesn&apos;t expire.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// the miss picker (from 3a secondary + 3d adjust)

function MissList({
  prefill, onPick, onBack,
}: {
  prefill?: string; onPick: (m: string) => void; onBack: () => void;
}) {
  return (
    <div className="fr-wrap">
      <div className="fr">
        <header className="fr-head bare">
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div>
            <div className="fr-head-title">Where does your bad one go?</div>
            <div className="fr-head-sub">
              {prefill ? "We read it as below. Change it if that's not you." : "One tap and your four weeks are built around it."}
            </div>
          </div>
        </header>

        <div className="miss-list">
          {MISSES.map((m) => (
            <button
              key={m.key}
              className={"miss-row" + (m.key === prefill ? " on" : "")}
              onClick={() => onPick(m.key)}
            >
              <span>
                <b>{m.title}{m.key === prefill && <span className="focus-tag">our read</span>}</b>
                <small>{m.sub}</small>
              </span>
              <Icon name={m.icon} size={24} color="var(--icon-muted)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
