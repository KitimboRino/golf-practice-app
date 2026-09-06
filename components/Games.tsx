"use client";

import { useState } from "react";
import { GameAttempt } from "@/lib/db";
import { GAMES, Game, gameById, GAME_AREA, gamePB, isPersonalBest } from "@/lib/games";
import { Icon } from "./Icon";
import { tapFx, doneFx } from "@/lib/haptics";

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(+d) ? iso : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export function Games({
  attempts, onBack, onSave, onDelete,
}: {
  attempts: GameAttempt[];
  onBack: () => void;
  onSave: (gameId: string, score: number) => void;
  onDelete: (id: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const forGame = (id: string) => attempts.filter((a) => a.gameId === id);

  const open = openId ? gameById(openId) : undefined;
  if (open) {
    return (
      <GameDetail
        game={open}
        attempts={forGame(open.id)}
        onBack={() => setOpenId(null)}
        onSave={onSave}
        onDelete={onDelete}
      />
    );
  }

  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="hdr-title">Practice games</div>
            <div className="hdr-sub">Practise with a number on the line</div>
          </div>
        </div>
      </header>

      <div className="screen">
        <p className="games-intro">
          Each game gives you one score to write down and beat next time. You&apos;re
          competing against your own personal best, not a leaderboard.
        </p>

        {GAMES.map((g) => {
          const pb = gamePB(forGame(g.id));
          const meta = GAME_AREA[g.area];
          return (
            <button key={g.id} className="more-row game-row" onClick={() => setOpenId(g.id)}>
              <span className="more-ic"><Icon name={meta.icon} size={22} color="var(--green)" /></span>
              <span className="more-txt">
                <b>{g.name}</b>
                <span>{meta.label} · {g.scoring}</span>
              </span>
              <span className="game-row-pb">
                {pb.best === null
                  ? <span className="game-row-none">No score</span>
                  : <><b className="num">{pb.best}</b><small>best</small></>}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function GameDetail({
  game, attempts, onBack, onSave, onDelete,
}: {
  game: Game;
  attempts: GameAttempt[];
  onBack: () => void;
  onSave: (gameId: string, score: number) => void;
  onDelete: (id: string) => void;
}) {
  const [score, setScore] = useState<number | null>(null);
  const [flash, setFlash] = useState<{ kind: "pb" | "saved"; score: number } | null>(null);

  const pb = gamePB(attempts);
  const meta = GAME_AREA[game.area];
  const recent = [...attempts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

  const pick = (n: number) => {
    tapFx();
    setScore(n);
    setFlash(null);
  };

  const save = () => {
    if (score === null) return;
    const newPB = isPersonalBest(score, attempts);
    onSave(game.id, score);
    if (newPB) doneFx(); else tapFx();
    setFlash({ kind: newPB ? "pb" : "saved", score });
    setScore(null);
  };

  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div className="hdr-eyebrow">{meta.label} game</div>
            <div className="hdr-title sm">{game.name}</div>
          </div>
        </div>
      </header>

      <div className="screen">
        <div className="game-rules">
          <div className="game-rules-h"><Icon name="flag" size={17} color="var(--green)" />How it works</div>
          <p>{game.rules}</p>
          {game.target != null && (
            <div className="game-target">
              <Icon name="target" size={15} color="var(--blue-icon)" />
              A good day is <b>{game.target}</b> or better
            </div>
          )}
        </div>

        <div className={"game-entry" + (flash?.kind === "pb" ? " pb" : "")}>
          <div className="game-entry-lbl">{game.scoring}</div>
          <div className="game-scores">
            {Array.from({ length: game.attempts + 1 }, (_, n) => (
              <button
                key={n}
                className={"game-score num" + (score === n ? " on" : "")}
                aria-pressed={score === n}
                onClick={() => pick(n)}
              >
                {n}
              </button>
            ))}
          </div>

          {flash && (
            <div className={"game-flash" + (flash.kind === "pb" ? " pb" : "")}>
              <Icon name={flash.kind === "pb" ? "emoji_events" : "check_circle"} size={18} fill={flash.kind === "pb"} />
              {flash.kind === "pb"
                ? `New personal best — ${flash.score}`
                : `Saved — ${flash.score}${pb.best != null ? ` · best ${pb.best}` : ""}`}
            </div>
          )}

          <button className="cta" onClick={save} disabled={score === null}>
            <Icon name="save" size={20} />Save this run
          </button>
        </div>

        <div className="game-pbline">
          {pb.best === null ? (
            "No runs logged yet — your first score sets the mark to beat."
          ) : (
            <>
              Personal best <b className="num">{pb.best}</b> · {pb.attempts} run{pb.attempts === 1 ? "" : "s"}
              {pb.lastScore != null && pb.lastDate && (
                <> · last {pb.lastScore} on {fmtDate(pb.lastDate)}</>
              )}
            </>
          )}
        </div>

        {recent.length > 0 && (
          <div className="grp" style={{ paddingTop: 6 }}>
            <div className="sec-head">
              <span className="icon-tile sm"><Icon name="history" size={15} /></span>
              <h3>Recent runs</h3>
              <span className="count-pill">{attempts.length}</span>
            </div>
            <div className="hist">
              {recent.map((a) => (
                <div className="hist-item" key={a.id}>
                  <div className="hist-row">
                    <div className="hist-l" style={{ paddingLeft: 16 }}>
                      <div className="wk">
                        {fmtDate(a.date)}
                        {pb.best != null && a.score === pb.best && <span className="game-pb-tag">PB</span>}
                      </div>
                    </div>
                    <div className="hist-r">
                      <div className="hist-solid num">{a.score}</div>
                      <button
                        className="hist-del"
                        aria-label={`Delete run from ${fmtDate(a.date)}`}
                        onClick={() => onDelete(a.id)}
                      >
                        <Icon name="delete" size={19} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
