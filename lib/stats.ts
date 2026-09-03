import { SavedSession } from "./db";

// Derived metrics, per the handoff spec.
// solid strike % = (driving.fairway + irons.solid) / all logged strikes
export function solidPct(s: SavedSession): number {
  const strikes =
    s.driving.fairway + s.driving.left + s.driving.right +
    s.irons.solid + s.irons.fat + s.irons.thin;
  const good = s.driving.fairway + s.irons.solid;
  return strikes ? Math.round((good / strikes) * 100) : 0;
}

// fairways found % = fairway / driving total
export function fairwayPct(s: SavedSession): number {
  const total = s.driving.fairway + s.driving.left + s.driving.right;
  return total ? Math.round((s.driving.fairway / total) * 100) : 0;
}

// putts made % = in / (in + out)
export function puttPct(s: SavedSession): number {
  const total = s.putting.in + s.putting.out;
  return total ? Math.round((s.putting.in / total) * 100) : 0;
}

// pitch accuracy % = close / (close + short + long)
export function pitchPct(s: SavedSession): number {
  const p = s.pitching ?? { close: 0, short: 0, long: 0 };
  const total = p.close + p.short + p.long;
  return total ? Math.round((p.close / total) * 100) : 0;
}
