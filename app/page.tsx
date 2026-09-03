"use client";

import { useEffect, useState } from "react";
import { PLAN, Week, Session } from "@/lib/plan";
import { SESSION_FLOW } from "@/lib/prep";
import { PITCH_FOCUS, PITCHING_DRILL } from "@/lib/library";
import { Outcome } from "@/components/Outcome";
import { Icon } from "@/components/Icon";
import { Trends } from "@/components/Trends";
import { Fixes } from "@/components/Fixes";
import { Prep } from "@/components/Prep";
import { Library } from "@/components/Library";
import { Warmup } from "@/components/Warmup";
import { Welcome } from "@/components/Welcome";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/components/Toast";
import {
  SavedSession, SessionInput, Strips, emptyStrips, countIn,
  DrillOverride, DrillOverrides,
  saveSession, allSessions, deleteSession, restoreSession, uuid,
  getMeta, setMeta, delMeta,
} from "@/lib/db";
import { solidPct } from "@/lib/stats";
import { todaysOneThing, weekStreak } from "@/lib/verdict";
import { SessionReceipt } from "@/components/SessionReceipt";
import { doneFx } from "@/lib/haptics";

type Tab = "home" | "session" | "trends" | "more" | "warmup" | "welcome" | "receipt";

const today = () => new Date().toISOString().slice(0, 10);

function greeting(name: string, history: SavedSession[]): string {
  const who = name ? `, ${name}` : "";
  if (history.length === 0) return `Welcome${who} — let's get your baseline down`;

  const dayMs = 86400000;
  const since = (d: string) => Math.floor((Date.now() - new Date(d + "T00:00:00").getTime()) / dayMs);
  const gap = since(history[history.length - 1].date);
  if (gap >= 7) return `First session in ${gap} days${who} — ease back in`;

  const thisWeek = history.filter((s) => since(s.date) < 7).length;
  if (thisWeek >= 2) return `${thisWeek} sessions this week${who} — keep it going`;

  const h = new Date().getHours();
  const tod = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return name ? `${tod}, ${name}` : tod;
}

// the session in progress (new session or an edit). Per-ball taps live in `strips`;
// every tally is derived from them so the two never drift.
type Live = {
  weekId: string; sessionLabel: string; date: string; notes: string;
  bestClub: string; startedAt: number;
  strips: Strips;
};

const STRIP_TOTAL = (s: Strips) =>
  s.driving.length + s.irons.length + s.chipping.length +
  s.pitching.length + s.putting.length;

function emptyLive(weekId: string, sessionLabel: string): Live {
  return {
    weekId, sessionLabel, date: new Date().toISOString().slice(0, 10), notes: "",
    bestClub: "", startedAt: Date.now(), strips: emptyStrips(),
  };
}

// rebuild strips from tallies when editing a pre-v3 session (tap order is lost)
function stripsFrom(s: SavedSession): Strips {
  if (s.strips) return {
    driving: [...s.strips.driving], irons: [...s.strips.irons], chipping: [...s.strips.chipping],
    pitching: [...s.strips.pitching], putting: [...s.strips.putting],
  };
  const rep = (k: string, n: number) => Array(Math.max(0, n)).fill(k);
  const p = s.pitching ?? { close: 0, short: 0, long: 0 };
  return {
    driving: [...rep("fairway", s.driving.fairway), ...rep("left", s.driving.left), ...rep("right", s.driving.right)],
    irons: [...rep("solid", s.irons.solid), ...rep("fat", s.irons.fat), ...rep("thin", s.irons.thin)],
    chipping: [...rep("on", s.chipping.on), ...rep("off", s.chipping.off)],
    pitching: [...rep("close", p.close), ...rep("short", p.short), ...rep("long", p.long)],
    putting: [...rep("in", s.putting.in), ...rep("out", s.putting.out)],
  };
}

function toLive(s: SavedSession): Live {
  return {
    weekId: s.weekId, sessionLabel: s.sessionLabel, date: s.date, notes: s.notes,
    bestClub: s.chipping.bestClub, startedAt: s.startedAt ?? Date.now(),
    strips: stripsFrom(s),
  };
}

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

function fromLive(l: Live) {
  const c = l.strips;
  return {
    weekId: l.weekId, sessionLabel: l.sessionLabel,
    date: isDate(l.date) ? l.date : today(),
    notes: l.notes.slice(0, 2000),
    driving: { fairway: countIn(c.driving, "fairway"), left: countIn(c.driving, "left"), right: countIn(c.driving, "right") },
    irons: { solid: countIn(c.irons, "solid"), fat: countIn(c.irons, "fat"), thin: countIn(c.irons, "thin") },
    chipping: { bestClub: l.bestClub, on: countIn(c.chipping, "on"), off: countIn(c.chipping, "off") },
    pitching: { close: countIn(c.pitching, "close"), short: countIn(c.pitching, "short"), long: countIn(c.pitching, "long") },
    putting: { in: countIn(c.putting, "in"), out: countIn(c.putting, "out") },
    strips: c,
    startedAt: l.startedAt,
  };
}

function anyLogged(l: Live) {
  return STRIP_TOTAL(l.strips) > 0 || !!l.bestClub || !!l.notes.trim();
}

// find the plan position of a saved session by weekId + label
function locate(weekId: string, label: string): { week: number; session: number } | null {
  for (let w = 0; w < PLAN.length; w++) {
    if (PLAN[w].id !== weekId) continue;
    const si = PLAN[w].sessions.findIndex((s) => s.label === label);
    if (si >= 0) return { week: w, session: si };
  }
  return null;
}

const AREAS = [
  ["Chipping", "swipe_up"], ["Pitching", "arrow_outward"], ["Irons", "golf_course"],
  ["Driving", "sports_golf"], ["Putting", "adjust"],
] as const;

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [cursor, setCursor] = useState<{ week: number; session: number }>({ week: 0, session: 0 });
  const [live, setLive] = useState<Live | null>(null);
  const [editOrig, setEditOrig] = useState<SavedSession | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [onboardedAt, setOnboardedAt] = useState<string | null>(null);
  const [plannedMiss, setPlannedMiss] = useState<string>("");
  const [overrides, setOverrides] = useState<DrillOverrides>({});
  const [receipt, setReceipt] = useState<
    { session: SavedSession; history: SavedSession[]; nextCursor: { week: number; session: number } } | null
  >(null);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      setHistory(await allSessions());
      setName((await getMeta<string>("name")) ?? "");
      setPlannedMiss((await getMeta<string>("plannedMiss")) ?? "");
      setOverrides((await getMeta<DrillOverrides>("drillOverrides")) ?? {});
      const ob = (await getMeta<string>("onboardedAt")) ?? null;
      setOnboardedAt(ob);
      const draft = await getMeta<Live>("draft");
      if (draft) {
        setLive(draft);
        const loc = locate(draft.weekId, draft.sessionLabel);
        if (loc) setCursor(loc);
      } else {
        const c = await getMeta<{ week: number; session: number }>("cursor");
        if (c) setCursor(c);
      }
      if (!ob) setTab("welcome");
      setReady(true);
    })();
  }, []);

  const cleanName = (n: string) => n.replace(/\s+/g, " ").trim().slice(0, 24);

  async function finishOnboarding(n: string, miss: string) {
    const nm = cleanName(n);
    const now = new Date().toISOString();
    setName(nm);
    setPlannedMiss(miss);
    setOnboardedAt(now);
    await setMeta("name", nm);
    await setMeta("plannedMiss", miss);
    await setMeta("onboardedAt", now);
    setTab("home");
  }

  async function swapDrill(area: keyof DrillOverrides, drill: DrillOverride | null) {
    const next: DrillOverrides = { ...overrides };
    if (drill) next[area] = drill;
    else delete next[area];
    setOverrides(next);
    await setMeta("drillOverrides", next);
  }

  async function saveName(n: string) {
    const nm = cleanName(n);
    setName(nm);
    await setMeta("name", nm);
    setTab("home");
  }

  // persist the working session as a draft (but never while editing a saved one)
  useEffect(() => {
    if (live && !editOrig) setMeta("draft", live);
  }, [live, editOrig]);

  const week = PLAN[cursor.week];
  const session = week.sessions[cursor.session];
  const flatIdx = PLAN.slice(0, cursor.week).reduce((n, w) => n + w.sessions.length, 0) + cursor.session;
  const pitchFocus = PITCH_FOCUS[flatIdx] ?? PITCH_FOCUS[PITCH_FOCUS.length - 1];
  const isDraft = !!live && !editOrig;
  const draftHere = isDraft && live!.weekId === week.id && live!.sessionLabel === session.label;

  function startSession() {
    if (isDraft) {
      if (draftHere) { setTab("session"); return; }
      const other = live!.sessionLabel;
      if (!confirm(`Discard your unfinished "${other}" and start ${session.label}?`)) {
        resumeDraft();
        return;
      }
    }
    // fresh start — offer the warm-up once per calendar day
    getMeta<string>("warmupShown").then((shown) => {
      if (shown === today()) openLog();
      else setTab("warmup");
    });
  }

  function openLog() {
    setLive(emptyLive(week.id, session.label));
    setTab("session");
  }

  async function dismissWarmup() {
    await setMeta("warmupShown", today());
    openLog();
  }

  function resumeDraft() {
    if (!live) return;
    const loc = locate(live.weekId, live.sessionLabel);
    if (loc) setCursor(loc);
    setTab("session");
  }

  function editSession(s: SavedSession) {
    if (isDraft) {
      alert("Finish or discard your current session before editing a past one.");
      return;
    }
    setEditOrig(s);
    setLive(toLive(s));
    const loc = locate(s.weekId, s.sessionLabel);
    if (loc) setCursor(loc);
    setTab("session");
  }

  async function finishSession() {
    if (!live) return;
    if (!editOrig && !anyLogged(live)) {
      toast.show("Log at least one area first");
      return;
    }
    const wasEdit = !!editOrig;
    const rec: SessionInput = {
      id: editOrig?.id ?? uuid(),
      createdAt: editOrig?.createdAt ?? Date.now(),
      ...fromLive(live),
    };
    await saveSession(rec);
    await delMeta("draft");
    if (!wasEdit && Object.keys(overrides).length) {
      setOverrides({});
      await delMeta("drillOverrides");
    }

    let nextCursor = cursor;
    if (!wasEdit) {
      let w = cursor.week, s = cursor.session + 1;
      if (s >= PLAN[w].sessions.length) { s = 0; w = Math.min(w + 1, PLAN.length - 1); }
      nextCursor = { week: w, session: s };
      setCursor(nextCursor); await setMeta("cursor", nextCursor);
    }

    const all = await allSessions();
    setHistory(all);
    setLive(null);
    setEditOrig(null);
    doneFx();

    if (wasEdit) {
      setTab("trends");
      toast.show("Changes saved");
    } else {
      setReceipt({ session: all.find((x) => x.id === rec.id) ?? (rec as SavedSession), history: all, nextCursor });
      setTab("receipt");
    }
  }

  async function discard() {
    const wasEdit = !!editOrig;
    if (!wasEdit && live && anyLogged(live)) {
      if (!confirm("Discard this session? Your tallies won't be saved.")) return;
    }
    await delMeta("draft");
    setLive(null);
    setEditOrig(null);
    setTab(wasEdit ? "trends" : "home");
  }

  async function onDelete(id: string) {
    await deleteSession(id);
    setHistory(await allSessions());
    toast.show("Session deleted", {
      label: "Undo",
      run: async () => {
        await restoreSession(id);
        setHistory(await allSessions());
      },
    });
  }

  if (!ready) {
    return (
      <div className="boot"><Icon name="sports_golf" size={44} fill /></div>
    );
  }

  if (tab === "welcome") {
    return onboardedAt ? (
      <Welcome isEdit name={name} onDone={(n) => saveName(n)} onCancel={() => setTab("home")} />
    ) : (
      <Welcome onDone={finishOnboarding} />
    );
  }

  if (tab === "receipt" && receipt) {
    return (
      <SessionReceipt
        session={receipt.session}
        history={receipt.history}
        nextWeek={PLAN[receipt.nextCursor.week]}
        nextSession={PLAN[receipt.nextCursor.week].sessions[receipt.nextCursor.session]}
        onDone={() => { setReceipt(null); setTab("home"); }}
        onNext={() => { setReceipt(null); startSession(); }}
      />
    );
  }

  return (
    <>
      <div className="tabview" key={tab}>
        {tab === "home" && (
          <Home week={week} cursor={cursor} setCursor={setCursor} history={history} name={name}
                greeting={greeting(name, history)} onEditName={() => setTab("welcome")}
                oneThing={todaysOneThing(history, plannedMiss)} streak={weekStreak(history)}
                onStart={startSession} draftLabel={isDraft ? live!.sessionLabel : null}
                draftHere={draftHere} onResume={resumeDraft} />
        )}
        {tab === "session" && live && (
          <SessionScreen week={week} session={session} pitchFocus={pitchFocus} live={live} setLive={setLive}
                         overrides={overrides} onRestoreDrill={(a) => swapDrill(a, null)}
                         editMode={!!editOrig} onFinish={finishSession} onDiscard={discard} />
        )}
        {tab === "trends" && (
          <Trends history={history} onDelete={onDelete} onEdit={editSession}
                  onStart={startSession} onImported={async () => setHistory(await allSessions())} />
        )}
        {tab === "warmup" && (
          <Warmup onSkip={dismissWarmup} onReady={dismissWarmup} />
        )}
        {tab === "more" && (
          <More history={history} plannedMiss={plannedMiss} overrides={overrides} onSwap={swapDrill} />
        )}
      </div>

      <nav className="nav">
        <button className={`nav-item${tab === "home" ? " active" : ""}`} onClick={() => setTab("home")}>
          <Icon name="flag" size={24} fill={tab === "home"} />Plan
        </button>
        <button className={`nav-item${tab === "session" || tab === "warmup" ? " active" : ""}`}
                onClick={() => (live ? setTab("session") : startSession())}>
          <span className="nav-glyph">
            <Icon name="sports_golf" size={24} fill={tab === "session" || tab === "warmup"} />
            {isDraft && <span className="nav-dot" />}
          </span>
          Log
        </button>
        <button className={`nav-item${tab === "trends" ? " active" : ""}`} onClick={() => setTab("trends")}>
          <Icon name="show_chart" size={24} fill={tab === "trends"} />Trends
        </button>
        <button className={`nav-item${tab === "more" ? " active" : ""}`} onClick={() => setTab("more")}>
          <Icon name="more_horiz" size={24} fill={tab === "more"} />More
        </button>
      </nav>
    </>
  );
}

function More({ history, plannedMiss, overrides, onSwap }: {
  history: SavedSession[];
  plannedMiss: string;
  overrides: DrillOverrides;
  onSwap: (area: keyof DrillOverrides, drill: DrillOverride | null) => void;
}) {
  const [view, setView] = useState<"menu" | "prep" | "library" | "fixes">("menu");
  const [libFocus, setLibFocus] = useState<import("@/lib/faults").Fault | null>(null);
  const openLibrary = (f: import("@/lib/faults").Fault | null) => { setLibFocus(f); setView("library"); };
  if (view === "prep") return <Prep onBack={() => setView("menu")} />;
  if (view === "library")
    return (
      <Library onBack={() => { setLibFocus(null); setView("menu"); }}
               history={history} plannedMiss={plannedMiss}
               overrides={overrides} onSwap={onSwap} focusFault={libFocus} />
    );
  if (view === "fixes")
    return (
      <Fixes onBack={() => setView("menu")} history={history} plannedMiss={plannedMiss}
             onPractice={openLibrary} />
    );
  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-eyebrow">Toolkit</div>
            <div className="hdr-title">More</div>
            <div className="hdr-sub">Reference &amp; guidance</div>
          </div>
        </div>
      </header>
      <div className="screen">
        <button className="more-row" onClick={() => setView("prep")}>
          <span className="more-ic"><Icon name="self_improvement" size={22} color="var(--green)" /></span>
          <span className="more-txt"><b>Prep</b><span>Warm-up, setup check, session flow</span></span>
          <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
        </button>
        <button className="more-row" onClick={() => setView("library")}>
          <span className="more-ic"><Icon name="menu_book" size={22} color="var(--green)" /></span>
          <span className="more-txt"><b>Drill library</b><span>Alternate drills for every area</span></span>
          <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
        </button>
        <button className="more-row" onClick={() => setView("fixes")}>
          <span className="more-ic"><Icon name="build" size={22} color="var(--green)" /></span>
          <span className="more-txt"><b>Fixes</b><span>Miss patterns and the first fix to try</span></span>
          <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
        </button>
      </div>
    </>
  );
}

function Home({
  week, cursor, setCursor, history, name, greeting, onEditName, oneThing, streak,
  onStart, draftLabel, draftHere, onResume,
}: {
  week: Week;
  cursor: { week: number; session: number };
  setCursor: (c: { week: number; session: number }) => void;
  history: SavedSession[];
  name: string;
  greeting: string;
  onEditName: () => void;
  oneThing: import("@/lib/verdict").OneThing | null;
  streak: number;
  onStart: () => void;
  draftLabel: string | null;
  draftHere: boolean;
  onResume: () => void;
}) {
  const flat = PLAN.flatMap((w, wi) =>
    w.sessions.map((s, si) => ({ wi, si, id: w.id, label: s.label, test: /test/i.test(s.label) }))
  );
  const curIdx = flat.findIndex((f) => f.wi === cursor.week && f.si === cursor.session);
  const loggedSlots = new Set(history.map((s) => `${s.weekId}|${s.sessionLabel}`));
  const loggedCount = flat.filter((f) => loggedSlots.has(`${f.id}|${f.label}`)).length;
  const done = history.length;
  const lastSolid = history.length ? solidPct(history[history.length - 1]) : null;
  const solidDelta = history.length >= 2
    ? solidPct(history[history.length - 1]) - solidPct(history[history.length - 2])
    : null;
  const donePct = Math.min(100, Math.round((done / flat.length) * 100));
  const firstRun = done === 0;

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            {!firstRun && (
              <button className="greeting" onClick={onEditName} aria-label="Edit your name">
                <span>{greeting}</span><Icon name="edit" size={13} />
              </button>
            )}
            <div className="hdr-title">Week {cursor.week + 1} · {week.title}</div>
            <div className="hdr-sub">Session {cursor.session + 1} of {week.sessions.length}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
            {streak > 1 && (
              <div className="chip" style={{ color: "var(--sand)", background: "var(--sand-face)", borderColor: "var(--sand-border)" }}>
                <Icon name="local_fire_department" size={15} fill />{streak} wk
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="screen">
        {draftLabel && !draftHere && (
          <button className="draft-banner" onClick={onResume}>
            <Icon name="pending_actions" size={18} />
            <span>Unfinished — {draftLabel}</span>
            <b>Resume</b>
          </button>
        )}

        {firstRun && (
          <div className="home-hero">
            <div className="eyebrow">
              <span className="icon-tile sm"><Icon name="sports_golf" size={15} /></span>
              Session one
            </div>
            <button className="home-hero-h" onClick={onEditName} aria-label="Edit your name">
              {name ? `Welcome, ${name}.` : "Welcome."}
              <Icon name="edit" size={15} />
            </button>
            <p className="home-hero-p">
              Let&apos;s get your baseline down — one honest pass through all five areas.
              No targets to hit today, just the truth about where your game is.
            </p>
            <div className="home-hero-meta">
              <span><Icon name="format_list_bulleted" size={15} />5 areas</span>
              <span><Icon name="sports_golf" size={15} />~10 balls each</span>
              <span><Icon name="schedule" size={15} />about 40 min</span>
            </div>
          </div>
        )}

        {oneThing && (
          <div className="onething">
            <div className="lbl">
              <span className="icon-tile sm"><Icon name="target" size={15} /></span>
              <span className="eyebrow">Today&apos;s one thing</span>
            </div>
            <div className="onething-title">{oneThing.title}</div>
            <div className="onething-body">{oneThing.body}</div>
            <div className="onething-src"><Icon name="auto_awesome" size={15} />{oneThing.source}</div>
          </div>
        )}

        {!firstRun && (
        <div className="tiles">
          <div className="tile">
            <div className="tile-head">
              <span className="eyebrow">Total logs</span>
              <span className="icon-tile sm dim"><Icon name="event_available" size={15} /></span>
            </div>
            <div className="tile-val num">{done}<span className="frac">/{flat.length}</span></div>
            <div className="tile-foot">
              <span className="tile-lbl">sessions logged</span>
              <span className="tile-lbl num">{donePct}%</span>
            </div>
          </div>
          <div className="tile accent">
            <div className="tile-head">
              <span className="eyebrow">Solid rate</span>
              <span className="icon-tile sm"><Icon name="trending_up" size={15} /></span>
            </div>
            <div className="tile-val num">
              {lastSolid === null ? "—" : <>{lastSolid}<span className="u">%</span></>}
            </div>
            <div className="tile-foot">
              <span className="tile-lbl">last solid rate</span>
              {solidDelta !== null && solidDelta !== 0 && (
                <span className={"delta" + (solidDelta < 0 ? " down" : "")}>
                  {solidDelta > 0 ? "+" : "−"}{Math.abs(solidDelta)}
                </span>
              )}
            </div>
          </div>
        </div>
        )}

        <div className="focuscard">
          <div className="lbl">
            <span className="icon-tile sm"><Icon name="target" size={15} /></span>
            <span className="eyebrow">This week&apos;s focus</span>
          </div>
          <div className="body">{week.focus}</div>
        </div>

        <div className="grp">
          <div className="sec-head">
            <span className="icon-tile sm"><Icon name="calendar_month" size={15} /></span>
            <h3>Jump to a session</h3>
            <span className={"count-pill" + (loggedCount === flat.length ? " go" : "")}>
              {loggedCount} of {flat.length} logged
            </span>
          </div>
          <div className="sgrid">
            {flat.map((f, i) => {
              const cls = i < curIdx ? "past" : i === curIdx ? "cur" : "";
              const isDone = loggedSlots.has(`${f.id}|${f.label}`);
              return (
                <button key={f.id + f.si}
                        className={`spill ${cls}${isDone ? " done" : ""}${f.test ? " test-pill" : ""}`}
                        onClick={() => setCursor({ week: f.wi, session: f.si })}>
                  <span>
                    W{f.wi + 1}
                    {isDone
                      ? <Icon name="check_circle" size={13} className="spill-check" fill />
                      : cls === "cur"
                        ? <span className="spill-now">Now</span>
                        : null}
                  </span>
                  <span className={`s${f.test ? " test" : ""}`}>{f.test ? "Test" : `S${f.si + 1}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grp" style={{ paddingTop: 4 }}>
          <button className="cta" onClick={onStart}>
            <Icon name={draftHere ? "play_arrow" : "play_arrow"} size={22} fill />
            {draftHere ? "Resume session" : "Start this session"}
          </button>
          <div className="arealist">
            {AREAS.map(([n, ic]) => <span key={n}><Icon name={ic} size={15} />{n}</span>)}
          </div>
        </div>
      </div>
    </>
  );
}

type AreaKey = "chipping" | "irons" | "driving" | "pitching" | "putting";
type Tone = "good" | "sand" | "clay";
type StepDef = {
  id: string; area: AreaKey; name: string; icon: string; drillIcon: string; target: number;
  outcomes: { key: string; tone: Tone; icon: string; label: string }[];
};

const STEPS: StepDef[] = [
  { id: "chip", area: "chipping", name: "Chipping", icon: "swipe_up", drillIcon: "crop_square", target: 10,
    outcomes: [
      { key: "on", tone: "good", icon: "check", label: "On towel" },
      { key: "off", tone: "clay", icon: "close", label: "Off towel" },
    ] },
  { id: "pitch", area: "pitching", name: "Pitching", icon: "arrow_outward", drillIcon: "flag", target: 10,
    outcomes: [
      { key: "close", tone: "good", icon: "check", label: "Close" },
      { key: "short", tone: "sand", icon: "arrow_downward", label: "Short" },
      { key: "long", tone: "clay", icon: "arrow_upward", label: "Long" },
    ] },
  { id: "iron", area: "irons", name: "Irons", icon: "golf_course", drillIcon: "stacked_line_chart", target: 9,
    outcomes: [
      { key: "solid", tone: "good", icon: "check", label: "Solid" },
      { key: "fat", tone: "sand", icon: "south_east", label: "Fat" },
      { key: "thin", tone: "clay", icon: "north_east", label: "Thin" },
    ] },
  { id: "drive", area: "driving", name: "Driving", icon: "sports_golf", drillIcon: "near_me", target: 10,
    outcomes: [
      { key: "fairway", tone: "good", icon: "check", label: "On line" },
      { key: "left", tone: "sand", icon: "west", label: "Left" },
      { key: "right", tone: "clay", icon: "east", label: "Right" },
    ] },
  { id: "putt", area: "putting", name: "Putting", icon: "adjust", drillIcon: "door_sliding", target: 10,
    outcomes: [
      { key: "in", tone: "good", icon: "golf_course", label: "In" },
      { key: "out", tone: "clay", icon: "close", label: "Out" },
    ] },
];

function liveNote(area: AreaKey, strip: string[]): string {
  const n = strip.length;
  if (n < 3) return "The pattern tells you more than the total — keep going.";
  const c = (k: string) => strip.reduce((a, x) => (x === k ? a + 1 : a), 0);
  const good = area === "driving" ? "fairway" : area === "irons" ? "solid"
    : area === "chipping" ? "on" : area === "pitching" ? "close" : "in";
  const goodRate = c(good) / n;
  if (area === "driving") {
    if (c("right") >= c("left") + 2) return "Leaking right — set your feet left and let it be.";
    if (c("left") >= c("right") + 2) return "Pulling left — your shoulders are probably closed at address.";
    if (goodRate >= 0.7) return "Best start-line run of the day. Change nothing.";
    return "Misses go both ways — that's timing, not aim.";
  }
  if (area === "irons") {
    if (c("fat") >= c("thin") + 2) return "Heavy — feel the low point ahead of the ball.";
    if (c("thin") >= c("fat") + 2) return "Thin — you're standing up out of it. Chest stays down.";
    if (goodRate >= 0.7) return "Flushing it. Same swing, next ball.";
    return "Contact's mixed — settle your tempo before the next one.";
  }
  if (area === "chipping") {
    if (goodRate >= 0.6) return "Landing zone dialled. Trust it.";
    return "Short of the towel? Commit to a firmer, shorter stroke.";
  }
  if (area === "pitching") {
    if (c("short") >= c("long") + 2) return "Coming up short — take one more club-length of backswing.";
    if (c("long") >= c("short") + 2) return "Flying it long — quieten the hit through impact.";
    if (goodRate >= 0.6) return "Distance control is there today.";
    return "Distances scattered — pick one number and groove it.";
  }
  if (goodRate >= 0.7) return "Stroke's holding. Keep the same routine.";
  return "Misses creeping in — slow the takeaway on the next few.";
}

function SessionScreen({
  week, session, pitchFocus, live, setLive, overrides, onRestoreDrill, editMode, onFinish, onDiscard,
}: {
  week: Week; session: Session;
  pitchFocus: { name: string; how: string; sticks: string | null };
  live: Live;
  setLive: (l: Live) => void;
  overrides: DrillOverrides;
  onRestoreDrill: (area: AreaKey) => void;
  editMode: boolean;
  onFinish: () => void;
  onDiscard: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    { chip: true, iron: false, drive: false, pitch: false, putt: false },
  );
  const set = (patch: Partial<Live>) => setLive({ ...live, ...patch });
  const toggle = (k: string) => setOpen({ ...open, [k]: !open[k] });

  const push = (area: AreaKey, key: string) => {
    const arr = live.strips[area];
    if (arr.length >= 60) return;
    set({ strips: { ...live.strips, [area]: [...arr, key] } });
  };
  const popType = (area: AreaKey, key: string) => {
    const arr = [...live.strips[area]];
    for (let i = arr.length - 1; i >= 0; i--) { if (arr[i] === key) { arr.splice(i, 1); break; } }
    set({ strips: { ...live.strips, [area]: arr } });
  };
  const popLast = (area: AreaKey) => {
    if (!live.strips[area].length) return;
    set({ strips: { ...live.strips, [area]: live.strips[area].slice(0, -1) } });
  };

  const areaLogged = (a: AreaKey) => live.strips[a].length > 0 || (a === "chipping" && !!live.bestClub.trim());
  const logged = STEPS.filter((s) => areaLogged(s.area)).length;
  const canFinish = editMode || logged > 0;

  const drillFor = (step: StepDef): { line: string; cards: { how: string; name?: string }[]; sticks: string[]; swapped?: boolean } => {
    const ov = editMode ? undefined : overrides[step.area];
    if (ov) {
      return step.area === "pitching"
        ? { line: PITCHING_DRILL, cards: [{ how: ov.how, name: ov.name }], sticks: [], swapped: true }
        : { line: ov.name, cards: [{ how: ov.how }], sticks: [], swapped: true };
    }
    if (step.area === "chipping") return { line: session.chip.name, cards: [{ how: session.chip.how }], sticks: session.chip.sticks ? [session.chip.sticks] : [] };
    if (step.area === "irons") return { line: session.iron.name, cards: [{ how: session.iron.how }], sticks: session.iron.sticks ? [session.iron.sticks] : [] };
    if (step.area === "driving") return { line: session.drive.name, cards: [{ how: session.drive.how }], sticks: session.drive.sticks ? [session.drive.sticks] : [] };
    if (step.area === "pitching") return { line: PITCHING_DRILL, cards: [{ how: pitchFocus.how, name: pitchFocus.name }], sticks: pitchFocus.sticks ? [pitchFocus.sticks] : [] };
    return {
      line: session.putts[0]?.name ?? "",
      cards: session.putts.map((p) => ({ how: p.how })),
      sticks: session.putts.map((p) => p.sticks).filter((x): x is string => !!x),
    };
  };

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-eyebrow">{editMode ? "Editing session" : "Session log"}</div>
            <div className="hdr-title sm">
              {week.short} · {session.label.replace(/ —.*/, "")}
            </div>
            <div className="hdr-sub sm">{week.title} block · 5 areas</div>
          </div>
          <div className="chip"><Icon name="check_circle" size={16} fill={logged === 5} />{logged}/5</div>
        </div>
        <div className="pbar"><span style={{ width: `${(logged / 5) * 100}%` }} /></div>
      </header>

      <div className="screen log">
        <details className="flowstrip">
          <summary>
            <Icon name="checklist" size={16} />Session flow
            <Icon name="expand_more" size={18} className="flowstrip-chev" />
          </summary>
          <ol className="flow-list">
            {SESSION_FLOW.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </details>

        {STEPS.map((step) => {
          const strip = live.strips[step.area];
          const done = areaLogged(step.area);
          const d = drillFor(step);
          const good = step.outcomes[0].key;
          const goodN = strip.reduce((a, x) => (x === good ? a + 1 : a), 0);
          const tallyKeys = step.outcomes.map((o) => strip.reduce((a, x) => (x === o.key ? a + 1 : a), 0));
          return (
            <Block key={step.id} id={step.id} name={step.name} icon={step.icon} logged={done}
                   tally={tallyKeys.join("/")}
                   open={open[step.id]} toggle={() => toggle(step.id)}>
              <div className="drline">
                <Icon name={step.drillIcon} size={17} color="var(--blue)" style={{ marginTop: 1 }} />{d.line}
              </div>
              {d.swapped && (
                <div className="drswap">
                  <Icon name="swap_horiz" size={13} />
                  <span>Swapped in from the Library</span>
                  <button onClick={() => onRestoreDrill(step.area)}>Restore planned</button>
                </div>
              )}

              {step.area === "chipping" && (
                <div className="grp" style={{ gap: 8 }}>
                  <div className="grp-lbl">Best club today</div>
                  <div className="field">
                    <Icon name="sports_golf" size={19} color="var(--icon-muted)" />
                    <input value={live.bestClub} maxLength={40}
                           onChange={(e) => set({ bestClub: e.target.value })}
                           placeholder="e.g. 54° wedge" />
                  </div>
                </div>
              )}

              <div className="shotstrip">
                <div className="shotstrip-head">
                  <span className="eyebrow dim">Ball {Math.min(step.target, strip.length + 1)} of {step.target}</span>
                  {strip.length > 0 && (
                    <span className="shotstrip-rate" style={{ color: goodN / strip.length >= 0.5 ? "var(--green)" : "var(--sand)" }}>
                      <Icon name="insights" size={14} />{Math.round((goodN / strip.length) * 100)}% on line
                    </span>
                  )}
                </div>
                <div className="shotstrip-dots">
                  {Array.from({ length: step.target }).map((_, i) => {
                    const k = strip[i];
                    const o = step.outcomes.find((x) => x.key === k);
                    return (
                      <span key={i} className={"strip-dot" + (o ? " " + o.tone : "")}>
                        {o && <Icon name={o.icon} size={13} />}
                      </span>
                    );
                  })}
                  {strip.slice(step.target).map((k, i) => {
                    const o = step.outcomes.find((x) => x.key === k);
                    return <span key={"x" + i} className={"strip-dot" + (o ? " " + o.tone : "")}>{o && <Icon name={o.icon} size={13} />}</span>;
                  })}
                </div>
                {strip.length >= 3 && (
                  <div className="shotstrip-note">
                    <Icon name="lightbulb" size={16} color="var(--blue-icon)" />{liveNote(step.area, strip)}
                  </div>
                )}
              </div>

              <div className="outcomes">
                {step.outcomes.map((o) => (
                  <Outcome key={o.key} tone={o.tone} icon={o.icon} label={o.label}
                           count={strip.reduce((a, x) => (x === o.key ? a + 1 : a), 0)}
                           onInc={() => push(step.area, o.key)}
                           onDec={() => popType(step.area, o.key)} />
                ))}
              </div>

              <div className="strip-actions">
                <button className="btn-ghost sm" onClick={() => popLast(step.area)} disabled={!strip.length}>
                  <Icon name="undo" size={16} />Undo last
                </button>
                <span className="hint" style={{ margin: 0 }}>hold a count to subtract</span>
              </div>

              {d.cards.map((c, i) => <DrillCard key={i} how={c.how} name={c.name} />)}
              {d.sticks.map((s, i) => <Stick key={i} text={s} />)}
            </Block>
          );
        })}

        <div className="grp" style={{ paddingTop: 8 }}>
          <div className="label-row"><Icon name="event" size={16} />Session date</div>
          <input className="datefield num" type="date" value={live.date}
                 min="2000-01-01" max={today()}
                 onChange={(e) => set({ date: e.target.value || today() })} />
          <div className="label-row" style={{ marginTop: 4 }}><Icon name="edit_note" size={16} />Session notes</div>
          <textarea className="notes" value={live.notes} maxLength={2000}
                    onChange={(e) => set({ notes: e.target.value })}
                    placeholder="Conditions, feels, what clicked…" />
          <button className="cta" onClick={onFinish} disabled={!canFinish}>
            <Icon name={editMode ? "save" : "done_all"} size={22} />
            {editMode ? "Save changes" : "Finish session"}
          </button>
          {!canFinish && <div className="hint">Log at least one area to finish.</div>}
          <button className="btn-ghost" onClick={onDiscard}>
            {editMode ? "Cancel" : "Discard session"}
          </button>
        </div>
      </div>
    </>
  );
}

function Block({
  id, name, icon, logged, tally, open, toggle, children,
}: {
  id: string; name: string; icon: string; logged: boolean; tally: string;
  open: boolean; toggle: () => void; children: React.ReactNode;
}) {
  const cls = "block" + (!logged && !open ? " empty" : "") + (!open ? " collapsed" : "");
  return (
    <section className={cls} data-block={id}>
      <button className="block-head" onClick={toggle} aria-expanded={open}>
        <span className="block-name">
          <Icon name={icon} size={21} color={logged || open ? "var(--green)" : "var(--icon-muted)"} />{name}
        </span>
        <span className="block-right">
          {(logged || !open) && (
            <span className={`block-tally${logged ? "" : " none"}`}>{logged ? tally : "not logged"}</span>
          )}
          <Icon name={open ? "expand_less" : "expand_more"} size={22} color="var(--icon-muted)" />
        </span>
      </button>
      {open && <div className="block-body">{children}</div>}
    </section>
  );
}

function DrillCard({ how, name }: { how: string; name?: string }) {
  return (
    <div className="drill">
      <div className="drill-t"><Icon name="bolt" size={18} color="var(--green)" />{name ?? "Focus drill"}</div>
      <div className="drill-b">{how}</div>
    </div>
  );
}

function Stick({ text }: { text: string }) {
  return (
    <div className="stick">
      <Icon name="straighten" size={18} color="var(--blue-icon)" style={{ marginTop: 1 }} />
      <div className="stick-b"><b>Alignment sticks:</b> {text}</div>
    </div>
  );
}
