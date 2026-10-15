import { getMeta, setMeta } from "./db";
import { GeoPoint } from "./geo";

// A hand-marked green, saved once per course+hole and reused on every later
// round at that course — marking 3 points by hand every round would be real
// effort for no reason once the fix is already known.
export type GreenMark = {
  front: GeoPoint;
  center: GeoPoint;
  back: GeoPoint;
  updatedAt: number;
};

// There's no courseId persisted on a round today — RoundSetup's courseId is
// local state, discarded once the round starts — so the free-text course
// name is the only stable key available, for presets and custom names alike.
export function courseKeyFor(courseName: string): string {
  const slug = courseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "unnamed-course";
}

function metaKey(courseKey: string, holeIndex: number): string {
  return `green:${courseKey}:${holeIndex}`;
}

export async function getGreenMark(courseKey: string, holeIndex: number): Promise<GreenMark | undefined> {
  return getMeta<GreenMark>(metaKey(courseKey, holeIndex));
}

export async function setGreenMark(courseKey: string, holeIndex: number, mark: GreenMark): Promise<void> {
  await setMeta(metaKey(courseKey, holeIndex), mark);
}

// A single app-wide opt-in so the native location-permission prompt only
// ever fires from an explicit tap, and only once rather than every hole.
const LIVE_DISTANCE_KEY = "liveDistanceOn";

export async function getLiveDistanceOn(): Promise<boolean> {
  return !!(await getMeta<boolean>(LIVE_DISTANCE_KEY));
}

export async function setLiveDistanceOn(on: boolean): Promise<void> {
  await setMeta(LIVE_DISTANCE_KEY, on);
}
