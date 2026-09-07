"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

type Mode = "system" | "light" | "dark";
const ICON: Record<Mode, string> = { system: "contrast", light: "light_mode", dark: "dark_mode" };
const NEXT: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" };

// Keep the browser-chrome colour on the current --bg (post-toggle and, in
// system mode, when the OS theme flips).
function syncThemeColor() {
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
  if (bg) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", bg);
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as Mode | null;
      if (saved === "light" || saved === "dark" || saved === "system") setMode(saved);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", mode);
    try { localStorage.setItem("theme", mode); } catch { /* ignore */ }
    syncThemeColor();
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", syncThemeColor);
    return () => mq.removeEventListener("change", syncThemeColor);
  }, [mode]);

  return (
    <button className="icon-btn" onClick={() => setMode(NEXT[mode])} aria-label={`Theme: ${mode}. Tap to change.`}>
      <Icon name={ICON[mode]} size={22} />
    </button>
  );
}
