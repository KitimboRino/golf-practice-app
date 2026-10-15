// Pure geo math for the live green-distance feature — no deps, no DOM access,
// so it's trivial to keep this file untouched by the geolocation permission
// story entirely (that lives in components/GreenDistance.tsx).

export type GeoPoint = { lat: number; lng: number };

const EARTH_RADIUS_M = 6_371_000;

export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(s));
}

export function metersToYards(m: number): number {
  return m * 1.09361;
}
