"use client";

import { useEffect, useState } from "react";
import { wipeAll } from "@/lib/db";
import { APP_VERSION } from "@/lib/version";
import { useConfirm } from "./Confirm";
import { Icon } from "./Icon";

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
      body: "Every session, note and setting on this device is erased. This cannot be undone — export a backup from Trends first if you want to keep your history.",
      confirmLabel: "Erase everything",
      tone: "danger",
    });
    if (!ok) return;
    await wipeAll();
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
            <div className="hdr-eyebrow">About</div>
            <div className="hdr-title">RangeCard</div>
          </div>
        </div>
      </header>

      <div className="screen">
        <div className="about-id">
          <span className="about-mark"><Icon name="sports_golf" size={28} fill /></span>
          <div className="about-name">RangeCard</div>
          <div className="about-ver">
            <span className="tag">v{APP_VERSION}</span>
            <span>{standalone ? "Installed" : "Web app"}</span>
          </div>
        </div>

        <p className="about-p">
          A four-week range-practice plan. Log every ball, and RangeCard tells you whether
          the work is landing — session by session.
        </p>

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
            <span>Trends → the tune icon → Export backup writes a .json file you can re-import on any device.</span>
          </div>
        </div>

        <div className="stick">
          <Icon name="menu_book" size={18} color="var(--blue-icon)" style={{ marginTop: 1 }} />
          <div className="stick-b">
            The plan, drills and fault fixes are <b>adapted from standard golf-instruction
            references</b>. RangeCard is a personal practice tool, not coaching.
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
