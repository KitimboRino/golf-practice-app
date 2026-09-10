"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { tapFx } from "@/lib/haptics";

// High-contrast "sun mode" for logging outdoors in bright light — flattens the
// tinted surfaces, darkens muted text, thickens hairlines. Persisted like the
// theme; applied pre-paint by the inline script in app/layout.tsx.
export function GlareToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try { setOn(localStorage.getItem("glare") === "on"); } catch { /* ignore */ }
  }, []);

  const toggle = () => {
    tapFx();
    setOn((v) => {
      const next = !v;
      const root = document.documentElement;
      if (next) root.setAttribute("data-glare", "on");
      else root.removeAttribute("data-glare");
      try { localStorage.setItem("glare", next ? "on" : "off"); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <button
      className={"icon-btn" + (on ? " on" : "")}
      onClick={toggle}
      aria-pressed={on}
      aria-label={`Sun mode ${on ? "on" : "off"} — high contrast for bright light`}
    >
      <Icon name={on ? "wb_sunny" : "wb_twilight"} size={22} fill={on} />
    </button>
  );
}
