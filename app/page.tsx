"use client";

import { useEffect, useState } from "react";
import { PLAN, Week, Session } from "@/lib/plan";
import { Outcome } from "@/components/Outcome";
import { Icon } from "@/components/Icon";
import { Trends } from "@/components/Trends";
import {
  SavedSession, saveSession, allSessions, deleteSession, uuid, getMeta, setMeta,
} from "@/lib/db";
import { solidPct } from "@/lib/stats";

type Tab = "home" | "session" | "trends";

// live counters for the session in progress
type Live = {
  weekId: string; sessionLabel: string; date: string; notes: string;
  fairway: number; left: number; right: number;
  solid: number; fat: number; thin: number;
  bestClub: string; on: number; off: number;
  in: number; out: number;
};

function emptyLive(weekId: string, sessionLabel: string): Live {
  return {
    weekId, sessionLabel, date: new Date().toISOString().slice(0, 10), notes: "",
    fairway: 0, left: 0, right: 0, solid: 0, fat: 0, thin: 0,
    bestClub: "", on: 0, off: 0, in: 0, out: 0,
  };
}

const AREAS = [
  ["Driving", "sports_golf"], ["Irons", "golf_course"],
  ["Chipping", "swipe_up"], ["Putting", "adjust"],
] as const;

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [history, setHistory] = useState<SavedSession[]>([]);
  const [cursor, setCursor] = useState<{ week: number; session: number }>({ week: 0, session: 0 });
  const [live, setLive] = useState<Live | null>(null);

  useEffect(() => {
    allSessions().then(setHistory);
    getMeta<{ week: number; session: number }>("cursor").then((c) => c && setCursor(c));
  }, []);

  const week = PLAN[cursor.week];
  const session = week.sessions[cursor.session];

  function startSession() {
    setLive((l) => l ?? emptyLive(week.id, session.label));
    setTab("session");
  }

  async function finishSession() {
    if (!live) return;
    const rec: SavedSession = {
      id: uuid(), weekId: live.weekId, sessionLabel: live.sessionLabel,
      date: live.date, notes: live.notes,
      driving: { fairway: live.fairway, left: live.left, right: live.right },
      irons: { solid: live.solid, fat: live.fat, thin: live.thin },
      chipping: { bestClub: live.bestClub, on: live.on, off: live.off },
      putting: { in: live.in, out: live.out },
      createdAt: Date.now(),
    };
    await saveSession(rec);
    // advance cursor to the next session
    let w = cursor.week, s = cursor.session + 1;
    if (s >= PLAN[w].sessions.length) { s = 0; w = Math.min(w + 1, PLAN.length - 1); }
    const nc = { week: w, session: s };
    setCursor(nc); await setMeta("cursor", nc);
    setHistory(await allSessions());
    setLive(null);
    setTab("home");
  }

  async function onDelete(id: string) {
    await deleteSession(id);
    setHistory(await allSessions());
  }

  return (
    <>
      {tab === "home" && (
        <Home week={week} session={session} cursor={cursor} setCursor={setCursor}
              history={history} onStart={startSession} />
      )}
      {tab === "session" && live && (
        <SessionScreen week={week} session={session} live={live} setLive={setLive} onFinish={finishSession} />
      )}
      {tab === "trends" && (
        <Trends history={history} onDelete={onDelete} onStart={startSession} />
      )}

      <nav className="nav">
        <button className={`nav-item${tab === "home" ? " active" : ""}`} onClick={() => setTab("home")}>
          <Icon name="flag" size={24} fill={tab === "home"} />Plan
        </button>
        <button className={`nav-item${tab === "session" ? " active" : ""}`}
                onClick={() => (live ? setTab("session") : startSession())}>
          <Icon name="sports_golf" size={24} fill={tab === "session"} />Log
        </button>
        <button className={`nav-item${tab === "trends" ? " active" : ""}`} onClick={() => setTab("trends")}>
          <Icon name="show_chart" size={24} fill={tab === "trends"} />Trends
        </button>
      </nav>
    </>
  );
}

function Home({
  week, cursor, setCursor, history, onStart,
}: {
  week: Week; session: Session;
  cursor: { week: number; session: number };
  setCursor: (c: { week: number; session: number }) => void;
  history: SavedSession[];
  onStart: () => void;
}) {
  const flat = PLAN.flatMap((w, wi) =>
    w.sessions.map((s, si) => ({ wi, si, id: w.id, test: /test/i.test(s.label) }))
  );
  const curIdx = flat.findIndex((f) => f.wi === cursor.week && f.si === cursor.session);
  const done = history.length;
  const lastSolid = history.length ? solidPct(history[history.length - 1]) : null;

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-title">Week {cursor.week + 1} · {week.title}</div>
            <div className="hdr-sub">Session {cursor.session + 1} of {week.sessions.length}</div>
          </div>
          <button className="icon-btn" aria-label="Plan overview"><Icon name="golf_course" size={22} /></button>
        </div>
      </header>

      <div className="screen">
        <div className="tiles">
          <div className="tile">
            <Icon name="event_available" size={20} color="var(--icon-muted)" />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="tile-val num">{done}</div>
              <div className="tile-lbl">sessions logged</div>
            </div>
          </div>
          <div className="tile">
            <Icon name="trending_up" size={20} color="var(--green)" />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="tile-val num" style={{ color: "var(--green)" }}>
                {lastSolid === null ? "—" : <>{lastSolid}<span className="u">%</span></>}
              </div>
              <div className="tile-lbl">last solid rate</div>
            </div>
          </div>
        </div>

        <div className="focuscard">
          <div className="lbl"><Icon name="target" size={17} color="var(--green)" />This week&apos;s focus</div>
          <div className="body">{week.focus}</div>
        </div>

        <div className="grp">
          <div className="grp-lbl">Jump to a session</div>
          <div className="sgrid">
            {flat.map((f, i) => {
              const cls = i < curIdx ? "past" : i === curIdx ? "cur" : "";
              return (
                <button key={f.id + f.si} className={`spill ${cls}`}
                        onClick={() => setCursor({ week: f.wi, session: f.si })}>
                  <span>W{f.wi + 1}</span>
                  <span className={`s${f.test ? " test" : ""}`}>{f.test ? "Test" : `S${f.si + 1}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grp" style={{ paddingTop: 4 }}>
          <button className="cta" onClick={onStart}>
            <Icon name="play_arrow" size={22} fill />Start this session
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
  week, session, live, setLive, onFinish,
}: {
  week: Week; session: Session; live: Live;
  setLive: (l: Live) => void; onFinish: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({ drive: true, iron: false, chip: false, putt: false });
  const set = (patch: Partial<Live>) => setLive({ ...live, ...patch });
  const clamp = (v: number) => Math.max(0, v);
  const toggle = (k: string) => setOpen({ ...open, [k]: !open[k] });

  const areas = {
    drive: live.fairway + live.left + live.right > 0,
    iron: live.solid + live.fat + live.thin > 0,
    chip: live.on + live.off > 0 || !!live.bestClub,
    putt: live.in + live.out > 0,
  };
  const logged = Object.values(areas).filter(Boolean).length;

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-title sm">{week.short} · {session.label.replace(/ —.*/, "")}</div>
            <div className="hdr-sub sm">{week.title} block · 4 areas</div>
          </div>
          <div className="chip"><Icon name="check_circle" size={16} fill={logged === 4} />{logged}/4</div>
        </div>
        <div className="pbar"><span style={{ width: `${(logged / 4) * 100}%` }} /></div>
      </header>

      <div className="screen log">
        <Block id="drive" name="Driving" icon="sports_golf" logged={areas.drive}
               tally={`${live.fairway}/${live.left}/${live.right}`}
               open={open.drive} toggle={() => toggle("drive")}>
          <div className="drline">
            <Icon name="near_me" size={17} color="var(--blue)" style={{ marginTop: 1 }} />{session.drive.name}
          </div>
          <div className="outcomes">
            <Outcome tone="good" icon="check" label="Fairway" count={live.fairway}
                     onInc={() => set({ fairway: live.fairway + 1 })} onDec={() => set({ fairway: clamp(live.fairway - 1) })} />
            <Outcome tone="sand" icon="west" label="Left" count={live.left}
                     onInc={() => set({ left: live.left + 1 })} onDec={() => set({ left: clamp(live.left - 1) })} />
            <Outcome tone="clay" icon="east" label="Right" count={live.right}
                     onInc={() => set({ right: live.right + 1 })} onDec={() => set({ right: clamp(live.right - 1) })} />
          </div>
          <div className="hint"><Icon name="touch_app" size={14} />Tap to add · hold to subtract</div>
          <DrillCard how={session.drive.how} />
          {session.drive.sticks && <Stick text={session.drive.sticks} />}
        </Block>

        <Block id="iron" name="Irons" icon="golf_course" logged={areas.iron}
               tally={`${live.solid}/${live.fat}/${live.thin}`}
               open={open.iron} toggle={() => toggle("iron")}>
          <div className="drline">
            <Icon name="stacked_line_chart" size={17} color="var(--blue)" style={{ marginTop: 1 }} />{session.iron.name}
          </div>
          <div className="outcomes">
            <Outcome tone="good" icon="check" label="Solid" count={live.solid}
                     onInc={() => set({ solid: live.solid + 1 })} onDec={() => set({ solid: clamp(live.solid - 1) })} />
            <Outcome tone="sand" icon="south_east" label="Fat" count={live.fat}
                     onInc={() => set({ fat: live.fat + 1 })} onDec={() => set({ fat: clamp(live.fat - 1) })} />
            <Outcome tone="clay" icon="north_east" label="Thin" count={live.thin}
                     onInc={() => set({ thin: live.thin + 1 })} onDec={() => set({ thin: clamp(live.thin - 1) })} />
          </div>
          <div className="hint"><Icon name="touch_app" size={14} />Tap to add · hold to subtract</div>
          <DrillCard how={session.iron.how} />
          {session.iron.sticks && <Stick text={session.iron.sticks} />}
        </Block>

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
              <input value={live.bestClub} onChange={(e) => set({ bestClub: e.target.value })}
                     placeholder="e.g. 54° wedge" />
            </div>
          </div>
          <div className="outcomes">
            <Outcome tone="good" icon="check" label="On towel" count={live.on}
                     onInc={() => set({ on: live.on + 1 })} onDec={() => set({ on: clamp(live.on - 1) })} />
            <Outcome tone="clay" icon="close" label="Off towel" count={live.off}
                     onInc={() => set({ off: live.off + 1 })} onDec={() => set({ off: clamp(live.off - 1) })} />
          </div>
          <DrillCard how={session.chip.how} />
          {session.chip.sticks && <Stick text={session.chip.sticks} />}
        </Block>

        <Block id="putt" name="Putting" icon="adjust" logged={areas.putt}
               tally={`${live.in}/${live.out}`}
               open={open.putt} toggle={() => toggle("putt")}>
          <div className="drline">
            <Icon name="door_sliding" size={17} color="var(--blue)" style={{ marginTop: 1 }} />{session.putts[0]?.name}
          </div>
          <div className="outcomes">
            <Outcome tone="good" icon="golf_course" label="In" count={live.in}
                     onInc={() => set({ in: live.in + 1 })} onDec={() => set({ in: clamp(live.in - 1) })} />
            <Outcome tone="clay" icon="close" label="Out" count={live.out}
                     onInc={() => set({ out: live.out + 1 })} onDec={() => set({ out: clamp(live.out - 1) })} />
          </div>
          {session.putts.map((p, i) => <DrillCard key={i} how={p.how} />)}
          {session.putts.map((p, i) => (p.sticks ? <Stick key={i} text={p.sticks} /> : null))}
        </Block>

        <div className="grp" style={{ paddingTop: 8 }}>
          <div className="label-row"><Icon name="edit_note" size={16} />Session notes</div>
          <textarea className="notes" value={live.notes}
                    onChange={(e) => set({ notes: e.target.value })}
                    placeholder="Conditions, feels, what clicked…" />
          <button className="cta" onClick={onFinish}><Icon name="done_all" size={22} />Finish session</button>
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

function DrillCard({ how }: { how: string }) {
  return (
    <div className="drill">
      <div className="drill-t"><Icon name="bolt" size={18} color="var(--green)" />Focus drill</div>
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
