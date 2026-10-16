import { GeoPoint, haversineMeters } from "./geo";

// Optional, best-effort convenience: look for a `golf=green` way already
// mapped in OpenStreetMap within a tight radius of the player's current
// position. Searching "near me" rather than by course name sidesteps the
// real problem with this data — OSM golf ways in Uganda carry no name tag,
// so there's no reliable way to match them to a course by name. Standing
// on/near the hole and asking "is there a mapped green within ~400m of here"
// is unambiguous instead: on any real course, at most one green will be.
// The public Overpass instance is free but not rock-solid — any failure,
// timeout, or empty result just means "nothing found," never an error.

export type OsmGreenMatch = { front: GeoPoint; center: GeoPoint; back: GeoPoint; wayId: number };

// Confirmed in the field (a real test at a course with known OSM coverage
// still came back empty, repeatedly) that trying these one at a time and
// stopping at the first "got a response" isn't enough — each host's CORS
// support comes and goes independently, sometimes all three are down at the
// same moment. Three are the same operator's (FOSSGIS) load-balanced nodes;
// maps.mail.ru is a genuinely independent mirror added specifically because
// its failures shouldn't correlate with the other three's. All four are
// raced in parallel (not tried in sequence) so a bad node costs nothing but
// its own timeout, and results from however many respond are merged — more
// independent attempts in the same wall-clock time, not just a longer wait.
const OVERPASS_URLS = [
  "https://z.overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];
const SEARCH_RADIUS_M = 400;
const FETCH_TIMEOUT_MS = 4500;
const RETRY_DELAY_MS = 700;

type OverpassGeomNode = { lat?: number; lon?: number };
type OverpassWay = { id: number; type: string; geometry?: OverpassGeomNode[] };
type OverpassResponse = { elements?: OverpassWay[] };

function centroidOf(pts: GeoPoint[]): GeoPoint {
  return {
    lat: pts.reduce((s, p) => s + p.lat, 0) / pts.length,
    lng: pts.reduce((s, p) => s + p.lng, 0) / pts.length,
  };
}

// The green's long axis — the farthest-apart pair of boundary vertices —
// approximates front/back; the vertex closer to the player becomes "front"
// since that's normally the side you're approaching from.
function frontBackOf(pts: GeoPoint[], here: GeoPoint): { front: GeoPoint; back: GeoPoint } {
  let a = pts[0], b = pts[0], maxD = -1;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = haversineMeters(pts[i], pts[j]);
      if (d > maxD) { maxD = d; a = pts[i]; b = pts[j]; }
    }
  }
  return haversineMeters(here, a) <= haversineMeters(here, b) ? { front: a, back: b } : { front: b, back: a };
}

async function fetchGreens(url: string, query: string): Promise<OverpassWay[] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${url}?data=${encodeURIComponent(query)}`, { signal: controller.signal });
    if (!res.ok) return null;
    const data: OverpassResponse = await res.json();
    return (data.elements ?? []).filter((e) => e.type === "way" && Array.isArray(e.geometry));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// One round: fire all hosts at once, merge whatever comes back. A host that
// errors or times out just contributes nothing — never fails the round.
async function searchRound(query: string): Promise<OverpassWay[]> {
  const results = await Promise.all(OVERPASS_URLS.map((url) => fetchGreens(url, query)));
  return results.flatMap((r) => r ?? []);
}

export async function findNearbyGreen(here: GeoPoint): Promise<OsmGreenMatch | null> {
  const query = `[out:json][timeout:5];way(around:${SEARCH_RADIUS_M},${here.lat},${here.lng})["golf"="green"];out geom;`;

  let ways = await searchRound(query);
  // every host failed outright (not just "found nothing") — worth one more
  // shot a moment later rather than giving up, since the flakiness is
  // per-request, not a durable outage.
  if (!ways.length) {
    await sleep(RETRY_DELAY_MS);
    ways = await searchRound(query);
  }
  if (!ways.length) return null;

  let best: { way: OverpassWay; pts: GeoPoint[]; centroid: GeoPoint; dist: number } | null = null;
  for (const way of ways) {
    const pts = (way.geometry ?? [])
      .filter((g) => typeof g.lat === "number" && typeof g.lon === "number")
      .map((g) => ({ lat: g.lat as number, lng: g.lon as number }));
    if (pts.length < 3) continue;
    const centroid = centroidOf(pts);
    const dist = haversineMeters(here, centroid);
    if (!best || dist < best.dist) best = { way, pts, centroid, dist };
  }
  if (!best) return null;

  const { front, back } = frontBackOf(best.pts, here);
  return { front, center: best.centroid, back, wayId: best.way.id };
}
