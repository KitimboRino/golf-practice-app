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

// Same operator (FOSSGIS), different load-balanced backend nodes — tried in
// order because in practice they're inconsistently CORS-enabled: a direct
// browser fetch to the round-robin overpass-api.de hostname and a couple of
// its named nodes failed outright in testing, while others worked, then
// didn't, a few minutes later. Hedging across nodes beats picking one and
// hoping; any failure here is still just "try the next", never an error.
const OVERPASS_URLS = [
  "https://z.overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];
const SEARCH_RADIUS_M = 400;
const FETCH_TIMEOUT_MS = 4000;

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

export async function findNearbyGreen(here: GeoPoint): Promise<OsmGreenMatch | null> {
  const query = `[out:json][timeout:5];way(around:${SEARCH_RADIUS_M},${here.lat},${here.lng})["golf"="green"];out geom;`;

  let ways: OverpassWay[] | null = null;
  for (const url of OVERPASS_URLS) {
    ways = await fetchGreens(url, query);
    if (ways) break; // got a response (even an empty one) — no need to try another node
  }
  if (!ways || !ways.length) return null;

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
