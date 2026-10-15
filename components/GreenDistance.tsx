"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { useToast } from "./Toast";
import { tapFx } from "@/lib/haptics";
import { GeoPoint, haversineMeters, metersToYards } from "@/lib/geo";
import {
  GreenMark, courseKeyFor, getGreenMark, setGreenMark,
  getLiveDistanceOn, setLiveDistanceOn,
} from "@/lib/greens";
import { findNearbyGreen, OsmGreenMatch } from "@/lib/osmGreen";

type Step = "front" | "center" | "back";
const STEPS: Step[] = ["front", "center", "back"];
const STEP_COPY: Record<Step, { prompt: string; cta: string }> = {
  front: { prompt: "Walk to the front edge of the green and tap", cta: "Mark front" },
  center: { prompt: "Now the center of the green", cta: "Mark center" },
  back: { prompt: "Now the back edge", cta: "Mark back" },
};

const GEO_OPTS: PositionOptions = { enableHighAccuracy: true, timeout: 10_000 };

function getFix(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      GEO_OPTS,
    );
  });
}

const PERM_MSG = "Can't read your location — check location permission";

// Rangefinder-style front/center/back readout for the hole in play. Marked
// once per course+hole (lib/greens.ts), then reused on every later round —
// feature-detects and renders nothing when unsupported, same pattern as
// VoiceLog's mic check, and never requests permission except from a direct
// tap (turnOn / tapStep), never on mount.
export function GreenDistance({ courseName, holeIndex }: { courseName: string; holeIndex: number }) {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);
  const [mark, setMark] = useState<GreenMark | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [marking, setMarking] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [points, setPoints] = useState<Partial<Record<Step, GeoPoint>>>({});
  const [live, setLive] = useState<{ front: number; center: number; back: number } | null>(null);
  const [osmSearching, setOsmSearching] = useState(false);
  const [osmPreview, setOsmPreview] = useState<(OsmGreenMatch & { fromMeters: number }) | null>(null);
  const toast = useToast();
  const courseKey = courseKeyFor(courseName);

  useEffect(() => {
    setSupported(typeof navigator !== "undefined" && "geolocation" in navigator);
  }, []);

  useEffect(() => {
    getLiveDistanceOn().then(setOn);
  }, []);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    setMarking(false);
    setStepIdx(0);
    setPoints({});
    setLive(null);
    setOsmPreview(null);
    getGreenMark(courseKey, holeIndex).then((m) => {
      if (!active) return;
      setMark(m);
      setLoaded(true);
    });
    return () => { active = false; };
  }, [courseKey, holeIndex]);

  useEffect(() => {
    if (!on || !mark || marking) { setLive(null); return; }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const here: GeoPoint = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLive({
          front: Math.round(metersToYards(haversineMeters(here, mark.front))),
          center: Math.round(metersToYards(haversineMeters(here, mark.center))),
          back: Math.round(metersToYards(haversineMeters(here, mark.back))),
        });
      },
      (err) => {
        // Only a real denial should kill the feature — a momentary
        // POSITION_UNAVAILABLE/TIMEOUT (signal dropout under trees, GPS
        // re-acquiring) is routine outdoors and should just leave the last
        // good numbers on screen rather than toast and switch itself off.
        if (err.code === err.PERMISSION_DENIED) {
          toast.show(PERM_MSG);
          setOn(false);
          setLiveDistanceOn(false);
        }
      },
      { enableHighAccuracy: true, maximumAge: 2000 },
    );
    return () => navigator.geolocation.clearWatch(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, mark, marking]);

  if (!supported || !loaded) return null;

  const turnOn = async () => {
    tapFx();
    try {
      await getFix(); // ties the native permission prompt to this exact tap
      setOn(true);
      await setLiveDistanceOn(true);
    } catch {
      toast.show(PERM_MSG);
    }
  };

  if (!on) {
    return (
      <div className="grp green-dist">
        <button className="green-dist-toggle" onClick={turnOn}>
          <Icon name="my_location" size={17} />
          Turn on live distance to green
        </button>
      </div>
    );
  }

  const startMark = () => { tapFx(); setMarking(true); setStepIdx(0); setPoints({}); setOsmPreview(null); };

  // Optional convenience: ask OpenStreetMap whether a green is already
  // mapped within a tight radius of right here, instead of marking by hand.
  // Any failure (offline, Overpass down, nothing nearby) is treated the
  // same — just fall back to the manual flow, no error shown.
  const searchOsm = async () => {
    tapFx();
    setOsmSearching(true);
    try {
      const here = await getFix();
      const match = await findNearbyGreen(here);
      if (!match) {
        toast.show("No mapped green found nearby — mark it by hand");
      } else {
        setOsmPreview({ ...match, fromMeters: Math.round(haversineMeters(here, match.center)) });
      }
    } catch {
      toast.show(PERM_MSG);
    } finally {
      setOsmSearching(false);
    }
  };

  const confirmOsm = async () => {
    if (!osmPreview) return;
    tapFx();
    const full: GreenMark = { front: osmPreview.front, center: osmPreview.center, back: osmPreview.back, updatedAt: Date.now() };
    await setGreenMark(courseKey, holeIndex, full);
    setMark(full);
    setMarking(false);
    setOsmPreview(null);
  };

  const declineOsm = () => { tapFx(); setOsmPreview(null); };

  const tapStep = async () => {
    tapFx();
    try {
      const p = await getFix();
      const step = STEPS[stepIdx];
      const next = { ...points, [step]: p };
      setPoints(next);
      if (stepIdx === STEPS.length - 1) {
        const full: GreenMark = { front: next.front!, center: next.center!, back: next.back!, updatedAt: Date.now() };
        await setGreenMark(courseKey, holeIndex, full);
        setMark(full);
        setMarking(false);
      } else {
        setStepIdx((n) => n + 1);
      }
    } catch {
      toast.show(PERM_MSG);
    }
  };

  if (!mark || marking) {
    if (osmPreview) {
      return (
        <div className="grp green-dist">
          <div className="rgrp-lbl">Green found nearby</div>
          <div className="green-dist-step">
            OpenStreetMap has a green mapped about {osmPreview.fromMeters}m from here — community data,
            unverified. Worth a glance before trusting it.
          </div>
          <div className="rrow">
            <button className="green-dist-toggle" onClick={confirmOsm}>
              <Icon name="check" size={17} />
              Use it
            </button>
            <button className="green-dist-toggle ghost" onClick={declineOsm}>
              Mark by hand instead
            </button>
          </div>
        </div>
      );
    }
    const step = STEPS[stepIdx];
    return (
      <div className="grp green-dist">
        <div className="rgrp-lbl">Mark the green</div>
        <div className="green-dist-step">{STEP_COPY[step].prompt}</div>
        <button className="green-dist-toggle" onClick={tapStep}>
          <Icon name="add_location" size={17} />
          {STEP_COPY[step].cta}
        </button>
        {stepIdx === 0 && (
          <button className="green-dist-remark" onClick={searchOsm} disabled={osmSearching}>
            {osmSearching ? "Searching nearby map data…" : "Or search OpenStreetMap for this green"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grp green-dist">
      <div className="rgrp-lbl rgrp-lbl-row">
        <span>Distance to green</span>
        <button className="green-dist-remark" onClick={startMark}>Re-mark</button>
      </div>
      <div className="green-dist-row">
        <div className="green-dist-pt">
          <span className="green-dist-k">Front</span>
          <span className="num">{live ? live.front : "–"}</span>
        </div>
        <div className="green-dist-pt">
          <span className="green-dist-k">Center</span>
          <span className="num">{live ? live.center : "–"}</span>
        </div>
        <div className="green-dist-pt">
          <span className="green-dist-k">Back</span>
          <span className="num">{live ? live.back : "–"}</span>
        </div>
      </div>
      <div className="green-dist-note">
        Phone GPS is accurate to roughly 5–15m — treat this as close, not exact.
      </div>
    </div>
  );
}
