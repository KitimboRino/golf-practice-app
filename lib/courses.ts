import { RoundHole, emptyHole } from "./db";

// Seeded par-per-hole for a handful of Uganda courses, so starting a round
// there doesn't mean guessing or re-typing the card from memory on every
// par that isn't 4. Par only — no yardage. Public scorecards for these
// courses (GolfPass, Hole19, 18Birdies, ShotNavi, the clubs' own sites)
// disagree with each other on yardage by hundreds of yards in places, so
// yardage isn't trustworthy enough to seed; par is what the app's own stats
// (to-par, GIR) actually depend on, and it's the one figure that agreed
// across sources. Still best-effort, not pulled from an official card —
// RoundSetup flags it as such, and every hole's par stays editable in
// RoundPlay regardless.
//
// Each entry only covers as many holes as were actually corroborated by two
// or more independent sources — several other Uganda clubs were checked
// (Mbarara, Toro/Fort Portal) and dropped: Mbarara's sources disagree on
// hole count AND total par with no hole-by-hole data at all; Toro's sources
// agree it's 9 holes at par 70 but no source anywhere gives the individual
// hole pars, so there's nothing real to seed, only a total to guess backward
// from — which isn't corroboration, it's invention.
export type CoursePreset = {
  id: string;
  name: string;
  holes: 9 | 18;  // how many holes this entry actually covers
  pars: number[]; // length === holes, front nine first
};

export const COURSES: CoursePreset[] = [
  {
    id: "uganda-golf-club",
    name: "Uganda Golf Club",
    holes: 18,
    pars: [5, 4, 5, 3, 5, 3, 4, 5, 3, 4, 3, 4, 5, 4, 4, 4, 3, 4], // par 72
  },
  {
    id: "entebbe-golf-club",
    name: "Entebbe Golf Club",
    holes: 18,
    pars: [5, 3, 4, 4, 4, 3, 5, 3, 4, 3, 5, 3, 4, 4, 5, 3, 4, 5], // par 71
  },
  {
    id: "jinja-golf-club",
    name: "Jinja Golf Club",
    holes: 9,
    pars: [4, 3, 5, 5, 4, 4, 3, 5, 3], // par 36 — only the front nine is corroborated
  },
  {
    id: "lake-victoria-serena",
    name: "Lake Victoria Serena",
    holes: 18,
    // par 72 — the total is corroborated by several sources, but this exact
    // hole-by-hole mapping is single-source (18Birdies only); every other
    // scorecard site found either had no hole-by-hole table or no page for
    // this course at all. Weaker evidence than the other three entries here.
    pars: [4, 5, 4, 3, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4],
  },
];

export function findCourse(id: string): CoursePreset | undefined {
  return COURSES.find((c) => c.id === id);
}

export function holesForPreset(preset: CoursePreset): RoundHole[] {
  return preset.pars.map((par) => emptyHole(par as 3 | 4 | 5));
}
