"use client";

import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { tapFx, bumpFx } from "@/lib/haptics";

type Tone = "good" | "sand" | "clay";

const HOLD_MS = 450;

// Tap to add · press-and-hold (or right-click) to subtract, floored at 0.
// The hold shows a filling bar so the hidden gesture is discoverable.
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
      onClick={() => {
        if (held.current) { held.current = false; return; }
        tapFx();
        onInc();
      }}
      onContextMenu={(e) => { e.preventDefault(); bumpFx(); onDec(); }}
      aria-label={`${label}: ${count}. Tap to add, hold or right-click to subtract.`}
    >
      {/* key forces the pop animation to replay each time the tally changes */}
      <span className="outcome-count num" key={count}>{count}</span>
      <span className="outcome-label"><Icon name={icon} size={15} />{label}</span>
    </button>
  );
}
