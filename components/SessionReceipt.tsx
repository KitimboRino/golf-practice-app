"use client";

import { SavedSession } from "@/lib/db";
import { Week, Session, ALL_WEEKS } from "@/lib/plan";
import { solidPct } from "@/lib/stats";
import { sessionBalls, sessionMinutes } from "@/lib/verdict";
import { shareCard } from "@/lib/shareCard";
import { Icon } from "./Icon";
import { useToast } from "./Toast";

const wkNum = (id: string) => id.replace(/[^0-9]/g, "") || "0";
const sNum = (l: string) => l.replace(/[^0-9]/g, "") || "?";

export function SessionReceipt({
  session, history, quick = false, planComplete = false, planBalls = 0, levelLabel, nextWeek, nextSession, onDone, onNext, onReport,
}: {
  session: SavedSession;
  history: SavedSession[];
  quick?: boolean;
  planComplete?: boolean;
  onReport?: () => void; // the end-of-plan report, offered when planComplete
  planBalls?: number;
  levelLabel?: string;
  nextWeek: Week;
  nextSession: Session;
  onDone: () => void;
  onNext: () => void;
}) {
  const toast = useToast();
  const balls = sessionBalls(session);
  const mins = sessionMinutes(session);

  const p = session.pitching ?? { close: 0, short: 0, long: 0 };
  const tag = (a: "chipping" | "pitching" | "irons" | "driving" | "putting") => {
    const s = session.setup?.[a];
    if (!s) return undefined;
    const bits = [s.dist != null ? `${s.dist}${a === "putting" ? "ft" : "yd"}` : null, s.club].filter(Boolean);
    return bits.length ? bits.join(" ") : undefined;
  };
  type Area = "chipping" | "pitching" | "irons" | "driving" | "putting";
  const rows: { area: Area; name: string; short: string; label: string; note?: string; made: number; of: number }[] = [
    { area: "chipping" as Area, name: "Chipping", short: "on", label: "Chipping · on the spot", note: tag("chipping"), made: session.chipping.on, of: session.chipping.on + session.chipping.off },
    { area: "pitching" as Area, name: "Pitching", short: "close", label: "Pitching · close", note: tag("pitching"), made: p.close, of: p.close + p.short + p.long },
    { area: "irons" as Area, name: "Irons", short: "solid", label: "Irons · solid", note: tag("irons"), made: session.irons.solid, of: session.irons.solid + session.irons.fat + session.irons.thin },
    { area: "driving" as Area, name: "Driving", short: "on line", label: "Driving · on line", note: tag("driving"), made: session.driving.fairway, of: session.driving.fairway + session.driving.left + session.driving.right },
    { area: "putting" as Area, name: "Putting", short: "holed", label: "Putting · made", note: tag("putting"), made: session.putting.in, of: session.putting.in + session.putting.out },
  ].filter((r) => r.of > 0);

  const worst = [...rows].sort((a, b) => a.made / a.of - b.made / b.of)[0];
  const ownWeek = ALL_WEEKS.find((w) => w.id === session.weekId);

  // headline metric: solid rate when tee/iron shots were logged; otherwise (a
  // quick or venue-limited session with none) the most-hit area's rate, no delta
  const hasStrikes = session.driving.fairway + session.driving.left + session.driving.right +
    session.irons.solid + session.irons.fat + session.irons.thin > 0;
  const headRow = !hasStrikes && rows.length
    ? [...rows].sort((a, b) => b.of - a.of)[0]
    : null;
  const solidNow = headRow ? Math.round((headRow.made / headRow.of) * 100) : solidPct(session);
  const headCap = headRow ? headRow.label.replace(/^(\w+) · /, "$1 ").toLowerCase() : "solid strike rate";

  // delta only for the solid-rate case, against previous sessions that logged strikes
  const strikeHist = history.filter((s) =>
    s.driving.fairway + s.driving.left + s.driving.right + s.irons.solid + s.irons.fat + s.irons.thin > 0);
  const prev = !headRow && strikeHist.length >= 2 ? strikeHist[strikeHist.length - 2] : null;
  const delta = prev ? solidNow - solidPct(prev) : null;
  const best = !headRow && strikeHist.every((s) => solidPct(s) <= solidNow);

  async function share() {
    const head = planComplete
      ? "RangeCard · Plan complete"
      : quick
      ? "RangeCard · Quick session"
      : `RangeCard · Week ${wkNum(session.weekId)} · Session ${sNum(session.sessionLabel)}`;
    const lines = [
      head,
      ...(planComplete ? [`Finished the ${levelLabel ?? ""} plan — ${planBalls} balls hit`] : []),
      `${headCap[0].toUpperCase() + headCap.slice(1)} ${solidNow}%${delta !== null ? ` (${delta >= 0 ? "+" : ""}${delta})` : ""}`,
      ...rows.map((r) => `${r.label}${r.note ? ` (${r.note})` : ""}: ${r.made} of ${r.of}`),
    ].join("\n");
    const outcome = await shareCard(
      {
        kicker: planComplete ? "Plan complete" : quick ? "Quick session" : `Week ${wkNum(session.weekId)} · Session ${sNum(session.sessionLabel)}`,
        title: planComplete ? `Finished the ${levelLabel ?? ""} plan` : quick ? "Quick session logged" : `Session ${sNum(session.sessionLabel)} logged`,
        meta: quick
          ? `${balls} ball${balls === 1 ? "" : "s"}${mins ? ` · ${mins} min` : ""}`
          : `${ownWeek ? ownWeek.title : ""} · ${balls} balls${mins ? ` · ${mins} min` : ""}`,
        big: delta === null ? `${solidNow}%` : `${delta >= 0 ? "+" : ""}${delta}`,
        bigCap: delta === null ? headCap : "points of solid rate",
        bigSub: best ? "your best session yet" : delta !== null && delta >= 0 ? "moving the right way" : delta !== null ? "off your recent best" : "logged",
        rows: rows.map((r) => ({ label: r.name, value: `${r.made}/${r.of}`, sub: [r.label.split(" · ")[1], r.note].filter(Boolean).join(" · "), area: r.area })),
        note: session.notes.trim() || undefined,
        filename: `rangecard-session-${sNum(session.sessionLabel)}.png`,
      },
      lines,
    );
    if (outcome === "downloaded") toast.show("Card saved — find it in your downloads");
    else if (outcome === "copied") toast.show("Copied to clipboard");
    else if (outcome === "failed") toast.show("Couldn't share that — try again");
  }

  const kicker = planComplete
    ? "Plan complete"
    : quick
    ? "Quick session · logged"
    : `Logged · Week ${wkNum(session.weekId)} · Session ${sNum(session.sessionLabel)}`;
  const movedLine = delta === null
    ? `${headCap[0].toUpperCase() + headCap.slice(1)}: ${solidNow}%.`
    : best
    ? `Solid strike ${solidNow}%, your best session yet.`
    : `Solid strike ${solidNow}%, ${delta >= 0 ? "up" : "down"} ${Math.abs(delta)} on last time.`;
  const weak = worst && worst.made / worst.of < 0.5 ? worst : null;

  return (
    <div className="receipt-screen">
      <div className="receipt-top">
        <span className="kicker">{kicker}</span>
        <button className="icon-btn" onClick={onDone} aria-label="Close">
          <Icon name="close" size={20} />
        </button>
      </div>

      <div className="receipt-hero">
        {planComplete ? (
          <h1 className="display-xl receipt-title">You finished the {levelLabel ?? ""} plan.</h1>
        ) : (
          <h1 className="receipt-balls">
            <span className="num">{balls}</span>
            <span className="receipt-balls-u">{balls === 1 ? "ball" : "balls"}</span>
          </h1>
        )}
        <p className="receipt-lede">
          {planComplete
            ? `4 weeks, 8 sessions, ${planBalls} balls hit. `
            : `${mins ? `${mins} minutes${ownWeek && !quick ? ` of ${ownWeek.title.toLowerCase()}` : ""}. ` : ""}`}
          <b>{movedLine}</b>
        </p>
      </div>

      <div className="bands receipt-bands">
        {rows.map((r, i) => (
          <section key={r.area} className={`band area-${r.area}`} aria-label={r.name}
                   style={{ "--i": i } as React.CSSProperties}>
            <div className="band-head">
              <span className="band-title">{r.name}</span>
              <span className="band-summary">
                <span>{r.made}/{r.of} {r.short}{r.note ? ` · ${r.note}` : ""}</span>
              </span>
            </div>
            {r === weak && (
              <p className="receipt-weak">{`Weakest today. Start next session with ${r.name.toLowerCase()}.`}</p>
            )}
          </section>
        ))}
      </div>

      {session.notes.trim() && (
        <div className="receipt-note">
          <span className="kicker">Remember this</span>
          <p className="receipt-quote">&ldquo;{session.notes.trim()}&rdquo;</p>
          <span className="receipt-sub">Pinned to the top of your next session.</span>
        </div>
      )}

      <div className="receipt-actions">
        {planComplete && onReport && (
          <button className="receipt-next" onClick={onReport}>
            <span>See your plan report</span>
            <small>All five areas</small>
          </button>
        )}
        <button className={planComplete && onReport ? "receipt-ghost receipt-wide" : "receipt-next"} onClick={onNext}>
          <span>{planComplete ? "Keep practising" : quick ? "Back to your plan" : "Next session"}</span>
          <small>{nextWeek.short} · {nextSession.label.replace(/ —.*/, "")}</small>
        </button>
        <div className="receipt-row2">
          <button className="receipt-ghost" onClick={share}>
            <Icon name="ios_share" size={19} />Share card
          </button>
          <button className="receipt-ghost" onClick={onDone}>Done</button>
        </div>
      </div>
    </div>
  );
}
