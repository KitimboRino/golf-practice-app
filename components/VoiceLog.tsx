"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
import { tapFx, bumpFx } from "@/lib/haptics";

type VoiceOutcome = { key: string; label: string };

// Hand-picked aliases for natural speech, in addition to each outcome's own
// label — a golfer calling out a shot says "left" or "pulled it", not
// whatever the button's printed label happens to be.
const ALIASES: Record<string, string[]> = {
  fairway: ["on line", "fairway", "straight", "center", "good one"],
  left: ["left", "pulled", "hooked", "hook"],
  right: ["right", "pushed", "sliced", "slice"],
  solid: ["solid", "flush", "pure", "good"],
  fat: ["fat", "heavy", "chunk", "chunked", "chunky"],
  thin: ["thin", "skull", "skulled", "bladed", "blade"],
  on: ["on", "good", "on towel", "close"],
  off: ["off", "off towel", "miss", "missed"],
  close: ["close", "good", "dialed", "dialled"],
  short: ["short"],
  long: ["long"],
  in: ["in", "made", "holed", "sunk"],
  out: ["out", "miss", "missed"],
};

// Word-boundary containment, not raw substring — "talk about it" must not
// match "out", nor "inside the leather" match "in". \b doesn't understand
// multi-word phrases like "on line" as a unit, so those fall back to a plain
// substring check (safe: they're specific enough not to false-positive).
function hasPhrase(transcript: string, phrase: string): boolean {
  if (phrase.includes(" ")) return transcript.includes(phrase);
  return new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(transcript);
}

// A transcript can only resolve to an outcome when exactly one of the
// current step's outcomes matches — an ambiguous hit (or none) falls back
// to asking the golfer to repeat it or just tap, rather than guessing.
function matchOutcome(transcript: string, outcomes: VoiceOutcome[]): string | null {
  const t = transcript.toLowerCase().trim();
  if (!t) return null;
  const hits = outcomes.filter((o) => {
    const candidates = [o.label.toLowerCase(), o.key.toLowerCase(), ...(ALIASES[o.key] ?? [])];
    return candidates.some((c) => hasPhrase(t, c));
  });
  return hits.length === 1 ? hits[0].key : null;
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Mic button that logs one ball's outcome by voice — calls the same onMatch
// a tap on the matching <Outcome> button would. Renders nothing wherever the
// Web Speech API doesn't exist (Firefox, older iOS Safari) rather than
// showing a control that would just fail; the feature-check only runs after
// mount so server and first client render stay in sync (no SSR window access).
export function VoiceLogButton({
  outcomes, onMatch,
}: {
  outcomes: VoiceOutcome[];
  onMatch: (key: string) => void;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const toast = useToast();

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
    return () => { recRef.current?.abort(); };
  }, []);

  if (!supported) return null;

  const start = () => {
    if (listening) { recRef.current?.abort(); setListening(false); return; }
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      const key = matchOutcome(transcript, outcomes);
      if (key) {
        tapFx();
        onMatch(key);
      } else {
        bumpFx();
        toast.show(transcript ? `Didn't catch that — heard "${transcript}"` : "Didn't catch that — try again");
      }
    };
    rec.onerror = () => {
      setListening(false);
      toast.show("Couldn't hear you — check microphone permission");
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <button
      type="button"
      className={"voicelog" + (listening ? " on" : "")}
      aria-label={listening ? "Listening — tap to cancel" : "Log this ball by voice"}
      onClick={start}
    >
      <Icon name={listening ? "graphic_eq" : "mic"} size={16} />
    </button>
  );
}
