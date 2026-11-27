"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// inline: rendered in the home screen's card slot. That is the only place it
// shows; the floating version is hidden everywhere (see globals.css).
export function InstallPrompt({ inline = false }: { inline?: boolean }) {
  const cls = "install" + (inline ? " inline" : "");
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  function close() {
    setDismissed(true);
    try { localStorage.setItem("installDismissed", "1"); } catch {}
  }

  useEffect(() => {
    try { if (localStorage.getItem("installDismissed") === "1") return; } catch {}

    const nav = navigator as unknown as { standalone?: boolean };
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    if (standalone) return;

    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      // iPadOS 13+ reports as a Mac — disambiguate by touch support
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (isIOS) setIos(true);

    setDismissed(false);

    // Chromium only — never fires on iOS
    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => close();
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    close();
  }

  if (dismissed) return null;

  // iOS has no install API — guide the manual Share → Add to Home Screen flow
  if (ios && !deferred) {
    return (
      <aside className={cls} aria-label="Install RangeCard">
        <div className="install-ios">
          <button className="install-x" onClick={close} aria-label="Dismiss">
            <Icon name="close" size={18} />
          </button>
          <div className="install-ios-h">
            <Icon name="add_to_home_screen" size={20} color="var(--green)" />
            Add RangeCard to your Home Screen
          </div>
          <ol className="install-steps">
            <li>Tap <Icon name="ios_share" size={16} /> Share in the Safari toolbar</li>
            <li>Scroll down and choose <b>Add to Home Screen</b></li>
          </ol>
          <p className="install-ios-note">Opens full-screen, works offline. No App Store needed.</p>
        </div>
      </aside>
    );
  }

  // Android / Chromium — one-tap once the browser offers it
  if (!deferred) return null;
  return (
    <aside className={cls} aria-label="Install RangeCard">
      <div className="install-card">
        <Icon name="install_mobile" size={19} color="var(--green)" />
        <span className="install-txt">Install RangeCard for offline, full-screen use</span>
        <button className="install-go" onClick={install}>Install</button>
        <button className="install-x" onClick={close} aria-label="Dismiss">
          <Icon name="close" size={18} />
        </button>
      </div>
    </aside>
  );
}
