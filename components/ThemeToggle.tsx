"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

type Mode = "system" | "light" | "dark";
const ICON: Record<Mode, string> = { system: "contrast", light: "light_mode", dark: "dark_mode" };
const NEXT: Record<Mode, Mode> = { system: "light", light: "dark", dark: "system" };

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
  }, [mode]);

  return (
    <button className="icon-btn" onClick={() => setMode(NEXT[mode])} aria-label={`Theme: ${mode}. Tap to change.`}>
      <Icon name={ICON[mode]} size={22} />
    </button>
  );
}
