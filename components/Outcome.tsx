"use client";

import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { tapFx, bumpFx } from "@/lib/haptics";

type Tone = "good" | "sand" | "clay";

const HOLD_MS = 450;

// Tap to add · press-and-hold (or right-click) to subtract, floored at 0.
// The hold shows a filling bar so the hidden gesture is discoverable.
export function Outcome({
  label, hint, icon, count, tone, onInc, onDec,
}: {
  label: string;
  hint?: string;
  icon: string;
  count: number;
  tone: Tone;
  // the tapped button is passed along so the screen can animate the ball
  // from it into the shot strip
  onInc: (from: HTMLButtonElement) => void;
  onDec: () => void;
}) {
  const timer = useRef<number | null>(null);
  const held = useRef(false);
  const [holding, setHolding] = useState(false);

  const start = () => {
    held.current = false;
    setHolding(true);
    timer.current = window.setTimeout(() => {
      held.current = true;
      setHolding(false);
      bumpFx();
      onDec();
    }, HOLD_MS);
  };
  const stop = () => {
    setHolding(false);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return (
    <button
      className={`outcome ${tone}${holding ? " holding" : ""}`}
      style={{ "--hold-ms": `${HOLD_MS}ms` } as React.CSSProperties}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onClick={(e) => {
        if (held.current) { held.current = false; return; }
        tapFx();
        onInc(e.currentTarget);
      }}
      onContextMenu={(e) => { e.preventDefault(); bumpFx(); onDec(); }}
    >
      {/* key forces the pop animation to replay each time the tally changes */}
      <span className="outcome-count num" key={count}>{count}</span>
      <span className="outcome-label"><Icon name={icon} size={15} />{label}</span>
      {hint && <span className="outcome-hint">{hint}</span>}
      <span className="sr-only">. Tap to add, hold or right-click to subtract.</span>
    </button>
  );
}
