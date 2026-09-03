"use client";

import { SavedSession } from "@/lib/db";
import { Week, Session, PLAN } from "@/lib/plan";
import { solidPct } from "@/lib/stats";
import { sessionBalls, sessionMinutes } from "@/lib/verdict";
import { Icon } from "./Icon";

const wkNum = (id: string) => id.replace(/[^0-9]/g, "") || "0";
const sNum = (l: string) => l.replace(/[^0-9]/g, "") || "?";

export function SessionReceipt({
  session, history, nextWeek, nextSession, onDone, onNext,
}: {
  session: SavedSession;
  history: SavedSession[];
  nextWeek: Week;
  nextSession: Session;
  onDone: () => void;
  onNext: () => void;
}) {
  const balls = sessionBalls(session);
  const mins = sessionMinutes(session);
  const solidNow = solidPct(session);
  const prev = history.length >= 2 ? history[history.length - 2] : null;
  const delta = prev ? solidNow - solidPct(prev) : null;
  const best = history.every((s) => solidPct(s) <= solidNow);

  const p = session.pitching ?? { close: 0, short: 0, long: 0 };
  const rows: { label: string; made: number; of: number }[] = [
    { label: "Chipping · on towel", made: session.chipping.on, of: session.chipping.on + session.chipping.off },
    { label: "Pitching · close", made: p.close, of: p.close + p.short + p.long },
    { label: "Irons · solid", made: session.irons.solid, of: session.irons.solid + session.irons.fat + session.irons.thin },
    { label: "Driving · on line", made: session.driving.fairway, of: session.driving.fairway + session.driving.left + session.driving.right },
    { label: "Putting · made", made: session.putting.in, of: session.putting.in + session.putting.out },
  ].filter((r) => r.of > 0);

  const worst = [...rows].sort((a, b) => a.made / a.of - b.made / b.of)[0];
  const ownWeek = PLAN.find((w) => w.id === session.weekId);

  function share() {
    const lines = [
      `RangeCard · Week ${wkNum(session.weekId)} · Session ${sNum(session.sessionLabel)}`,
      `Solid rate ${solidNow}%${delta !== null ? ` (${delta >= 0 ? "+" : ""}${delta})` : ""}`,
      ...rows.map((r) => `${r.label}: ${r.made} of ${r.of}`),
    ].join("\n");
    if (navigator.share) navigator.share({ text: lines }).catch(() => {});
    else navigator.clipboard?.writeText(lines).catch(() => {});
  }

  return (
    <div className="welcome-wrap" style={{ alignItems: "flex-start", paddingTop: 34 }}>
      <div className="receipt">
        <div className="receipt-top">
          <span className="icon-tile lg glow"><Icon name="check" size={26} fill /></span>
          <div className="receipt-h">Session {sNum(session.sessionLabel)} logged</div>
          <div className="receipt-meta">
            W{wkNum(session.weekId)}{ownWeek ? ` · ${ownWeek.title}` : ""} · {balls} balls{mins ? ` · ${mins} min` : ""}
          </div>
        </div>

        <div className="receipt-moved">
          <div className="eyebrow">What moved</div>
          <div className="receipt-big">
            <span className="receipt-delta">
              {delta === null ? solidNow + "%" : (delta >= 0 ? "+" : "") + delta}
            </span>
            <span className="receipt-cap">
              {delta === null ? "solid strike rate" : "points of solid rate"}
              <br />{best ? "your best session yet" : delta !== null && delta >= 0 ? "moving the right way" : "off your recent best"}
            </span>
          </div>
          <div className="receipt-rows">
            {rows.map((r) => (
              <div className="receipt-row" key={r.label}>
                <span>{r.label}</span>
                <b className={r === worst && r.made / r.of < 0.5 ? "low" : ""}>{r.made} of {r.of}</b>
              </div>
            ))}
          </div>
        </div>

        {session.notes.trim() && (
          <div className="receipt-note">
            <div className="eyebrow dim"><Icon name="bookmark" size={14} color="var(--blue-icon)" /> Remember this</div>
            <div className="receipt-quote">&ldquo;{session.notes.trim()}&rdquo;</div>
            <div className="receipt-sub">Your note — pinned to the top of your next session.</div>
          </div>
        )}

        <div className="receipt-actions">
          <button className="cta" onClick={share}>
            <Icon name="ios_share" size={22} />Share this card
          </button>
          <button className="receipt-next" onClick={onNext}>
            <span>
              <b>Next: {nextWeek.short} · {nextSession.label.replace(/ —.*/, "")}</b>
              <small>{worst ? `${worst.label.split(" ·")[0]} needs the attention` : "Keep the plan"}</small>
            </span>
            <span className="icon-tile sm dim"><Icon name="event" size={16} /></span>
          </button>
          <button className="btn-ghost" onClick={onDone}>Done</button>
        </div>
      </div>
    </div>
  );
}
