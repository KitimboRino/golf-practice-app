"use client";

import { useEffect, useState } from "react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  function close() {
    setDismissed(true);
    try { localStorage.setItem("installDismissed", "1"); } catch {}
  }

  useEffect(() => {
    try { if (localStorage.getItem("installDismissed") === "1") return; } catch {}

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    setDismissed(false);

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => close();

    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIOS && isSafari) setIosHint(true);

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

  if (dismissed || (!deferred && !iosHint)) return null;

  return (
    <div className="install">
      <div className="install-card">
        <span className="msr" style={{ fontSize: 22, color: "var(--green)" }}>golf_course</span>
        <div className="install-txt">
          <b>Install RangeCard</b>
          <span>
            {deferred
              ? "Add to your home screen — full-screen and offline-ready."
              : "Tap Share, then “Add to Home Screen”."}
          </span>
        </div>
        {deferred && <button className="install-go" onClick={install}>Install</button>}
        <button className="install-x" onClick={close} aria-label="Dismiss">
          <span className="msr" style={{ fontSize: 20 }}>close</span>
        </button>
      </div>
    </div>
  );
}
