"use client";

import { useRef } from "react";
import { Icon } from "./Icon";

type Tone = "good" | "sand" | "clay";

// Tap to add · long-press (or right-click) to subtract, floored at 0.
export function Outcome({
  label, icon, count, tone, onInc, onDec,
}: {
  label: string;
  icon: string;
  count: number;
  tone: Tone;
  onInc: () => void;
  onDec: () => void;
}) {
  const timer = useRef<number | null>(null);
  const held = useRef(false);

  const start = () => {
    held.current = false;
    timer.current = window.setTimeout(() => {
      held.current = true;
      onDec();
    }, 450);
  };
  const stop = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return (
    <button
      className={`outcome ${tone}`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onClick={() => {
        if (held.current) { held.current = false; return; }
        onInc();
      }}
      onContextMenu={(e) => { e.preventDefault(); onDec(); }}
      aria-label={`${label}: ${count}. Tap to add, long-press or right-click to subtract.`}
    >
      <span className="outcome-count num">{count}</span>
      <span className="outcome-label"><Icon name={icon} size={15} />{label}</span>
    </button>
  );
}
