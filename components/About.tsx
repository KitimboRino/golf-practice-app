"use client";

import { useEffect, useState } from "react";
import { wipeAll } from "@/lib/db";
import { APP_VERSION } from "@/lib/version";
import { useConfirm } from "./Confirm";
import { Icon } from "./Icon";
import { Mark } from "./Mark";

// what a player would notice since 1.2, newest first; keep it short
const WHATS_NEW: { t: string; d: string }[] = [
  { t: "Patterns from your rounds", d: "Scoring by par, big numbers, which way tee shots miss, fairways by tee club and front nine against back. Most come with a button to practise the fix." },
  { t: "This hole, last time", d: "At a course you've played before, each hole shows how it went: recent scores, average and the fairway miss." },
  { t: "Backup reminder", d: "A nudge when your history isn't backed up, saving straight to Files or iCloud Drive." },
  { t: "Swing check outlines", d: "A golfer outline for face-on or down the line, whichever way you film." },
  { t: "Distances that fit", d: "Pitching targets from 40 to 100 yards, and target distances for chipping." },
  { t: "A new look", d: "Colour bands for each area, a strata chart in Trends, the driving fan, poster share cards and an icon set of its own." },
];

export function About({ onBack }: { onBack: () => void }) {
  const { confirm } = useConfirm();
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const nav = navigator as unknown as { standalone?: boolean };
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true,
    );
  }, []);

  async function reset() {
    const ok = await confirm({
      title: "Reset RangeCard?",
      body: "Every session, round, note and setting on this device is erased. This cannot be undone. Export a backup from Trends first if you want to keep your history.",
      confirmLabel: "Erase everything",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await wipeAll();
    } catch {
      // Dexie may be unable to open a corrupt DB — drop it at the raw level
    }
    try {
      indexedDB.deleteDatabase("scorecard");
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
    window.location.reload();
  }

  return (
    <>
      <header className="hdr">
        <div className="hdr-row" style={{ alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack} aria-label="Back">
            <Icon name="arrow_back" size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 className="hdr-title">About RangeCard</h1>
          </div>
        </div>
      </header>

      <div className="screen">
        <div className="about-id">
          <span className="about-mark"><Mark size={38} /></span>
          <div className="about-name">RangeCard</div>
          <div className="about-ver">
            <span className="tag">v{APP_VERSION}</span>
            <span>{standalone ? "Installed" : "Web app"}</span>
          </div>
        </div>

        <p className="about-p">
          Built around a four-week range-practice plan: log every ball and RangeCard tells
          you whether the work is landing, session by session. It also tracks your on-course
          rounds, runs a handful of scored practice games, and drills a pre-shot routine.
        </p>

        <div className="prep-card">
          <div className="prep-sub" style={{ marginTop: 8 }}>New in {APP_VERSION.split(".").slice(0, 2).join(".")}</div>
          {WHATS_NEW.map((n) => (
            <div className="pitem" key={n.t}>
              <b>{n.t}</b>
              <span>{n.d}</span>
            </div>
          ))}
        </div>

        <div className="prep-card">
          <div className="prep-sub" style={{ marginTop: 8 }}>Your data</div>
          <div className="pitem">
            <b>Stays on this device</b>
            <span>No account, nothing uploaded. Everything lives in this browser&apos;s storage.</span>
          </div>
          <div className="pitem">
            <b>Works offline</b>
            <span>Once loaded, the app runs with no connection. Install it from the prompt for a full-screen, offline copy.</span>
          </div>
          <div className="pitem">
            <b>Back it up</b>
            <span>The home screen reminds you when there&apos;s history that isn&apos;t backed up. Tap Back up to save a .json file (sessions, rounds and games) to Files, iCloud Drive or anywhere else, and re-import it on any device. It&apos;s also under More → Trends → the tune icon.</span>
          </div>
        </div>

        <div className="stick">
          <Icon name="menu_book" size={18} color="var(--blue-icon)" style={{ marginTop: 1 }} />
          <div className="stick-b">
            The plan, drills and fault fixes are <b>adapted from standard golf-instruction
            references and expert advice</b>. RangeCard is a personal practice tool, not coaching.
          </div>
        </div>

        <div className="about-danger">
          <button className="btn-ghost" onClick={reset}>
            <Icon name="restart_alt" size={17} />Reset app &amp; erase all data
          </button>
        </div>

        <div className="about-foot">
          <span>RangeCard v{APP_VERSION} · made for the range.</span>
          <span>
            © {new Date().getFullYear()}{" "}
            <a href="https://kredinc.vercel.app/" target="_blank" rel="noopener noreferrer">Kred Inc</a>
          </span>
        </div>
      </div>
    </>
  );
}
