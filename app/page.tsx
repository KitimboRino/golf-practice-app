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
  SavedSession, SessionInput, saveSession, allSessions, deleteSession, restoreSession, uuid,
  getMeta, setMeta, delMeta,
} from "@/lib/db";
import { solidPct } from "@/lib/stats";
import { doneFx } from "@/lib/haptics";

type Tab = "home" | "session" | "trends" | "more" | "warmup" | "welcome";

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

// live counters for the session in progress (new session or an edit)
type Live = {
  weekId: string; sessionLabel: string; date: string; notes: string;
  fairway: number; left: number; right: number;
  solid: number; fat: number; thin: number;
  bestClub: string; on: number; off: number;
  pClose: number; pShort: number; pLong: number;
  in: number; out: number;
};

type NumKey = { [K in keyof Live]: Live[K] extends number ? K : never }[keyof Live];

function emptyLive(weekId: string, sessionLabel: string): Live {
  return {
    weekId, sessionLabel, date: new Date().toISOString().slice(0, 10), notes: "",
    fairway: 0, left: 0, right: 0, solid: 0, fat: 0, thin: 0,
    bestClub: "", on: 0, off: 0, pClose: 0, pShort: 0, pLong: 0, in: 0, out: 0,
  };
}

function toLive(s: SavedSession): Live {
  const p = s.pitching ?? { close: 0, short: 0, long: 0 };
  return {
    weekId: s.weekId, sessionLabel: s.sessionLabel, date: s.date, notes: s.notes,
    fairway: s.driving.fairway, left: s.driving.left, right: s.driving.right,
    solid: s.irons.solid, fat: s.irons.fat, thin: s.irons.thin,
    bestClub: s.chipping.bestClub, on: s.chipping.on, off: s.chipping.off,
    pClose: p.close, pShort: p.short, pLong: p.long,
    in: s.putting.in, out: s.putting.out,
  };
}

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

function fromLive(l: Live) {
  return {
    weekId: l.weekId, sessionLabel: l.sessionLabel,
    date: isDate(l.date) ? l.date : today(),
    notes: l.notes.slice(0, 2000),
    driving: { fairway: l.fairway, left: l.left, right: l.right },
    irons: { solid: l.solid, fat: l.fat, thin: l.thin },
    chipping: { bestClub: l.bestClub, on: l.on, off: l.off },
    pitching: { close: l.pClose, short: l.pShort, long: l.pLong },
    putting: { in: l.in, out: l.out },
  };
}

function anyLogged(l: Live) {
  return l.fairway + l.left + l.right + l.solid + l.fat + l.thin +
    l.on + l.off + l.pClose + l.pShort + l.pLong + l.in + l.out > 0
    || !!l.bestClub || !!l.notes.trim();
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
  ["Chipping", "swipe_up"], ["Irons", "golf_course"],
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
  const toast = useToast();

  useEffect(() => {
    (async () => {
      setHistory(await allSessions());
      setName((await getMeta<string>("name")) ?? "");
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

  async function finishOnboarding(n: string) {
    const nm = cleanName(n);
    const now = new Date().toISOString();
    setName(nm);
    setOnboardedAt(now);
    await setMeta("name", nm);
    await setMeta("onboardedAt", now);
    setTab("home");
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

    if (!wasEdit) {
      let w = cursor.week, s = cursor.session + 1;
      if (s >= PLAN[w].sessions.length) { s = 0; w = Math.min(w + 1, PLAN.length - 1); }
      const nc = { week: w, session: s };
      setCursor(nc); await setMeta("cursor", nc);
    }

    setHistory(await allSessions());
    setLive(null);
    setEditOrig(null);
    setTab(wasEdit ? "trends" : "home");
    doneFx();
    toast.show(wasEdit ? "Changes saved" : "Session saved");
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
      <Welcome isEdit name={name} onDone={saveName} onCancel={() => setTab("home")} />
    ) : (
      <Welcome onDone={finishOnboarding} />
    );
  }

  return (
    <>
      <div className="tabview" key={tab}>
        {tab === "home" && (
          <Home week={week} cursor={cursor} setCursor={setCursor} history={history}
                greeting={greeting(name, history)} onEditName={() => setTab("welcome")}
                onStart={startSession} draftLabel={isDraft ? live!.sessionLabel : null}
                draftHere={draftHere} onResume={resumeDraft} />
        )}
        {tab === "session" && live && (
          <SessionScreen week={week} session={session} pitchFocus={pitchFocus} live={live} setLive={setLive}
                         editMode={!!editOrig} onFinish={finishSession} onDiscard={discard} />
        )}
        {tab === "trends" && (
          <Trends history={history} onDelete={onDelete} onEdit={editSession}
                  onStart={startSession} onImported={async () => setHistory(await allSessions())} />
        )}
        {tab === "warmup" && (
          <Warmup onSkip={dismissWarmup} onReady={dismissWarmup} />
        )}
        {tab === "more" && <More />}
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

function More() {
  const [view, setView] = useState<"menu" | "prep" | "library" | "fixes">("menu");
  if (view === "prep") return <Prep onBack={() => setView("menu")} />;
  if (view === "library") return <Library onBack={() => setView("menu")} />;
  if (view === "fixes") return <Fixes onBack={() => setView("menu")} />;
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
  week, cursor, setCursor, history, greeting, onEditName,
  onStart, draftLabel, draftHere, onResume,
}: {
  week: Week;
  cursor: { week: number; session: number };
  setCursor: (c: { week: number; session: number }) => void;
  history: SavedSession[];
  greeting: string;
  onEditName: () => void;
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

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <button className="greeting" onClick={onEditName} aria-label="Edit your name">
              <span>{greeting}</span><Icon name="edit" size={13} />
            </button>
            <div className="hdr-title">Week {cursor.week + 1} · {week.title}</div>
            <div className="hdr-sub">Session {cursor.session + 1} of {week.sessions.length}</div>
          </div>
          <ThemeToggle />
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

function SessionScreen({
  week, session, pitchFocus, live, setLive, editMode, onFinish, onDiscard,
}: {
  week: Week; session: Session;
  pitchFocus: { name: string; how: string; sticks: string | null };
  live: Live;
  setLive: (l: Live) => void;
  editMode: boolean;
  onFinish: () => void;
  onDiscard: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    { chip: true, iron: false, drive: false, pitch: false, putt: false },
  );
  const set = (patch: Partial<Live>) => setLive({ ...live, ...patch });
  const toggle = (k: string) => setOpen({ ...open, [k]: !open[k] });

  // outcome counters: 0–99, so a stuck tap or bad import can't produce nonsense
  const CAP = 99;
  const adj = (key: NumKey, delta: number) =>
    set({ [key]: Math.max(0, Math.min(CAP, live[key] + delta)) } as Partial<Live>);
  const inc = (key: NumKey) => () => adj(key, 1);
  const dec = (key: NumKey) => () => adj(key, -1);

  const areas = {
    drive: live.fairway + live.left + live.right > 0,
    iron: live.solid + live.fat + live.thin > 0,
    chip: live.on + live.off > 0 || !!live.bestClub.trim(),
    pitch: live.pClose + live.pShort + live.pLong > 0,
    putt: live.in + live.out > 0,
  };
  const logged = Object.values(areas).filter(Boolean).length;
  const canFinish = editMode || logged > 0;

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

        <Block id="chip" name="Chipping" icon="swipe_up" logged={areas.chip}
               tally={live.bestClub ? `${live.bestClub} · ${live.on}/${live.off}` : `${live.on}/${live.off}`}
               open={open.chip} toggle={() => toggle("chip")}>
          <div className="drline">
            <Icon name="crop_square" size={17} color="var(--blue)" style={{ marginTop: 1 }} />{session.chip.name}
          </div>
          <div className="grp" style={{ gap: 8 }}>
            <div className="grp-lbl">Best club today</div>
            <div className="field">
              <Icon name="sports_golf" size={19} color="var(--icon-muted)" />
              <input value={live.bestClub} maxLength={40}
                     onChange={(e) => set({ bestClub: e.target.value })}
                     placeholder="e.g. 54° wedge" />
            </div>
          </div>
          <div className="outcomes">
            <Outcome tone="good" icon="check" label="On towel" count={live.on}
                     onInc={inc("on")} onDec={dec("on")} />
            <Outcome tone="clay" icon="close" label="Off towel" count={live.off}
                     onInc={inc("off")} onDec={dec("off")} />
          </div>
          <DrillCard how={session.chip.how} />
          {session.chip.sticks && <Stick text={session.chip.sticks} />}
        </Block>

        <Block id="iron" name="Irons" icon="golf_course" logged={areas.iron}
               tally={`${live.solid}/${live.fat}/${live.thin}`}
               open={open.iron} toggle={() => toggle("iron")}>
          <div className="drline">
            <Icon name="stacked_line_chart" size={17} color="var(--blue)" style={{ marginTop: 1 }} />{session.iron.name}
          </div>
          <div className="outcomes">
            <Outcome tone="good" icon="check" label="Solid" count={live.solid}
                     onInc={inc("solid")} onDec={dec("solid")} />
            <Outcome tone="sand" icon="south_east" label="Fat" count={live.fat}
                     onInc={inc("fat")} onDec={dec("fat")} />
            <Outcome tone="clay" icon="north_east" label="Thin" count={live.thin}
                     onInc={inc("thin")} onDec={dec("thin")} />
          </div>
          <div className="hint"><Icon name="touch_app" size={14} />Tap to add · hold to subtract</div>
          <DrillCard how={session.iron.how} />
          {session.iron.sticks && <Stick text={session.iron.sticks} />}
        </Block>

        <Block id="drive" name="Driving" icon="sports_golf" logged={areas.drive}
               tally={`${live.fairway}/${live.left}/${live.right}`}
               open={open.drive} toggle={() => toggle("drive")}>
          <div className="drline">
            <Icon name="near_me" size={17} color="var(--blue)" style={{ marginTop: 1 }} />{session.drive.name}
          </div>
          <div className="outcomes">
            <Outcome tone="good" icon="check" label="Fairway" count={live.fairway}
                     onInc={inc("fairway")} onDec={dec("fairway")} />
            <Outcome tone="sand" icon="west" label="Left" count={live.left}
                     onInc={inc("left")} onDec={dec("left")} />
            <Outcome tone="clay" icon="east" label="Right" count={live.right}
                     onInc={inc("right")} onDec={dec("right")} />
          </div>
          <div className="hint"><Icon name="touch_app" size={14} />Tap to add · hold to subtract</div>
          <DrillCard how={session.drive.how} />
          {session.drive.sticks && <Stick text={session.drive.sticks} />}
        </Block>

        <Block id="pitch" name="Pitching" icon="arrow_outward" logged={areas.pitch}
               tally={`${live.pClose}/${live.pShort}/${live.pLong}`}
               open={open.pitch} toggle={() => toggle("pitch")}>
          <div className="drline">
            <Icon name="flag" size={17} color="var(--blue)" style={{ marginTop: 1 }} />{PITCHING_DRILL}
          </div>
          <div className="outcomes">
            <Outcome tone="good" icon="check" label="Close" count={live.pClose}
                     onInc={inc("pClose")} onDec={dec("pClose")} />
            <Outcome tone="sand" icon="arrow_downward" label="Short" count={live.pShort}
                     onInc={inc("pShort")} onDec={dec("pShort")} />
            <Outcome tone="clay" icon="arrow_upward" label="Long" count={live.pLong}
                     onInc={inc("pLong")} onDec={dec("pLong")} />
          </div>
          <div className="hint"><Icon name="touch_app" size={14} />Tap to add · hold to subtract</div>
          <DrillCard name={pitchFocus.name} how={pitchFocus.how} />
          {pitchFocus.sticks && <Stick text={pitchFocus.sticks} />}
        </Block>

        <Block id="putt" name="Putting" icon="adjust" logged={areas.putt}
               tally={`${live.in}/${live.out}`}
               open={open.putt} toggle={() => toggle("putt")}>
          <div className="drline">
            <Icon name="door_sliding" size={17} color="var(--blue)" style={{ marginTop: 1 }} />{session.putts[0]?.name}
          </div>
          <div className="outcomes">
            <Outcome tone="good" icon="golf_course" label="In" count={live.in}
                     onInc={inc("in")} onDec={dec("in")} />
            <Outcome tone="clay" icon="close" label="Out" count={live.out}
                     onInc={inc("out")} onDec={dec("out")} />
          </div>
          {session.putts.map((p, i) => <DrillCard key={i} how={p.how} />)}
          {session.putts.map((p, i) => (p.sticks ? <Stick key={i} text={p.sticks} /> : null))}
        </Block>

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
          {!canFinish && (
            <div className="hint">Log at least one area to finish.</div>
          )}
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
