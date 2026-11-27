"use client";

// End-of-plan report: first session against test day in all five areas, and
// the next step (move up a level, run the plan again, or keep going), with a
// quick session on the weakest area. Data from lib/planReport.ts.
import type { AreaKey, SavedSession } from "@/lib/db";
import { LEVEL_LABEL, type Level } from "@/lib/plan";
import { planReport } from "@/lib/planReport";
import { Icon } from "./Icon";
import { AreaIcon } from "./AreaIcon";

const AREA_NAME: Record<AreaKey, string> = {
  driving: "Driving", irons: "Irons", chipping: "Chipping", pitching: "Pitching", putting: "Putting",
};
const AREA_METRIC: Record<AreaKey, string> = {
  driving: "started on line", irons: "struck solid", chipping: "on the towel",
  pitching: "finished close", putting: "holed",
};

export function PlanReport({
  history, level, currentLevel, onBack, onMoveUp, onRestart, onPractice,
}: {
  history: SavedSession[];
  level: Level;              // the plan this report is about
  currentLevel: Level;       // the plan the golfer is on now
  onBack: () => void;
  onMoveUp: (to: Level) => void;
  onRestart: () => void;
  onPractice: (area: AreaKey, focus: { title: string; body: string }) => void;
}) {
  const r = planReport(history, level);
  const label = LEVEL_LABEL[level];

  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="hdr-title sm">Your {label} plan</h1>
            {r && <div className="hdr-sub sm">{r.sessions} sessions · {r.balls} balls</div>}
          </div>
        </div>
      </header>

      <div className="screen">
        {!r ? (
          <p className="leak-read">Log a couple of plan sessions and this report will compare them.</p>
        ) : (
          <>
            <div className="rep-hero">
              <span className="kicker">First session → {r.testLogged ? "Test day" : "Latest"}</span>
              <p className="rep-head">
                {r.improved
                  ? <>Better in <b className="num">{r.improved}</b> of {r.rows.filter((x) => x.delta !== null).length} areas</>
                  : "Holding steady across the board"}
              </p>
              {r.best && (
                <p className="rep-sub">
                  Biggest gain: {AREA_NAME[r.best.area].toLowerCase()}, {r.best.from}% to {r.best.to}%
                  {" "}{AREA_METRIC[r.best.area]}.
                </p>
              )}
              {!r.testLogged && (
                <p className="rep-sub">Test day isn&apos;t logged yet, so this compares with your latest session.</p>
              )}
            </div>

            <div className="compare rep-rows">
              {r.rows.map((x) => (
                <div className="compare-row" key={x.area}>
                  <div className="compare-label rep-area">
                    <AreaIcon area={x.area} size={15} />
                    <span>{AREA_NAME[x.area]}<small>{AREA_METRIC[x.area]}</small></span>
                  </div>
                  <div className="compare-nums num">
                    <span className="from">{x.from !== null ? `${x.from}%` : "–"}</span>
                    <Icon name="arrow_forward" size={14} color="var(--icon-muted)" />
                    <span className="to">{x.to !== null ? `${x.to}%` : "–"}</span>
                  </div>
                  <div className={"compare-delta " + (x.tone === "na" ? "flat" : x.tone)}>
                    {x.thin ? "few balls" : x.delta === null ? "once" : `${x.delta > 0 ? "+" : x.delta < 0 ? "−" : "±"}${Math.abs(x.delta)}`}
                  </div>
                </div>
              ))}
            </div>

            <div className="rep-next">
              <span className="kicker">What&apos;s next</span>
              {r.next === "up" && r.nextLevel ? (
                <>
                  <h2 className="rep-next-h">Ready for {LEVEL_LABEL[r.nextLevel]}</h2>
                  <p className="rep-sub">
                    {r.improved} areas moved and none went backwards. The {LEVEL_LABEL[r.nextLevel]} plan
                    keeps the same shape with tighter targets.
                  </p>
                  {currentLevel === r.nextLevel ? (
                    <p className="rep-sub"><b>You&apos;re already on it.</b></p>
                  ) : (
                    <button className="cta" onClick={() => onMoveUp(r.nextLevel!)}>
                      <Icon name="trending_up" size={20} />Move up to {LEVEL_LABEL[r.nextLevel]}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <h2 className="rep-next-h">
                    {r.next === "repeat" ? `Run the ${label} plan again` : `Another round of ${label}`}
                  </h2>
                  <p className="rep-sub">
                    {r.next === "repeat"
                      ? "Most areas held steady. A second pass with the same drills is usually when they start to move."
                      : level === "professional"
                        ? "You're on the top plan. Another pass sharpens what moved and gives the rest a second go."
                        : `Some areas moved, ${r.slipped ? "one or more slipped" : "others held"}. Another pass before moving up locks it in.`}
                  </p>
                  {currentLevel === level && (
                    <button className="cta" onClick={onRestart}>
                      <Icon name="restart_alt" size={20} />Start the {label} plan again
                    </button>
                  )}
                </>
              )}
              {r.weakest && r.weakest.to !== null && (
                <button
                  className="leak-practice"
                  onClick={() => onPractice(r.weakest!.area, {
                    title: `From your plan report: ${AREA_NAME[r.weakest!.area].toLowerCase()}`,
                    body: `Your lowest area on ${r.testLogged ? "test day" : "your latest session"}: ${r.weakest!.to}% ${AREA_METRIC[r.weakest!.area]}. A focused session here moves the whole card.`,
                  })}
                >
                  <Icon name="play_arrow" size={16} fill />
                  Practise {AREA_NAME[r.weakest.area].toLowerCase()}, your lowest area
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
