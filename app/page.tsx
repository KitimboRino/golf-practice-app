"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  PLANS, ALL_WEEKS, planSlotKey, planSlotKeysFor, Level, DEFAULT_LEVEL, LEVEL_LABEL, Week, Session,
} from "@/lib/plan";
import { SESSION_FLOW } from "@/lib/prep";
import { PITCH_FOCUS_BY_LEVEL, PITCHING_DRILL, LIBRARY } from "@/lib/library";
import { CATALOG } from "@/lib/faults";
import { Outcome } from "@/components/Outcome";
import { VoiceLogButton } from "@/components/VoiceLog";
import { Goal } from "@/lib/goal";
import { Icon } from "@/components/Icon";
import { AreaIcon } from "@/components/AreaIcon";
import { Warmup } from "@/components/Warmup";
import { Welcome } from "@/components/Welcome";
import { FirstRun } from "@/components/FirstRun";
import { Onboarding, OnbStage, FRESH_ONB, Shot, ReadSession } from "@/lib/onboarding";
import { Mark } from "@/components/Mark";
import dynamic from "next/dynamic";

// Secondary screens are split out of the app shell so the first screen
// paints sooner. Page prefetches them all at idle (see below), so by the
// time anyone taps through they're loaded, and cached for offline use.
const SCREENS = {
  trends: () => import("@/components/Trends"),
  round: () => import("@/components/Round"),
  fixes: () => import("@/components/Fixes"),
  prep: () => import("@/components/Prep"),
  library: () => import("@/components/Library"),
  games: () => import("@/components/Games"),
  routine: () => import("@/components/Routine"),
  course: () => import("@/components/Course"),
  swing: () => import("@/components/SwingCheck"),
  // TensorFlow + the pose model code (~1.7 MB), which SwingCheck itself only
  // imports when a clip is analysed; warming it here gets it into the service
  // worker's cache so swing check works offline. App route only, so the
  // landing page never downloads it.
  pose: () => import("@/lib/swingPose"),
};
const Trends = dynamic(() => SCREENS.trends().then((m) => m.Trends));
const Round = dynamic(() => SCREENS.round().then((m) => m.Round));
const RoundSummary = dynamic(() => SCREENS.round().then((m) => m.RoundSummary));
const Fixes = dynamic(() => SCREENS.fixes().then((m) => m.Fixes));
const Prep = dynamic(() => SCREENS.prep().then((m) => m.Prep));
const Library = dynamic(() => SCREENS.library().then((m) => m.Library));
const Games = dynamic(() => SCREENS.games().then((m) => m.Games));
const Routine = dynamic(() => SCREENS.routine().then((m) => m.Routine));
const Course = dynamic(() => SCREENS.course().then((m) => m.Course));
const SwingCheck = dynamic(() => SCREENS.swing().then((m) => m.SwingCheck));
import { LiveRound } from "@/lib/round";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlareToggle } from "@/components/GlareToggle";
import { PhotoHeader } from "@/components/PhotoHeader";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/Confirm";
import {
  SavedSession, SessionInput, Strips, emptyStrips, countIn, ADHOC,
  DrillOverride, DrillOverrides, SavedRound, RoundInput,
  GameAttempt, GameAttemptInput, SavedSwing,
  saveSession, allSessions, deleteSession, restoreSession, uuid,
  saveRound, allRounds, deleteRound, restoreRound,
  saveGameAttempt, allGameAttempts, deleteGameAttempt, restoreGameAttempt,
  allSwings,
  getMeta, setMeta, delMeta,
} from "@/lib/db";
import { solidPct } from "@/lib/stats";
import { todaysOneThing, sessionsThisMonth, sessionBalls } from "@/lib/verdict";
import { SessionReceipt } from "@/components/SessionReceipt";
import { About } from "@/components/About";
import { APP_VERSION } from "@/lib/version";
import { doneFx, tapFx } from "@/lib/haptics";
import { localDate } from "@/lib/date";
import { useCountUp } from "@/lib/useCountUp";
import { DispersionFan } from "@/components/DispersionFan";
import { loadDemo, exitDemo } from "@/lib/demo";

type Tab = "home" | "session" | "trends" | "more" | "warmup" | "welcome" | "receipt" | "quickpick" | "firstrun" | "round";

type QuickFocus = { title: string; body: string };

const today = () => localDate();

// Splash-screen escape hatch: a stale service worker or a broken cache after a
// deploy can wedge the app before React finishes loading. Drop the SW + caches
// (IndexedDB is left alone) and reload against the network.
async function recoverBoot() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if (typeof caches !== "undefined") {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* best effort */
  }
  location.reload();
}

function greeting(name: string, history: SavedSession[]): string {
  const who = name ? `, ${name}` : "";
  if (history.length === 0) return `Welcome${who}. Let's get your baseline down`;

  const dayMs = 86400000;
  const since = (d: string) => Math.floor((Date.now() - new Date(d + "T00:00:00").getTime()) / dayMs);
  const gap = since(history[history.length - 1].date);
  if (gap >= 10) return `Welcome back${who}. Pick up where you left off`;

  const thisWeek = history.filter((s) => since(s.date) < 7).length;
  if (thisWeek >= 2) return `${thisWeek} sessions this week${who}. Nice`;

  const h = new Date().getHours();
  const tod = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return name ? `${tod}, ${name}` : tod;
}

// the session in progress (new session or an edit). Per-ball taps live in `strips`;
// every tally is derived from them so the two never drift.
type AreaSetup = { dist?: number; club?: string };

type Live = {
  weekId: string; sessionLabel: string; date: string; notes: string;
  bestClub: string; startedAt: number;
  strips: Strips;
  // optional per-area setup picked while logging (target distance / club)
  setup?: Partial<Record<keyof Strips, AreaSetup>>;
  // quick session only: which areas are in play, and an optional focus (e.g. from Fixes)
  areas?: (keyof Strips)[];
  focus?: QuickFocus;
};

const STRIP_TOTAL = (s: Strips) =>
  s.driving.length + s.irons.length + s.chipping.length +
  s.pitching.length + s.putting.length;

function emptyLive(weekId: string, sessionLabel: string): Live {
  return {
    weekId, sessionLabel, date: localDate(), notes: "",
    bestClub: "", startedAt: Date.now(), strips: emptyStrips(),
  };
}

function emptyQuickLive(areas: (keyof Strips)[], focus?: QuickFocus): Live {
  return { ...emptyLive(ADHOC, "Quick session"), areas, focus };
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
    setup: s.setup ? JSON.parse(JSON.stringify(s.setup)) : undefined,
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
    setup: cleanSetup(l.setup),
    startedAt: l.startedAt,
  };
}

// drop empty area entries so a stray tap doesn't persist as {}
function cleanSetup(s: Live["setup"]): SavedSession["setup"] {
  if (!s) return undefined;
  const out: NonNullable<SavedSession["setup"]> = {};
  (Object.keys(s) as (keyof Strips)[]).forEach((a) => {
    const e = s[a];
    if (e && (e.dist != null || e.club)) out[a] = e;
  });
  return Object.keys(out).length ? out : undefined;
}

function anyLogged(l: Live) {
  return STRIP_TOTAL(l.strips) > 0 || !!l.bestClub || !!l.notes.trim();
}

// find the plan position of a saved session by weekId + label, within one
// level's plan — a session logged under a different (now-inactive) level
// correctly returns null, so the cursor simply doesn't move (callers already
// handle that gracefully, same as editing an ad-hoc/quick session today).
function locate(plan: Week[], weekId: string, label: string): { week: number; session: number } | null {
  for (let w = 0; w < plan.length; w++) {
    if (plan[w].id !== weekId) continue;
    const si = plan[w].sessions.findIndex((s) => s.label === label);
    if (si >= 0) return { week: w, session: si };
  }
  return null;
}

// A stored cursor (meta, or a restored backup) is only trusted after it's
// pulled back inside the active plan — an out-of-range week would otherwise
// crash Home on `activePlan[cursor.week].sessions`.
function clampCursor(plan: Week[], c: { week: number; session: number }): { week: number; session: number } {
  const wk = Number.isInteger(c?.week) ? c.week : 0;
  const week = Math.min(Math.max(0, wk), plan.length - 1);
  const ss = Number.isInteger(c?.session) ? c.session : 0;
  const session = Math.min(Math.max(0, ss), plan[week].sessions.length - 1);
  return { week, session };
}

const AREAS = [
  ["Chipping", "swipe_up"], ["Pitching", "arrow_outward"], ["Irons", "golf_course"],
  ["Driving", "sports_golf"], ["Putting", "adjust"],
] as const;

const QUICK_AREAS: { key: keyof Strips; name: string; icon: string }[] = [
  { key: "chipping", name: "Chipping", icon: "swipe_up" },
  { key: "pitching", name: "Pitching", icon: "arrow_outward" },
  { key: "irons", name: "Irons", icon: "golf_course" },
  { key: "driving", name: "Driving", icon: "sports_golf" },
  { key: "putting", name: "Putting", icon: "adjust" },
];

// "I've only got X today" — limits + reorders tonight's plan session instead of
// leaving it unlogged. Still the plan session: ticks the slot, keeps the drills.
const VENUES: { key: string; label: string; icon: string; areas: (keyof Strips)[] }[] = [
  { key: "full", label: "Full range", icon: "sports_golf", areas: [] },
  { key: "short", label: "Short-game area", icon: "golf_course", areas: ["chipping", "pitching", "putting"] },
  { key: "net", label: "Net or cage", icon: "grid_view", areas: ["driving", "irons"] },
  { key: "putting", label: "Putting green", icon: "adjust", areas: ["putting"] },
];
const venueByKey = (k: string) => VENUES.find((v) => v.key === k) ?? VENUES[0];

const missToArea = (m: string): keyof Strips | null =>
  m === "right" || m === "left" ? "driving" : m === "strike" ? "irons" : null;

const libAreaKey = (raw: string): keyof Strips => {
  const a = raw.toLowerCase();
  if (a.startsWith("driv")) return "driving";
  if (a.startsWith("iron")) return "irons";
  if (a.startsWith("chip")) return "chipping";
  if (a.startsWith("pitch")) return "pitching";
  return "putting";
};

function QuickPick({
  plannedMiss, onStart, onCancel,
}: {
  plannedMiss: string;
  onStart: (areas: (keyof Strips)[], focus?: QuickFocus) => void;
  onCancel: () => void;
}) {
  const seed = missToArea(plannedMiss);
  const [picked, setPicked] = useState<Set<keyof Strips>>(new Set(seed ? [seed] : []));
  const [focus, setFocus] = useState<(QuickFocus & { area: keyof Strips }) | null>(null);
  const [picker, setPicker] = useState<null | "fix" | "drill">(null);

  const toggle = (k: keyof Strips) => {
    const next = new Set(picked);
    next.has(k) ? next.delete(k) : next.add(k);
    setPicked(next);
  };
  const chooseFocus = (f: QuickFocus & { area: keyof Strips }) => {
    setFocus(f);
    setPicked((p) => new Set(p).add(f.area));
    setPicker(null);
  };

  const list = QUICK_AREAS.filter((a) => picked.has(a.key)).map((a) => a.key);
  // the fault that matches the miss the player told us about (surface it first)
  const mineFaultId =
    plannedMiss === "right" ? "slice" : plannedMiss === "left" ? "hook"
    : plannedMiss === "strike" ? "heavy-chip" : null;

  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onCancel} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="hdr-eyebrow">Quick session</div>
            <div className="hdr-title">What are you working on?</div>
            <div className="hdr-sub">Pick an area, or a fix or drill to hone in on.</div>
          </div>
        </div>
      </header>

      <div className="screen">
        {focus ? (
          <div className="quick-focus">
            <span className="icon-tile sm"><Icon name={focus.area === "driving" ? "sports_golf" : "build"} size={15} /></span>
            <span>
              <b>{focus.title}</b>
              <small>{focus.body}</small>
            </span>
            <button className="icon-btn" style={{ width: 34, height: 34 }} aria-label="Clear focus"
                    onClick={() => setFocus(null)}>
              <Icon name="close" size={17} />
            </button>
          </div>
        ) : (
          <div className="chips">
            <button className={"chip-btn" + (picker === "fix" ? " on" : "")}
                    onClick={() => setPicker(picker === "fix" ? null : "fix")}>
              <Icon name="build" size={14} /> Work on a fix
            </button>
            <button className={"chip-btn" + (picker === "drill" ? " on" : "")}
                    onClick={() => setPicker(picker === "drill" ? null : "drill")}>
              <Icon name="menu_book" size={14} /> Pick a drill
            </button>
          </div>
        )}

        {picker === "fix" && (
          <div className="focus-list">
            {[...CATALOG].sort((a, b) =>
              (b.id === mineFaultId ? 1 : 0) - (a.id === mineFaultId ? 1 : 0),
            ).map((f) => (
              <button key={f.id} className="focus-opt"
                      onClick={() => chooseFocus({
                        area: f.area as keyof Strips,
                        title: `Fix: ${f.name}`,
                        body: f.fix,
                      })}>
                <b>{f.pattern}{f.id === mineFaultId && <span className="focus-tag">your miss</span>}</b>
                <small>{f.name} · {QUICK_AREAS.find((q) => q.key === f.area)?.name}</small>
              </button>
            ))}
          </div>
        )}

        {picker === "drill" && (
          <div className="focus-list">
            {LIBRARY.flatMap((g) =>
              g.drills.map((d) => (
                <button key={g.area + d.name} className="focus-opt"
                        onClick={() => chooseFocus({
                          area: libAreaKey(g.area),
                          title: d.name,
                          body: d.why || d.how,
                        })}>
                  <b>{d.name}</b>
                  <small>{QUICK_AREAS.find((q) => q.key === libAreaKey(g.area))?.name} · {d.how}</small>
                </button>
              )),
            )}
          </div>
        )}

        <div className="area-picks">
          {QUICK_AREAS.map((a) => {
            const on = picked.has(a.key);
            return (
              <button key={a.key} className={`area-pick area-${a.key}` + (on ? " on" : "")}
                      aria-pressed={on} onClick={() => toggle(a.key)}>
                <span className="icon-tile sm"><Icon name={a.icon} size={16} /></span>
                <span>{a.name}</span>
                <Icon name={on ? "check_circle" : "radio_button_unchecked"} size={20}
                      color={on ? "var(--green)" : "var(--icon-muted)"} fill={on} />
              </button>
            );
          })}
        </div>

        <div className="grp" style={{ paddingTop: 4 }}>
          <button className="cta" disabled={!list.length}
                  onClick={() => onStart(list, focus ? { title: focus.title, body: focus.body } : undefined)}>
            <Icon name="play_arrow" size={22} fill />
            {list.length ? `Start · ${list.length} area${list.length === 1 ? "" : "s"}` : "Pick an area"}
          </button>
          <p className="app-foot" style={{ justifyContent: "center" }}>
            <Icon name="bolt" size={13} />
            Logs to your history and trends. Not a plan session.
          </p>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  const [tab, setTabNow] = useState<Tab>("home");

  // warm the split-out screens a few seconds after load, once the first
  // screen has painted, so they don't compete with it for the network
  useEffect(() => {
    const warm = () => Object.values(SCREENS).forEach((load) => load().catch(() => {}));
    const t = setTimeout(() => {
      if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 3000 });
      else warm();
    }, 3000);
    return () => clearTimeout(t);
  }, []);
  // Switching screens runs as a View Transition where the browser has it:
  // the old screen fades, the new one rises in, and elements that share a
  // view-transition-name (the session title, the nav pill) morph between
  // the two. Elsewhere, or with reduced motion, it's an instant switch.
  const setTab = useCallback((t: Tab) => {
    const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!d.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTabNow(t);
      return;
    }
    d.startViewTransition(() => { flushSync(() => setTabNow(t)); });
  }, []);
  const [trendsOpenData, setTrendsOpenData] = useState(false);
  const [goal, setGoalState] = useState<Goal | null>(null);
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [cursor, setCursor] = useState<{ week: number; session: number }>({ week: 0, session: 0 });
  const [live, setLive] = useState<Live | null>(null);
  const [editOrig, setEditOrig] = useState<SavedSession | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [onboardedAt, setOnboardedAt] = useState<string | null>(null);
  const [onb, setOnb] = useState<Onboarding | null>(null);
  const [readShots, setReadShots] = useState<Shot[]>([]);
  const [plannedMiss, setPlannedMiss] = useState<string>("");
  const [level, setLevel] = useState<Level>(DEFAULT_LEVEL);
  const [nudgeDismissedAt, setNudgeDismissedAt] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [overrides, setOverrides] = useState<DrillOverrides>({});
  const [receipt, setReceipt] = useState<
    {
      session: SavedSession; history: SavedSession[]; nextCursor: { week: number; session: number };
      planComplete: boolean; level: Level; planBalls: number;
    } | null
  >(null);
  const [rounds, setRounds] = useState<SavedRound[]>([]);
  const [swings, setSwings] = useState<SavedSwing[]>([]);
  const [round, setRound] = useState<LiveRound | null>(null);
  const [roundView, setRoundView] = useState<{ round: SavedRound; fresh: boolean } | null>(null);
  const [games, setGames] = useState<GameAttempt[]>([]);
  const toast = useToast();
  const { confirm } = useConfirm();
  const pendingVenue = useRef<(keyof Strips)[] | undefined>(undefined);
  // Editing a past session points the cursor at that session's slot so the
  // log screen shows its drills; this remembers where the plan actually was,
  // so finishing or discarding the edit puts it back.
  const cursorBeforeEdit = useRef<{ week: number; session: number } | null>(null);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setReady(true);
      try { (window as unknown as { __rcReady?: boolean }).__rcReady = true; } catch { /* noop */ }
    };
    // hard ceiling: IndexedDB can *hang* (a blocked upgrade, a wedged store) and
    // a hung promise never rejects, so try/catch alone can't save us. Show the
    // app after 4s no matter what — worst case with stale/empty state.
    const cap = setTimeout(finish, 4000);

    (async () => {
      try {
        // independent reads, issued together rather than one after another
        const [
          sessions, savedRounds, attempts, savedSwings, roundDraft, savedName, miss,
          savedLevel, nudgeAt, isDemo, savedGoal, savedOverrides, onboarded,
        ] = await Promise.all([
          allSessions(), allRounds(), allGameAttempts(), allSwings(),
          getMeta<LiveRound>("roundDraft"), getMeta<string>("name"), getMeta<string>("plannedMiss"),
          getMeta<Level>("planLevel"), getMeta<string>("nudgeDismissedAt"), getMeta<boolean>("demo"),
          getMeta<Goal>("goal"), getMeta<DrillOverrides>("drillOverrides"), getMeta<string>("onboardedAt"),
        ]);
        setHistory(sessions);
        setRounds(savedRounds);
        setGames(attempts);
        setSwings(savedSwings);
        setRound(roundDraft ?? null);
        setName(savedName ?? "");
        setPlannedMiss(miss ?? "");
        const lvl = savedLevel ?? DEFAULT_LEVEL;
        setLevel(lvl);
        setNudgeDismissedAt(nudgeAt ?? null);
        setDemo(!!isDemo);
        setGoalState(savedGoal ?? null);
        setOverrides(savedOverrides ?? {});
        const ob = onboarded ?? null;
        // "/?demo=1" (the landing page's "Look around first") on a fresh
        // install loads the sample history. Never touches real data: it only
        // fires when nothing has been set up yet.
        if (!ob && new URLSearchParams(window.location.search).get("demo") === "1") {
          await loadDemo();
          window.location.replace("/");
          return;
        }
        setOnboardedAt(ob);
        if (!ob) {
          setOnb((await getMeta<Onboarding>("onboarding")) ?? FRESH_ONB);
          setReadShots((await getMeta<ReadSession>("readSession"))?.shots ?? []);
        }
        const draft = await getMeta<Live>("draft");
        if (draft) {
          setLive(draft);
          const loc = locate(PLANS[lvl], draft.weekId, draft.sessionLabel);
          if (loc) setCursor(loc);
        } else {
          const c = await getMeta<{ week: number; session: number }>("cursor");
          if (c) setCursor(clampCursor(PLANS[lvl], c));
        }
        // set directly: a view transition here would only crossfade from the
        // splash and hold back the first real paint
        if (!ob) setTabNow("firstrun");
      } catch (e) {
        console.error("RangeCard failed to load local data:", e);
      } finally {
        clearTimeout(cap);
        finish();
      }
    })();

    return () => clearTimeout(cap);
  }, []);

  // if the splash is still up after a few seconds something is wedged
  // (usually a stale service worker after a deploy) — offer a way out
  const [bootStuck, setBootStuck] = useState(false);
  useEffect(() => {
    if (ready) return;
    const t = setTimeout(() => setBootStuck(true), 6000);
    return () => clearTimeout(t);
  }, [ready]);

  const cleanName = (n: string) => n.replace(/\s+/g, " ").trim().slice(0, 24);

  async function onbStage(s: OnbStage) {
    const next: Onboarding = { ...(onb ?? FRESH_ONB), stage: s };
    setOnb(next);
    await setMeta("onboarding", next);
  }

  async function onbReadShots(shots: Shot[]) {
    setReadShots(shots);
    await setMeta("readSession", { shots, completedAt: 0 } satisfies ReadSession);
  }

  // demo mode: load sample history and land on a full Plan screen; a reload
  // is the simplest way to pick up every store the load effect reads
  async function startDemo() {
    await loadDemo();
    window.location.reload();
  }
  async function leaveDemo() {
    const ok = await confirm({
      title: "Start your own plan?",
      body: "This clears the sample data, and anything you logged while looking around, then starts your first ten balls.",
      confirmLabel: "Clear and start",
    });
    if (!ok) return;
    await exitDemo();
    window.location.reload();
  }

  async function completeOnboarding(miss: string, chosenLevel: Level) {
    const now = new Date().toISOString();
    setPlannedMiss(miss);
    setLevel(chosenLevel);
    setOnboardedAt(now);
    setOnb(null);
    setReadShots([]);
    setCursor({ week: 0, session: 0 });
    await setMeta("plannedMiss", miss);
    await setMeta("planLevel", chosenLevel);
    await setMeta("onboardedAt", now);
    await delMeta("onboarding");
    await delMeta("readSession");
    setTab("home");
  }

  // An import can touch every store and the restored settings — reload all of
  // it, not just sessions, or imported rounds/games/swings and the restored
  // level/goal wouldn't show until the next app launch.
  async function reloadAfterImport() {
    setHistory(await allSessions());
    setRounds(await allRounds());
    setGames(await allGameAttempts());
    setSwings(await allSwings());
    setName((await getMeta<string>("name")) ?? "");
    setPlannedMiss((await getMeta<string>("plannedMiss")) ?? "");
    setGoalState((await getMeta<Goal>("goal")) ?? null);
    setOverrides((await getMeta<DrillOverrides>("drillOverrides")) ?? {});
    const lvl = (await getMeta<Level>("planLevel")) ?? DEFAULT_LEVEL;
    setLevel(lvl);
    // a session in progress keeps its own slot; otherwise follow the backup
    if (!live) {
      const c = await getMeta<{ week: number; session: number }>("cursor");
      setCursor(clampCursor(PLANS[lvl], c ?? { week: 0, session: 0 }));
    }
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

  // persist the round in progress so a reload resumes on the same hole
  useEffect(() => {
    if (round) setMeta("roundDraft", round);
  }, [round]);

  async function finishRound(r: LiveRound) {
    const editing = !!r.id;
    const rec: RoundInput = {
      id: r.id ?? uuid(),
      createdAt: r.createdAt ?? Date.now(),
      date: isDate(r.date) ? r.date : today(),
      course: r.course.trim() || undefined,
      note: r.note?.trim() || undefined,
      holes: r.holes,
      holeData: r.holeData,
    };
    await saveRound(rec);
    await delMeta("roundDraft");
    const all = await allRounds();
    setRounds(all);
    setRound(null);
    doneFx();
    setRoundView({ round: all.find((x) => x.id === rec.id) ?? (rec as SavedRound), fresh: !editing });
  }

  function editRound(r: SavedRound) {
    setRoundView(null);
    setRound({
      id: r.id,
      createdAt: r.createdAt,
      date: r.date,
      course: r.course ?? "",
      holes: r.holes,
      holeData: r.holeData.map((h) => ({ ...h })),
      note: r.note,
      current: 0,
      startedAt: r.createdAt,
    });
    setTab("round");
  }

  async function discardRound() {
    await delMeta("roundDraft");
    setRound(null);
  }

  async function removeRound(id: string) {
    await deleteRound(id);
    setRounds(await allRounds());
    if (roundView?.round.id === id) setRoundView(null);
    toast.show("Round deleted", {
      label: "Undo",
      run: async () => {
        await restoreRound(id);
        setRounds(await allRounds());
      },
    });
  }

  async function saveGame(gameId: string, score: number) {
    const rec: GameAttemptInput = {
      id: uuid(),
      gameId,
      score,
      date: today(),
      createdAt: Date.now(),
    };
    await saveGameAttempt(rec);
    setGames(await allGameAttempts());
  }

  async function removeGame(id: string) {
    await deleteGameAttempt(id);
    setGames(await allGameAttempts());
    toast.show("Run deleted", {
      label: "Undo",
      run: async () => {
        await restoreGameAttempt(id);
        setGames(await allGameAttempts());
      },
    });
  }

  const activePlan = PLANS[level];
  // defensive: every write path clamps already, but a bad cursor must never
  // be able to take the whole Home screen down
  const safe = clampCursor(activePlan, cursor);
  const week = activePlan[safe.week];
  const session = week.sessions[safe.session];
  const flatIdx = activePlan.slice(0, safe.week).reduce((n, w) => n + w.sessions.length, 0) + safe.session;
  const levelPitchFocus = PITCH_FOCUS_BY_LEVEL[level];
  const pitchFocus = levelPitchFocus[flatIdx] ?? levelPitchFocus[levelPitchFocus.length - 1];
  const isDraft = !!live && !editOrig;
  const draftHere = isDraft && live!.weekId === week.id && live!.sessionLabel === session.label;

  async function startSession(venueAreas?: (keyof Strips)[]) {
    if (isDraft) {
      if (draftHere) { setTab("session"); return; }
      const ok = await confirm({
        title: `Discard "${live!.sessionLabel}"?`,
        body: `You have an unfinished session. Starting ${session.label} will discard what you logged there.`,
        confirmLabel: "Discard & start",
        tone: "danger",
      });
      if (!ok) { resumeDraft(); return; }
    }
    pendingVenue.current = venueAreas?.length ? venueAreas : undefined;
    // fresh start — offer the warm-up once per calendar day
    const shown = await getMeta<string>("warmupShown");
    if (shown === today()) openLog();
    else setTab("warmup");
  }

  function openLog() {
    const l = emptyLive(week.id, session.label);
    if (pendingVenue.current?.length) l.areas = pendingVenue.current;
    pendingVenue.current = undefined;
    setLive(l);
    setTab("session");
  }

  async function startQuick(areas: (keyof Strips)[], focus?: QuickFocus) {
    if (isDraft) {
      const ok = await confirm({
        title: `Discard "${live!.sessionLabel}"?`,
        body: "You have an unfinished session. Starting a quick session will discard it.",
        confirmLabel: "Discard & start",
        tone: "danger",
      });
      if (!ok) { resumeDraft(); return; }
    }
    setLive(emptyQuickLive(areas, focus));
    setTab("session");
  }

  async function dismissWarmup() {
    await setMeta("warmupShown", today());
    openLog();
  }

  // "Haven't practiced in a while" nudge — dismissal is keyed to the date of
  // the session it was shown for, so it naturally reopens once that gap grows
  // again (no separate "last shown" timer to drift out of sync with reality).
  async function dismissNudge(lastSessionDate: string) {
    setNudgeDismissedAt(lastSessionDate);
    await setMeta("nudgeDismissedAt", lastSessionDate);
  }

  async function saveGoal(g: Goal) {
    setGoalState(g);
    await setMeta("goal", g);
  }
  async function clearGoal() {
    setGoalState(null);
    await delMeta("goal");
  }

  async function changeLevel(newLevel: Level) {
    if (newLevel === level) return;
    if (isDraft) {
      toast.show("Finish or discard your current session first");
      return;
    }
    const ok = await confirm({
      title: `Switch to ${LEVEL_LABEL[newLevel]}?`,
      body: `Your session history is kept, but your plan cursor resets to ${LEVEL_LABEL[newLevel]} · Week 1 · Session 1.`,
      confirmLabel: `Switch to ${LEVEL_LABEL[newLevel]}`,
    });
    if (!ok) return;
    setLevel(newLevel);
    setCursor({ week: 0, session: 0 });
    await setMeta("planLevel", newLevel);
    await setMeta("cursor", { week: 0, session: 0 });
    toast.show(`Switched to ${LEVEL_LABEL[newLevel]}`);
  }

  function resumeDraft() {
    if (!live) return;
    const loc = locate(PLANS[level], live.weekId, live.sessionLabel);
    if (loc) setCursor(loc);
    setTab("session");
  }

  function editSession(s: SavedSession) {
    if (isDraft) {
      toast.show("Finish or discard your current session first");
      return;
    }
    setEditOrig(s);
    setLive(toLive(s));
    cursorBeforeEdit.current = cursor;
    const loc = locate(PLANS[level], s.weekId, s.sessionLabel);
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
    const isAdhoc = live.weekId === ADHOC;
    const slotKeys = planSlotKeysFor(level);
    const wasComplete = slotKeys.every((k) => history.some((s) => planSlotKey(s.weekId, s.sessionLabel) === k));
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
    if (!wasEdit && !isAdhoc) {
      let w = safe.week, s = safe.session + 1;
      if (s >= activePlan[w].sessions.length) { s = 0; w = Math.min(w + 1, activePlan.length - 1); }
      nextCursor = { week: w, session: s };
      setCursor(nextCursor); await setMeta("cursor", nextCursor);
    }

    const all = await allSessions();
    const isNowComplete = slotKeys.every((k) => all.some((s) => planSlotKey(s.weekId, s.sessionLabel) === k));
    const planComplete = !wasEdit && !isAdhoc && !wasComplete && isNowComplete;
    const planBalls = planComplete
      ? all.filter((s) => slotKeys.includes(planSlotKey(s.weekId, s.sessionLabel))).reduce((n, s) => n + sessionBalls(s), 0)
      : 0;
    setHistory(all);
    setLive(null);
    setEditOrig(null);
    restoreCursorAfterEdit();
    doneFx();

    if (wasEdit) {
      setTab("trends");
      toast.show("Changes saved");
    } else {
      setReceipt({ session: all.find((x) => x.id === rec.id) ?? (rec as SavedSession), history: all, nextCursor, planComplete, level, planBalls });
      setTab("receipt");
    }
  }

  async function discard() {
    const wasEdit = !!editOrig;
    if (!wasEdit && live && anyLogged(live)) {
      const ok = await confirm({
        title: "Discard this session?",
        body: "What you logged won't be saved.",
        confirmLabel: "Discard",
        tone: "danger",
      });
      if (!ok) return;
    }
    await delMeta("draft");
    setLive(null);
    setEditOrig(null);
    restoreCursorAfterEdit();
    setTab(wasEdit ? "trends" : "home");
  }

  function restoreCursorAfterEdit() {
    if (!cursorBeforeEdit.current) return;
    setCursor(cursorBeforeEdit.current);
    cursorBeforeEdit.current = null;
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
      <div className="boot">
        <div className="boot-lockup">
          <Mark size={48} />
          <span className="boot-word">RangeCard</span>
        </div>
        {/* the five areas fill in turn while local data loads */}
        <div className="boot-bands" aria-hidden="true">
          {["chipping", "pitching", "irons", "driving", "putting"].map((a, i) => (
            <span key={a} className={`area-${a}`} style={{ "--i": i } as React.CSSProperties} />
          ))}
        </div>
        {bootStuck && (
          <div className="boot-stuck">
            <p>This is taking longer than it should.</p>
            <button className="btn-ghost" onClick={() => location.reload()}>Reload</button>
            <button className="btn-ghost" onClick={recoverBoot}>Clear cached files &amp; reload</button>
            <span className="boot-stuck-note">Your logged sessions and rounds are kept.</span>
          </div>
        )}
      </div>
    );
  }

  if (tab === "firstrun" && onb) {
    return (
      <FirstRun
        stage={onb.stage}
        onSetStage={onbStage}
        readShots={readShots}
        onReadShots={onbReadShots}
        onComplete={completeOnboarding}
        onDemo={startDemo}
      />
    );
  }

  if (tab === "welcome") {
    // post-onboarding only — the greeting taps here to edit the name
    return (
      <Welcome isEdit name={name} onDone={(n) => saveName(n)} onCancel={() => setTab("home")} />
    );
  }

  if (tab === "round" && roundView) {
    return (
      <RoundSummary
        round={roundView.round}
        fresh={roundView.fresh}
        rounds={rounds}
        onDone={() => { setRoundView(null); if (roundView.fresh) setTab("home"); }}
        onEdit={() => editRound(roundView.round)}
      />
    );
  }

  if (tab === "receipt" && receipt) {
    return (
      <SessionReceipt
        session={receipt.session}
        history={receipt.history}
        quick={receipt.session.weekId === ADHOC}
        planComplete={receipt.planComplete}
        planBalls={receipt.planBalls}
        levelLabel={LEVEL_LABEL[receipt.level]}
        nextWeek={PLANS[receipt.level][receipt.nextCursor.week]}
        nextSession={PLANS[receipt.level][receipt.nextCursor.week].sessions[receipt.nextCursor.session]}
        onDone={() => { setReceipt(null); setTab("home"); }}
        onNext={() => {
          setReceipt(null);
          if (receipt.session.weekId === ADHOC) setTab("home");
          else startSession();
        }}
      />
    );
  }

  return (
    <>
      <main id="main" className="tabview" tabIndex={-1} key={tab}>
        {tab === "home" && (
          <Home week={week} cursor={safe} setCursor={setCursor} history={history} name={name}
                activePlan={activePlan} demo={demo} onLeaveDemo={leaveDemo}
                greeting={greeting(name, history)} onEditName={() => setTab("welcome")}
                oneThing={todaysOneThing(history, rounds, plannedMiss)} monthCount={sessionsThisMonth(history)}
                onStart={startSession} onQuick={() => setTab("quickpick")}
                draftLabel={isDraft ? live!.sessionLabel : null}
                draftHere={draftHere} onResume={resumeDraft}
                nudgeDismissedAt={nudgeDismissedAt} onDismissNudge={dismissNudge} />
        )}
        {tab === "quickpick" && (
          <QuickPick plannedMiss={plannedMiss} onStart={startQuick} onCancel={() => setTab("home")} />
        )}
        {tab === "session" && live && (
          <SessionScreen week={week} session={session} pitchFocus={pitchFocus} live={live} setLive={setLive}
                         overrides={overrides} onRestoreDrill={(a) => swapDrill(a, null)}
                         editMode={!!editOrig} onFinish={finishSession} onDiscard={discard} />
        )}
        {tab === "trends" && (
          <Trends history={history} rounds={rounds} swings={swings} activePlan={activePlan} onDelete={onDelete} onEdit={editSession}
                  onBack={() => { setTab("more"); setTrendsOpenData(false); }}
                  onStart={startSession} onImported={reloadAfterImport}
                  openData={trendsOpenData}
                  goal={goal} onSaveGoal={saveGoal} onClearGoal={clearGoal} />
        )}
        {tab === "warmup" && (
          <Warmup onSkip={dismissWarmup} onReady={dismissWarmup} />
        )}
        {tab === "round" && (
          <Round
            liveRound={round}
            onChange={setRound}
            onStart={setRound}
            onFinish={finishRound}
            onDiscard={discardRound}
            rounds={rounds}
            onViewRound={(r) => setRoundView({ round: r, fresh: false })}
            onDeleteRound={removeRound}
            onPractice={(areas, focus) => startQuick(areas, focus)}
          />
        )}
        {tab === "more" && (
          <More history={history} plannedMiss={plannedMiss} overrides={overrides} onSwap={swapDrill}
                games={games} swings={swings} onSaveGame={saveGame} onDeleteGame={removeGame}
                level={level} onChangeLevel={changeLevel}
                onOpenTrends={() => setTab("trends")}
                onOpenBackup={() => { setTrendsOpenData(true); setTab("trends"); }}
                sessionDraft={isDraft ? live!.sessionLabel : null}
                onResumeSession={resumeDraft}
                hasRound={!!round}
                onResumeRound={() => setTab("round")}
                onPracticeFix={(f) => startQuick(
                  [f.area],
                  { title: `Working on: ${f.name}`, body: f.fix },
                )} />
        )}
      </main>

      <nav className="navpill">
        <button className="nav-item" aria-current={tab === "home" ? "page" : undefined} onClick={() => setTab("home")}>
          <Icon name="flag" size={22} fill={tab === "home"} /><span className="nav-lbl">Plan</span>
        </button>
        <button className="nav-item"
                aria-current={tab === "session" || tab === "warmup" || tab === "quickpick" ? "page" : undefined}
                onClick={() => (live ? setTab("session") : startSession())}>
          <span className="nav-glyph">
            <Icon name="sports_golf" size={22} fill={tab === "session" || tab === "warmup" || tab === "quickpick"} />
            {isDraft && <span className="nav-dot" />}
          </span>
          <span className="nav-lbl">Log</span>
        </button>
        <button className="nav-item" aria-current={tab === "round" ? "page" : undefined} onClick={() => setTab("round")}>
          <span className="nav-glyph">
            <Icon name="golf_course" size={22} fill={tab === "round"} />
            {round && <span className="nav-dot" />}
          </span>
          <span className="nav-lbl">Round</span>
        </button>
        <button className="nav-item" aria-current={tab === "more" || tab === "trends" ? "page" : undefined}
                onClick={() => setTab("more")}>
          <Icon name="more_horiz" size={22} fill={tab === "more" || tab === "trends"} /><span className="nav-lbl">More</span>
        </button>
      </nav>
    </>
  );
}

function More({
  history, plannedMiss, overrides, onSwap, games, swings, onSaveGame, onDeleteGame, onPracticeFix,
  level, onChangeLevel, onOpenTrends, onOpenBackup, sessionDraft, onResumeSession, hasRound, onResumeRound,
}: {
  history: SavedSession[];
  plannedMiss: string;
  overrides: DrillOverrides;
  onSwap: (area: keyof DrillOverrides, drill: DrillOverride | null) => void;
  games: GameAttempt[];
  swings: SavedSwing[];
  onSaveGame: (gameId: string, score: number) => void;
  onDeleteGame: (id: string) => void;
  onPracticeFix: (fault: import("@/lib/faults").Fault) => void;
  level: Level;
  onChangeLevel: (level: Level) => void;
  onOpenTrends: () => void;
  onOpenBackup: () => void;
  sessionDraft: string | null;
  onResumeSession: () => void;
  hasRound: boolean;
  onResumeRound: () => void;
}) {
  const [view, setView] = useState<"menu" | "prep" | "routine" | "course" | "library" | "fixes" | "games" | "swing" | "level" | "about">("menu");
  const [libFocus, setLibFocus] = useState<import("@/lib/faults").Fault | null>(null);
  if (view === "level")
    return <LevelSettings current={level} onPick={(l) => { onChangeLevel(l); setView("menu"); }} onBack={() => setView("menu")} />;
  if (view === "about") return <About onBack={() => setView("menu")} />;
  if (view === "prep") return <Prep onBack={() => setView("menu")} />;
  if (view === "routine") return <Routine onBack={() => setView("menu")} />;
  if (view === "course") return <Course onBack={() => setView("menu")} />;
  if (view === "games")
    return <Games attempts={games} onBack={() => setView("menu")} onSave={onSaveGame} onDelete={onDeleteGame} />;
  if (view === "library")
    return (
      <Library onBack={() => { setLibFocus(null); setView("menu"); }}
               history={history} plannedMiss={plannedMiss}
               overrides={overrides} onSwap={onSwap} focusFault={libFocus} />
    );
  if (view === "fixes")
    return (
      <Fixes onBack={() => setView("menu")} history={history} plannedMiss={plannedMiss} swings={swings}
             onPractice={onPracticeFix}
             onBrowseDrills={(f) => { setLibFocus(f); setView("library"); }} />
    );
  if (view === "swing") return <SwingCheck onBack={() => setView("menu")} />;
  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-title">More</div>
            <div className="hdr-sub">Everything outside the plan</div>
          </div>
        </div>
      </header>
      <div className="screen">
        {(sessionDraft || hasRound) && (
          <div className="more-resume">
            {sessionDraft && (
              <button className="draft-banner" onClick={onResumeSession}>
                <Icon name="pending_actions" size={18} />
                <span>Session in progress</span>
                <b>Resume</b>
              </button>
            )}
            {hasRound && (
              <button className="draft-banner" onClick={onResumeRound}>
                <Icon name="golf_course" size={18} />
                <span>Round in progress</span>
                <b>Resume</b>
              </button>
            )}
          </div>
        )}

        <div className="more-tiles">
          <button className="more-tile area-irons" onClick={onOpenTrends}>
            <span className="more-tile-t">Trends</span>
            <span className="more-tile-s">Your numbers, session by session</span>
          </button>
          <button className="more-tile area-pitching" onClick={() => setView("games")}>
            <span className="more-tile-t">Practice games</span>
            <span className="more-tile-s">Scored challenges to beat your best</span>
          </button>
        </div>

        <div className="more-list">
          <button className="more-row" onClick={() => setView("fixes")}>
            <span className="more-ic"><Icon name="build" size={22} color="var(--green)" /></span>
            <span className="more-txt"><b>Fixes</b><span>Your miss pattern and its first fix</span></span>
            <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
          </button>
          <button className="more-row" onClick={() => setView("routine")}>
            <span className="more-ic"><Icon name="track_changes" size={22} color="var(--green)" /></span>
            <span className="more-txt"><b>Pre-shot routine</b><span>The same steps before every shot</span></span>
            <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
          </button>
          <button className="more-row" onClick={() => setView("course")}>
            <span className="more-ic"><Icon name="map" size={22} color="var(--green)" /></span>
            <span className="more-txt"><b>Course management</b><span>Strategy for every on-course situation</span></span>
            <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
          </button>
          <button className="more-row" onClick={() => setView("prep")}>
            <span className="more-ic"><Icon name="self_improvement" size={22} color="var(--green)" /></span>
            <span className="more-txt"><b>Prep</b><span>Warm-up, setup check and session flow</span></span>
            <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
          </button>
          <button className="more-row" onClick={() => setView("library")}>
            <span className="more-ic"><Icon name="menu_book" size={22} color="var(--green)" /></span>
            <span className="more-txt"><b>Drill library</b><span>Alternate drills for every practice area</span></span>
            <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
          </button>
          <button className="more-row" onClick={() => setView("swing")}>
            <span className="more-ic"><Icon name="videocam" size={22} color="var(--green)" /></span>
            <span className="more-txt"><b>Swing check</b><span>Record a swing, see your measured positions</span></span>
            <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
          </button>
          <button className="more-row" onClick={() => setView("level")}>
            <span className="more-ic"><Icon name="military_tech" size={22} color="var(--green)" /></span>
            <span className="more-txt"><b>Training level</b><span>{LEVEL_LABEL[level]} · change which drills you see</span></span>
            <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
          </button>
          <button className="more-row" onClick={() => setView("about")}>
            <span className="more-ic"><Icon name="info" size={22} color="var(--green)" /></span>
            <span className="more-txt">
              <b>About</b><span>Version {APP_VERSION} · your data and how it works</span>
            </span>
            <Icon name="chevron_right" size={20} color="var(--icon-muted)" />
          </button>
        </div>

        <p className="app-foot">
          <Icon name="lock" size={13} />
          <span>
            Your sessions stay on this device. No account, nothing uploaded.{" "}
            <button onClick={onOpenBackup}>Back them up</button>
          </span>
        </p>
      </div>
    </>
  );
}

const LEVEL_ROWS: { key: Level; title: string; sub: string; icon: string }[] = [
  { key: "beginner", title: "Beginner", sub: "New to golf, or still building consistent contact.", icon: "eco" },
  { key: "intermediate", title: "Intermediate", sub: "You play regularly and want to sharpen one miss.", icon: "trending_up" },
  { key: "professional", title: "Professional", sub: "Low handicap, chasing consistency and scoring under pressure.", icon: "military_tech" },
];

function LevelSettings({
  current, onPick, onBack,
}: {
  current: Level;
  onPick: (level: Level) => void;
  onBack: () => void;
}) {
  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="hdr-title">Training level</div>
            <div className="hdr-sub">Change anytime — your session history is kept</div>
          </div>
        </div>
      </header>
      <div className="sheet">
        <div className="miss-list">
          {LEVEL_ROWS.map((l) => (
            <button
              key={l.key}
              className={"miss-row" + (l.key === current ? " on" : "")}
              onClick={() => onPick(l.key)}
            >
              <span>
                <b>{l.title}{l.key === current && <span className="focus-tag">current</span>}</b>
                <small>{l.sub}</small>
              </span>
              <Icon name={l.key === current ? "check_circle" : l.icon} size={24} color={l.key === current ? "var(--green)" : "var(--icon-muted)"} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Home({
  week, cursor, setCursor, history, name, greeting, onEditName, oneThing, monthCount,
  activePlan, onStart, onQuick, draftLabel, draftHere, onResume, nudgeDismissedAt, onDismissNudge,
  demo, onLeaveDemo,
}: {
  demo: boolean;
  onLeaveDemo: () => void;
  week: Week;
  cursor: { week: number; session: number };
  setCursor: (c: { week: number; session: number }) => void;
  history: SavedSession[];
  name: string;
  greeting: string;
  onEditName: () => void;
  oneThing: import("@/lib/verdict").OneThing | null;
  monthCount: number;
  activePlan: Week[];
  onStart: (venueAreas?: (keyof Strips)[]) => void;
  onQuick: () => void;
  draftLabel: string | null;
  draftHere: boolean;
  onResume: () => void;
  nudgeDismissedAt: string | null;
  onDismissNudge: (lastSessionDate: string) => void;
}) {
  const flat = activePlan.flatMap((w, wi) =>
    w.sessions.map((s, si) => ({ wi, si, id: w.id, label: s.label, test: /test/i.test(s.label) }))
  );
  const curIdx = flat.findIndex((f) => f.wi === cursor.week && f.si === cursor.session);
  const loggedSlots = new Set(history.map((s) => `${s.weekId}|${s.sessionLabel}`));
  const loggedCount = flat.filter((f) => loggedSlots.has(`${f.id}|${f.label}`)).length;
  const done = history.length;
  // solid-rate tile ignores quick sessions that logged no tee/iron shots
  const strikeHist = history.filter(
    (s) => s.driving.fairway + s.driving.left + s.driving.right + s.irons.solid + s.irons.fat + s.irons.thin > 0,
  );
  const lastSolid = strikeHist.length ? solidPct(strikeHist[strikeHist.length - 1]) : null;
  const solidDelta = strikeHist.length >= 2
    ? solidPct(strikeHist[strikeHist.length - 1]) - solidPct(strikeHist[strikeHist.length - 2])
    : null;
  const donePct = Math.min(100, Math.round((loggedCount / flat.length) * 100));
  const firstRun = done === 0;
  const [venue, setVenue] = useState("full");
  const v = venueByKey(venue);

  // "Haven't practiced in a while" nudge — only once there's a real gap, never
  // stacked with the unfinished-session banner, and silenced per-gap (not
  // per-day) once dismissed so it doesn't nag again until that gap reopens.
  const lastSession = history.length ? history[history.length - 1] : null;
  const daysSinceLast = lastSession
    ? Math.floor((Date.now() - new Date(lastSession.date + "T00:00:00").getTime()) / 86_400_000)
    : null;
  const showResumeBanner = !!draftLabel && !draftHere;
  const showNudge =
    !firstRun && !demo && !showResumeBanner && !!lastSession &&
    daysSinceLast !== null && daysSinceLast >= 5 && nudgeDismissedAt !== lastSession.date;

  return (
    <div className="plan-screen">
      <div className="plan-top">
        {!firstRun ? (
          <button className="plan-greet" onClick={onEditName} aria-label="Edit your name">
            <span>{greeting}</span><Icon name="edit" size={13} />
          </button>
        ) : <span />}
        <div className="plan-top-actions">
          <GlareToggle />
          <ThemeToggle />
        </div>
      </div>

      {demo && (
        <div className="plan-demo" role="status">
          <span>You&apos;re looking at sample data</span>
          <button onClick={onLeaveDemo}>Start my own</button>
        </div>
      )}

      {showResumeBanner && (
        <button className="plan-banner" onClick={onResume}>
          <Icon name="pending_actions" size={19} />
          <span>Unfinished · {draftLabel}</span>
          <b>Resume</b>
        </button>
      )}

      {showNudge && lastSession && (
        <div className="plan-banner-row">
          <button className="plan-banner" onClick={() => onStart()}>
            <Icon name="event_busy" size={19} />
            <span>{daysSinceLast} days since your last session</span>
            <b>Start</b>
          </button>
          <button className="plan-banner-x" aria-label="Dismiss reminder" onClick={() => onDismissNudge(lastSession.date)}>
            <Icon name="close" size={18} />
          </button>
        </div>
      )}

      <section className="plan-hero" aria-label="Your next session">
        <div className="plan-hero-text">
          <span className="kicker plan-hero-kicker">
            {firstRun
              ? "Session one · your baseline"
              : `Week ${cursor.week + 1} · Session ${cursor.session + 1} of ${week.sessions.length}`}
          </span>
          <h1 className="display-xl plan-hero-title">
            {firstRun ? (name ? `Welcome, ${name}.` : "Welcome.") : week.title}
          </h1>
          <p className="plan-hero-p">
            {firstRun
              ? "One honest pass through all five areas, about ten balls each. No targets today, just where your game is."
              : week.focus}
          </p>
        </div>

        {/* the whole plan as one strip; each slot jumps the cursor there */}
        <div className="plan-slots" role="group" aria-label={`Plan: ${loggedCount} of ${flat.length} sessions logged`}>
          {flat.map((f, i) => {
            const isDone = loggedSlots.has(`${f.id}|${f.label}`);
            const isCur = i === curIdx;
            return (
              <button key={f.id + f.si}
                      className={"plan-slot" + (isDone ? " done" : "") + (isCur ? " cur" : "")}
                      aria-pressed={isCur}
                      aria-label={`Week ${f.wi + 1}, ${f.test ? "test day" : `session ${f.si + 1}`}${isDone ? ", logged" : ""}`}
                      onClick={() => setCursor({ week: f.wi, session: f.si })}>
                <span>W{f.wi + 1}</span>
                <span>{f.test ? "Test" : `S${f.si + 1}`}</span>
              </button>
            );
          })}
        </div>
        <div className="plan-slots-foot">
          <span>{loggedCount} of {flat.length} logged</span>
          <span>{donePct}%</span>
        </div>

        <div className="plan-start-row">
          <button className="plan-start" onClick={() => onStart(v.areas)}>
            <Icon name="play_arrow" size={22} fill />
            {draftHere ? "Resume session" : venue === "full" ? "Start session" : `Start · ${v.label}`}
          </button>
          <button className="plan-quick" onClick={onQuick} aria-label="Quick session, just a few balls">
            <Icon name="bolt" size={22} />
          </button>
        </div>

        {!draftHere && (
          <details className="venue plan-venue">
            <summary>
              <Icon name="place" size={16} />
              {venue === "full" ? "Somewhere smaller today?" : v.label}
              <Icon name="expand_more" size={18} className="venue-chev" />
            </summary>
            <div className="venue-opts">
              {VENUES.map((opt) => (
                <button
                  key={opt.key}
                  className={"venue-opt" + (opt.key === venue ? " on" : "")}
                  aria-pressed={opt.key === venue}
                  onClick={() => setVenue(opt.key)}
                >
                  <Icon name={opt.icon} size={17} />
                  <span>{opt.label}</span>
                  <small>{opt.areas.length ? `${opt.areas.length} area${opt.areas.length === 1 ? "" : "s"}` : "all 5"}</small>
                </button>
              ))}
            </div>
          </details>
        )}
      </section>

      {oneThing && (
        <section className="plan-onething area-putting" aria-label="Your one thing today">
          <span className="kicker">Your one thing today</span>
          <p className="plan-onething-title">{oneThing.title}</p>
          <p className="plan-onething-body">{oneThing.body}</p>
          <span className="plan-onething-src">{oneThing.source}</span>
        </section>
      )}

      {!firstRun && (
        <div className="plan-stats">
          <div className="plan-stat">
            <span className="plan-stat-val num">
              {lastSolid === null ? "–" : <>{lastSolid}<small>%</small></>}
            </span>
            <span className="plan-stat-lbl">
              solid strike{solidDelta ? `, ${solidDelta > 0 ? "up" : "down"} ${Math.abs(solidDelta)}` : ""}
            </span>
          </div>
          <div className="plan-stat">
            <span className="plan-stat-val num">{loggedCount}<small>/{flat.length}</small></span>
            <span className="plan-stat-lbl">plan sessions logged</span>
          </div>
          <div className="plan-stat">
            <span className="plan-stat-val num">{monthCount}</span>
            <span className="plan-stat-lbl">{monthCount === 1 ? "session" : "sessions"} this month</span>
          </div>
        </div>
      )}
    </div>
  );
}

type AreaKey = "chipping" | "irons" | "driving" | "pitching" | "putting";
type Tone = "good" | "sand" | "clay";
type StepDef = {
  id: string; area: AreaKey; name: string; icon: string; drillIcon: string; target: number;
  // how the area's success rate reads: the big number's caption ("struck
  // solid") and the short form on a folded band ("7/10 solid")
  metric: string; short: string;
  outcomes: { key: string; tone: Tone; icon: string; label: string; hint: string }[];
  distUnit?: "yd" | "ft"; dists?: number[]; clubs?: string[];
};

const STEPS: StepDef[] = [
  { id: "chip", area: "chipping", name: "Chipping", icon: "swipe_up", drillIcon: "crop_square", target: 10,
    metric: "on the towel", short: "on",
    outcomes: [
      { key: "on", tone: "good", icon: "check", label: "On towel", hint: "landed on it" },
      { key: "off", tone: "clay", icon: "close", label: "Off towel", hint: "missed the mark" },
    ] },
  { id: "pitch", area: "pitching", name: "Pitching", icon: "arrow_outward", drillIcon: "flag", target: 10,
    metric: "finished close", short: "close",
    distUnit: "yd", dists: [35, 45, 55, 65], clubs: ["54°", "56°", "58°", "60°"],
    outcomes: [
      { key: "close", tone: "good", icon: "check", label: "Close", hint: "inside ~3 steps" },
      { key: "short", tone: "sand", icon: "arrow_downward", label: "Short", hint: "front edge" },
      { key: "long", tone: "clay", icon: "arrow_upward", label: "Long", hint: "carried past" },
    ] },
  { id: "iron", area: "irons", name: "Irons", icon: "golf_course", drillIcon: "stacked_line_chart", target: 9,
    metric: "struck solid", short: "solid",
    clubs: ["6i", "7i", "8i", "9i"],
    outcomes: [
      { key: "solid", tone: "good", icon: "check", label: "Solid", hint: "flush contact" },
      { key: "fat", tone: "sand", icon: "south_east", label: "Fat", hint: "ground first" },
      { key: "thin", tone: "clay", icon: "north_east", label: "Thin", hint: "caught it low" },
    ] },
  { id: "drive", area: "driving", name: "Driving", icon: "sports_golf", drillIcon: "near_me", target: 10,
    metric: "started on line", short: "on line",
    clubs: ["Driver", "3W", "5W", "Iron"],
    outcomes: [
      { key: "fairway", tone: "good", icon: "check", label: "On line", hint: "started at target" },
      { key: "left", tone: "sand", icon: "west", label: "Left", hint: "pulled / hooked" },
      { key: "right", tone: "clay", icon: "east", label: "Right", hint: "pushed / sliced" },
    ] },
  { id: "putt", area: "putting", name: "Putting", icon: "adjust", drillIcon: "door_sliding", target: 10,
    metric: "holed", short: "holed",
    distUnit: "ft", dists: [3, 6, 10, 20],
    outcomes: [
      { key: "in", tone: "good", icon: "golf_course", label: "In", hint: "holed / through the gate" },
      { key: "out", tone: "clay", icon: "close", label: "Out", hint: "missed" },
    ] },
];

function liveNote(area: AreaKey, strip: string[]): string {
  const n = strip.length;
  if (n < 3) return "The pattern tells you more than the total. Keep going.";
  const c = (k: string) => strip.reduce((a, x) => (x === k ? a + 1 : a), 0);
  const good = area === "driving" ? "fairway" : area === "irons" ? "solid"
    : area === "chipping" ? "on" : area === "pitching" ? "close" : "in";
  const goodRate = c(good) / n;
  if (area === "driving") {
    if (c("right") >= c("left") + 2) return "Leaking right. Set your feet left and let it be.";
    if (c("left") >= c("right") + 2) return "Pulling left. Your shoulders are probably closed at address.";
    if (goodRate >= 0.7) return "Best start-line run of the day. Change nothing.";
    return "Misses go both ways, so it's timing, not aim.";
  }
  if (area === "irons") {
    if (c("fat") >= c("thin") + 2) return "Heavy contact. Feel the low point ahead of the ball.";
    if (c("thin") >= c("fat") + 2) return "Thin. You're standing up out of it, so chest stays down.";
    if (goodRate >= 0.7) return "Flushing it. Same swing, next ball.";
    return "Contact is mixed. Settle your tempo before the next one.";
  }
  if (area === "chipping") {
    if (goodRate >= 0.6) return "Landing zone dialled. Trust it.";
    return "Short of the towel? Commit to a firmer, shorter stroke.";
  }
  if (area === "pitching") {
    if (c("short") >= c("long") + 2) return "Coming up short. Take one more club-length of backswing.";
    if (c("long") >= c("short") + 2) return "Flying it long. Quieten the hit through impact.";
    if (goodRate >= 0.6) return "Distance control is there today.";
    return "Distances scattered. Pick one number and groove it.";
  }
  if (goodRate >= 0.7) return "Stroke's holding. Keep the same routine.";
  return "Misses creeping in. Slow the takeaway on the next few.";
}

function SessionScreen({
  week, session, pitchFocus, live, setLive, overrides, onRestoreDrill, editMode, onFinish, onDiscard,
}: {
  week: Week; session: Session;
  pitchFocus: { name: string; how: string; sticks: string | null; video?: string };
  live: Live;
  setLive: (l: Live) => void;
  overrides: DrillOverrides;
  onRestoreDrill: (area: AreaKey) => void;
  editMode: boolean;
  onFinish: () => void;
  onDiscard: () => void;
}) {
  const areaFilter = live.areas;
  const isQuick = live.weekId === ADHOC;                 // truly ad-hoc: no drills, no flow strip
  const venueLimited = !isQuick && !!areaFilter?.length; // a plan session at a smaller venue
  const steps = areaFilter?.length
    ? areaFilter.map((a) => STEPS.find((s) => s.area === a)).filter((s): s is StepDef => !!s)
    : STEPS;

  // one area open at a time — the "active" area; the rest stay collapsed
  const [openId, setOpenId] = useState<string | null>(() => steps[0]?.id ?? null);
  const set = (patch: Partial<Live>) => setLive({ ...live, ...patch });
  const toggle = (k: string) => setOpenId((cur) => (cur === k ? null : k));

  const setupFor = (a: AreaKey): AreaSetup => live.setup?.[a] ?? {};
  const setSetup = (a: AreaKey, patch: AreaSetup) => {
    tapFx();
    set({ setup: { ...live.setup, [a]: { ...setupFor(a), ...patch } } });
  };

  // collapse the current area and open the next one (or drop to the finish
  // section when it's the last), scrolling it into view
  const advance = (fromId: string) => {
    const idx = steps.findIndex((s) => s.id === fromId);
    const next = steps[idx + 1];
    if (next) {
      setOpenId(next.id);
      requestAnimationFrame(() =>
        document.querySelector(`[data-block="${next.id}"]`)?.scrollIntoView({ block: "start", behavior: "smooth" }),
      );
    } else {
      setOpenId(null);
      requestAnimationFrame(() =>
        document.querySelector(".session-finish")?.scrollIntoView({ block: "center", behavior: "smooth" }),
      );
    }
  };

  const push = (area: AreaKey, key: string, from?: HTMLElement) => {
    const arr = live.strips[area];
    if (arr.length >= 60) return;
    set({ strips: { ...live.strips, [area]: [...arr, key] } });
    // after the commit, the new ball's dot exists: fly a ball into it
    const step = steps.find((s) => s.area === area);
    if (from && step) {
      const idx = arr.length + 1;
      requestAnimationFrame(() => requestAnimationFrame(() =>
        flyBall(from, document.querySelector(`[data-block="${step.id}"] .band-dot:nth-child(${idx})`)),
      ));
    }
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
  const logged = steps.filter((s) => areaLogged(s.area)).length;
  const total = steps.length;
  const canFinish = editMode || logged > 0;
  const totalBalls = steps.reduce((n, s) => n + live.strips[s.area].length, 0);

  const drillFor = (step: StepDef): { line: string; cards: { how: string; name?: string; video?: string }[]; sticks: string[]; swapped?: boolean } => {
    const ov = editMode ? undefined : overrides[step.area];
    if (ov) {
      return step.area === "pitching"
        ? { line: PITCHING_DRILL, cards: [{ how: ov.how, name: ov.name, video: ov.video }], sticks: [], swapped: true }
        : { line: ov.name, cards: [{ how: ov.how, video: ov.video }], sticks: [], swapped: true };
    }
    if (step.area === "chipping") return { line: session.chip.name, cards: [{ how: session.chip.how, video: session.chip.video }], sticks: session.chip.sticks ? [session.chip.sticks] : [] };
    if (step.area === "irons") return { line: session.iron.name, cards: [{ how: session.iron.how, video: session.iron.video }], sticks: session.iron.sticks ? [session.iron.sticks] : [] };
    if (step.area === "driving") return { line: session.drive.name, cards: [{ how: session.drive.how, video: session.drive.video }], sticks: session.drive.sticks ? [session.drive.sticks] : [] };
    if (step.area === "pitching") return { line: PITCHING_DRILL, cards: [{ how: pitchFocus.how, name: pitchFocus.name, video: pitchFocus.video }], sticks: pitchFocus.sticks ? [pitchFocus.sticks] : [] };
    return {
      line: session.putts[0]?.name ?? "",
      cards: session.putts.map((p) => ({ how: p.how, video: p.video })),
      sticks: session.putts.map((p) => p.sticks).filter((x): x is string => !!x),
    };
  };

  return (
    <>
      <header className="log-hdr">
        <div className="log-hdr-row">
          <div className="log-hdr-text">
            <span className="kicker">
              {editMode ? "Editing · " : ""}
              {isQuick
                ? `${total} area${total === 1 ? "" : "s"} · as many balls as you like`
                : `${week.short} · ${session.label.replace(/ —.*/, "")}${venueLimited ? ` · ${total} of 5 areas` : ""}`}
            </span>
            <h1 className="display-xl">{isQuick ? "Quick session" : week.title}</h1>
          </div>
          <div className="log-hdr-side">
            <GlareToggle />
            <span className="log-balls">
              <b className="num" key={totalBalls}>{totalBalls}</b>
              <span>{totalBalls === 1 ? "ball" : "balls"}</span>
            </span>
          </div>
        </div>
        <div className="area-progress" role="img"
             aria-label={`${logged} of ${total} areas logged, ${totalBalls} balls`}
             style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
          {steps.map((s) => (
            <span key={s.id} className={`area-progress-seg area-${s.area}`}>
              <i style={{ width: `${Math.min(100, (live.strips[s.area].length / s.target) * 100)}%` }} />
            </span>
          ))}
        </div>
      </header>

      <div className="screen log">
        {isQuick && live.focus && (
          <div className="quick-focus">
            <span className="icon-tile sm"><Icon name="build" size={15} /></span>
            <span>
              <b>{live.focus.title}</b>
              <small>{live.focus.body}</small>
            </span>
          </div>
        )}

        {!isQuick && (
          <details className="flowstrip">
            <summary>
              <Icon name="checklist" size={16} />Session flow
              <Icon name="expand_more" size={18} className="flowstrip-chev" />
            </summary>
            <ol className="flow-list">
              {SESSION_FLOW.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </details>
        )}

        <div className="bands">
        {steps.map((step, stepIdx) => {
          const strip = live.strips[step.area];
          const done = areaLogged(step.area);
          const d = drillFor(step);
          const good = step.outcomes[0].key;
          const goodN = strip.reduce((a, x) => (x === good ? a + 1 : a), 0);
          const goodPct = strip.length ? Math.round((goodN / strip.length) * 100) : null;
          const nextStep = steps[stepIdx + 1];
          const isOpen = openId === step.id;
          const summary = strip.length
            ? `${goodN}/${strip.length} ${step.short}`
            : done ? "Club noted" : isOpen ? "" : "Not started";
          return (
            <Block key={step.id} id={step.id} name={step.name} area={step.area} index={stepIdx}
                   summary={summary} full={strip.length >= step.target}
                   open={isOpen} toggle={() => toggle(step.id)}>
              {!isQuick && (
                <p className="band-drill">{d.line}</p>
              )}
              {!isQuick && d.swapped && (
                <div className="drswap">
                  <Icon name="swap_horiz" size={13} />
                  <span>Swapped in from the Library</span>
                  <button onClick={() => onRestoreDrill(step.area)}>Restore planned</button>
                </div>
              )}

              {step.dists && (() => {
                const cur = setupFor(step.area).dist;
                return (
                  <div className="setup-row">
                    <div className="rgrp-lbl">
                      Target distance{cur != null && <span className="setup-sel"> · {cur} {step.distUnit}</span>}
                    </div>
                    <div className="chips">
                      {step.dists!.map((v) => (
                        <button key={v} className={"chip-btn" + (cur === v ? " on" : "")}
                                aria-pressed={cur === v}
                                onClick={() => setSetup(step.area, { dist: cur === v ? undefined : v })}>
                          {v} {step.distUnit}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {step.clubs && (() => {
                const cur = setupFor(step.area).club;
                return (
                  <div className="setup-row">
                    <div className="rgrp-lbl">
                      Club{cur && <span className="setup-sel"> · {cur}</span>}
                    </div>
                    <div className="chips">
                      {step.clubs!.map((v) => (
                        <button key={v} className={"chip-btn" + (cur === v ? " on" : "")}
                                aria-pressed={cur === v}
                                onClick={() => setSetup(step.area, { club: cur === v ? undefined : v })}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

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

              <div className="band-hero">
                <BandPct value={goodPct} />
                <span className="band-pct-side">
                  <b>{step.metric}</b>
                  <span>{strip.length ? `${goodN} of ${strip.length} ${strip.length === 1 ? "ball" : "balls"}` : "No balls yet"}</span>
                </span>
              </div>

              {/* one dot per ball: filled = the good outcome, ringed letter = a
                  miss (F/T, L/R, S/L…), faint = still to hit */}
              <div className="band-dots" role="img"
                   style={{ gridTemplateColumns: `repeat(${step.target}, minmax(0, 1fr))` }}
                   aria-label={`${strip.length} balls logged, ${goodN} ${step.short}`}>
                {Array.from({ length: Math.max(step.target, strip.length) }).map((_, i) => {
                  const k = strip[i];
                  const o = step.outcomes.find((x) => x.key === k);
                  const cls = !o ? "" : o.key === good ? " good" : " miss";
                  return (
                    <span key={i} className={"band-dot" + cls}>
                      {o && o.key !== good ? o.label[0] : ""}
                    </span>
                  );
                })}
              </div>

              {step.area === "driving" && <DispersionFan strip={strip} />}

              <div className="outcomes">
                {step.outcomes.map((o) => (
                  <Outcome key={o.key} tone={o.tone} icon={o.icon} label={o.label} hint={o.hint}
                           count={strip.reduce((a, x) => (x === o.key ? a + 1 : a), 0)}
                           onInc={(from) => push(step.area, o.key, from)}
                           onDec={() => popType(step.area, o.key)} />
                ))}
              </div>

              <div className="band-actions">
                <button className="band-ghost" onClick={() => popLast(step.area)} disabled={!strip.length}>
                  <Icon name="undo" size={18} />Undo last
                </button>
                <span className="band-ball num">
                  {strip.length >= step.target ? `All ${step.target} logged` : `Ball ${strip.length + 1} of ${step.target}`}
                </span>
                <VoiceLogButton outcomes={step.outcomes} onMatch={(key) => push(step.area, key)} />
              </div>

              {strip.length >= 3 && (
                <p className="band-note">{liveNote(step.area, strip)}</p>
              )}

              {!isQuick && d.cards.map((c, i) => <DrillCard key={i} how={c.how} name={c.name} video={c.video} />)}
              {!isQuick && d.sticks.map((s, i) => <Stick key={i} text={s} />)}

              <button className="block-continue" onClick={() => advance(step.id)}>
                {nextStep
                  ? <>{strip.length ? "Done" : "Skip"} · next: {nextStep.name}<Icon name="arrow_forward" size={19} /></>
                  : <>{strip.length ? "Done" : "Skip"} · review &amp; finish<Icon name="south" size={19} /></>}
              </button>
            </Block>
          );
        })}
        </div>

        <div className="grp session-finish" style={{ paddingTop: 8 }}>
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

// One practice area as a colour band. Folded, it's just the area name and its
// score; open, it holds the whole logging surface. Bands overlap their
// neighbour slightly (see .bands in globals.css) so the session reads as a
// stack, top to bottom in session order.
function Block({
  id, name, area, summary, full, open, toggle, index, children,
}: {
  id: string; name: string; area: AreaKey; summary: string; full: boolean;
  open: boolean; toggle: () => void; index: number; children: React.ReactNode;
}) {
  // The body stays mounted so it can animate open and shut (a grid-rows
  // transition in globals.css); while shut it is inert, so it's out of the
  // tab order and hidden from screen readers exactly as if unmounted.
  return (
    <section className={`band area-${area}${open ? " open" : ""}`} data-block={id} aria-label={name}
             style={{ "--i": index } as React.CSSProperties}>
      <button className="band-head" onClick={toggle} aria-expanded={open}>
        <span className="band-title">{name}</span>
        <span className="band-summary">
          {summary && <span>{summary}</span>}
          {full && <Icon name="check_circle" size={20} />}
        </span>
      </button>
      <div className="band-body-wrap" inert={!open}>
        <div className="band-body-clip">
          <div className="band-body">{children}</div>
        </div>
      </div>
    </section>
  );
}

// the success rate counts to its new value as each ball is logged
function BandPct({ value }: { value: number | null }) {
  const shown = useCountUp(value ?? 0, 420);
  return (
    <span className="band-pct num" aria-label={value === null ? "no balls yet" : `${value}%`}>
      {value === null ? "–" : shown}{value !== null && <small>%</small>}
    </span>
  );
}

// A ball flies in an arc from the tapped outcome button into its dot in the
// shot strip; the dot itself is hidden until the ball lands on it.
function flyBall(from: HTMLElement, to: Element | null) {
  if (!(to instanceof HTMLElement)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const size = b.width;
  const band = from.closest(".band");
  const color = band ? getComputedStyle(band).getPropertyValue("--on-band").trim() || "#fff" : "#fff";
  const x0 = a.left + a.width / 2 - size / 2, y0 = a.top + a.height / 2 - size / 2;
  const dx = b.left - x0, dy = b.top - y0;
  const ball = document.createElement("div");
  ball.className = "fly-ball";
  Object.assign(ball.style, { left: `${x0}px`, top: `${y0}px`, width: `${size}px`, height: `${size}px`, background: color });
  document.body.appendChild(ball);
  to.style.visibility = "hidden";
  const lift = Math.min(90, Math.abs(dy) * 0.45 + 30);
  ball.animate([
    { transform: "translate(0, 0) scale(1.5)", opacity: 0.85 },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - lift}px) scale(1.15)`, opacity: 1, offset: 0.55 },
    { transform: `translate(${dx}px, ${dy}px) scale(1)`, opacity: 1 },
  ], { duration: 460, easing: "cubic-bezier(.33,.66,.4,1)" }).finished
    .catch(() => {})
    .finally(() => { ball.remove(); to.style.visibility = ""; });
}

function DrillCard({ how, name, video }: { how: string; name?: string; video?: string }) {
  return (
    <div className="drill">
      <div className="drill-t"><Icon name="bolt" size={18} color="var(--green)" />{name ?? "Focus drill"}</div>
      <div className="drill-b">{how}</div>
      {video && (
        <a className="drill-video" href={video} target="_blank" rel="noopener noreferrer">
          <Icon name="smart_display" size={16} />Watch on YouTube
        </a>
      )}
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
