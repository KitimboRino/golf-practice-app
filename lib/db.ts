import Dexie, { Table } from "dexie";

// Per-ball outcome keys, in tap order, for the shot strip. Counts are derived from these.
export type Strips = {
  driving: string[];   // "fairway" | "left" | "right"
  irons: string[];     // "solid" | "fat" | "thin"
  chipping: string[];  // "on" | "off"
  pitching: string[];  // "close" | "short" | "long"
  putting: string[];   // "in" | "out"
};

export const emptyStrips = (): Strips => ({
  driving: [], irons: [], chipping: [], pitching: [], putting: [],
});

// A saved session record. Scores are stored as tallies so trends can compute rates.
export type SavedSession = {
  id: string;                 // uuid — also the Supabase row id once sync lands
  weekId: string;             // e.g. "week1"
  sessionLabel: string;       // e.g. "Session 1"
  date: string;               // ISO date (yyyy-mm-dd)
  notes: string;
  driving: { fairway: number; left: number; right: number };
  irons: { solid: number; fat: number; thin: number };
  chipping: { bestClub: string; on: number; off: number };
  pitching: { close: number; short: number; long: number };
  putting: { in: number; out: number };
  strips?: Strips;            // v3 — per-ball order for the shot strip
  startedAt?: number;         // v3 — when logging began, for session duration
  createdAt: number;
  updatedAt: number;          // last local write — drives last-write-wins on sync
  deleted?: boolean;          // soft delete so removals propagate to the server
};

export const countIn = (arr: string[] | undefined, key: string) =>
  (arr ?? []).reduce((n, x) => (x === key ? n + 1 : n), 0);

// ---- on-course rounds (separate from range sessions) ----
export type RoundHole = {
  par: 3 | 4 | 5;
  fairwayHit: boolean | null;   // null on par 3s (no fairway to hit)
  gir: boolean;                 // green in regulation
  putts: number;
  upAndDown: boolean | null;    // scrambling — only meaningful when gir === false
};

export type SavedRound = {
  id: string;
  date: string;                 // yyyy-mm-dd
  course?: string;
  holes: 9 | 18;                // hole count
  holeData: RoundHole[];        // one entry per hole (length === holes)
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
};

export type RoundInput = Omit<SavedRound, "updatedAt" | "deleted"> & {
  updatedAt?: number;
  deleted?: boolean;
};

// ---- scored practice games (one recorded number per attempt) ----
export type GameAttempt = {
  id: string;
  gameId: string;               // matches a Game.id in lib/games.ts
  date: string;                 // yyyy-mm-dd
  score: number;                // the number the golfer recorded
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
};

export type GameAttemptInput = Omit<GameAttempt, "updatedAt" | "deleted"> & {
  updatedAt?: number;
  deleted?: boolean;
};

export const emptyHole = (par: 3 | 4 | 5 = 4): RoundHole => ({
  par,
  fairwayHit: par === 3 ? null : false,
  gir: false,
  putts: 2,
  upAndDown: false, // gir defaults false, so a green missed by default
});

// weekId sentinel for an ad-hoc "quick session" — not part of the 4-week plan
export const ADHOC = "adhoc";
export const isAdhoc = (s: { weekId: string }) => s.weekId === ADHOC;

// A drill swapped in from the Library for a given area — held in meta ("drillOverrides"),
// applied to the current/next session's focus drill. Not synced (a local preference).
export type AreaKey = "driving" | "irons" | "chipping" | "pitching" | "putting";
export type DrillOverride = { name: string; how: string };
export type DrillOverrides = Partial<Record<AreaKey, DrillOverride>>;

// Convenience input type for writers — updatedAt/deleted are stamped by saveSession.
export type SessionInput = Omit<SavedSession, "updatedAt" | "deleted"> & {
  updatedAt?: number;
  deleted?: boolean;
};

class RangeCardDB extends Dexie {
  sessions!: Table<SavedSession, string>;
  rounds!: Table<SavedRound, string>;
  games!: Table<GameAttempt, string>;
  // meta uses out-of-line keys (Dexie spec ""), matching the original idb store
  meta!: Table<any, string>;

  constructor() {
    super("scorecard"); // keep the original IndexedDB name so existing data carries over
    this.version(1)
      .stores({
        sessions: "id, date, weekId, updatedAt",
        meta: "",
      })
      .upgrade(async (tx) => {
        const now = Date.now();
        await tx.table("sessions").toCollection().modify((s: any) => {
          if (s.updatedAt == null) s.updatedAt = s.createdAt ?? now;
          if (s.deleted == null) s.deleted = false;
        });
      });

    // v2 — Pitching added as a fifth scored area. Store keys unchanged;
    // backfill the new field so old records stay readable.
    this.version(2)
      .stores({
        sessions: "id, date, weekId, updatedAt",
        meta: "",
      })
      .upgrade(async (tx) => {
        await tx.table("sessions").toCollection().modify((s: any) => {
          if (!s.pitching) s.pitching = { close: 0, short: 0, long: 0 };
        });
      });

    // v3 — per-ball shot strips + session start time. Both optional; store keys
    // unchanged, so this is a no-op migration that just registers the version.
    this.version(3).stores({
      sessions: "id, date, weekId, updatedAt",
      meta: "",
    });

    // v4 — adds the `rounds` store for on-course round tracking. Existing stores
    // are unchanged, so sessions/meta data opens as-is (no upgrade function needed).
    this.version(4).stores({
      sessions: "id, date, weekId, updatedAt",
      meta: "",
      rounds: "id, date, updatedAt",
    });

    // v5 — adds the `games` store for scored practice games. Existing stores
    // unchanged; no upgrade function needed.
    this.version(5).stores({
      sessions: "id, date, weekId, updatedAt",
      meta: "",
      rounds: "id, date, updatedAt",
      games: "id, gameId, date, updatedAt",
    });
  }
}

export const db = new RangeCardDB();

export async function saveSession(rec: SessionInput) {
  await db.sessions.put({
    ...rec,
    updatedAt: Date.now(),
    deleted: rec.deleted ?? false,
  } as SavedSession);
}

export async function allSessions(): Promise<SavedSession[]> {
  const all = await db.sessions.toArray();
  return all.filter((s) => !s.deleted).sort((a, b) => a.createdAt - b.createdAt);
}

// Soft delete — keeps a tombstone so the deletion can be pushed to the server later.
export async function deleteSession(id: string) {
  await db.sessions.update(id, { deleted: true, updatedAt: Date.now() });
}

export async function restoreSession(id: string) {
  await db.sessions.update(id, { deleted: false, updatedAt: Date.now() });
}

// For after a successful sync: drop tombstones for good.
export async function purgeDeleted() {
  await db.sessions.filter((s) => !!s.deleted).delete();
}

// ---- rounds (mirror of the session helpers) ----
export async function saveRound(rec: RoundInput) {
  await db.rounds.put({
    ...rec,
    updatedAt: Date.now(),
    deleted: rec.deleted ?? false,
  } as SavedRound);
}

export async function allRounds(): Promise<SavedRound[]> {
  const all = await db.rounds.toArray();
  return all.filter((r) => !r.deleted).sort((a, b) => a.createdAt - b.createdAt);
}

export async function deleteRound(id: string) {
  await db.rounds.update(id, { deleted: true, updatedAt: Date.now() });
}

export async function restoreRound(id: string) {
  await db.rounds.update(id, { deleted: false, updatedAt: Date.now() });
}

// ---- practice games (mirror of the session/round helpers) ----
export async function saveGameAttempt(rec: GameAttemptInput) {
  await db.games.put({
    ...rec,
    updatedAt: Date.now(),
    deleted: rec.deleted ?? false,
  } as GameAttempt);
}

export async function allGameAttempts(): Promise<GameAttempt[]> {
  const all = await db.games.toArray();
  return all.filter((g) => !g.deleted).sort((a, b) => a.createdAt - b.createdAt);
}

export async function deleteGameAttempt(id: string) {
  await db.games.update(id, { deleted: true, updatedAt: Date.now() });
}

export async function restoreGameAttempt(id: string) {
  await db.games.update(id, { deleted: false, updatedAt: Date.now() });
}

// Wipe everything — sessions, rounds, games and settings. Used by "Reset app".
export async function wipeAll() {
  await db.transaction("rw", db.sessions, db.rounds, db.games, db.meta, async () => {
    await db.sessions.clear();
    await db.rounds.clear();
    await db.games.clear();
    await db.meta.clear();
  });
}

export async function getMeta<T = any>(key: string): Promise<T | undefined> {
  return db.meta.get(key);
}

export async function setMeta(key: string, value: any) {
  await db.meta.put(value, key);
}

export async function delMeta(key: string) {
  await db.meta.delete(key);
}

export function uuid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---- backup / restore ----

export async function exportBackup(): Promise<string> {
  // includes tombstones for a complete restore
  const [sessions, rounds, games] = await Promise.all([
    db.sessions.toArray(), db.rounds.toArray(), db.games.toArray(),
  ]);
  return JSON.stringify(
    { app: "rangecard", version: 3, exportedAt: new Date().toISOString(), sessions, rounds, games },
    null,
    2,
  );
}

// Accepts a full backup object or a bare array of sessions. Malformed fields are
// coerced; unusable rows are skipped. Returns how many were written vs skipped.
export async function importBackup(text: string): Promise<{ added: number; skipped: number }> {
  if (text.length > 12_000_000) throw new Error("That file is too large to import.");
  let data: unknown;
  try {
    // reviver strips prototype-polluting keys — defence in depth (every field
    // below is also read explicitly, never spread)
    data = JSON.parse(text, (k, v) =>
      k === "__proto__" || k === "constructor" || k === "prototype" ? undefined : v,
    );
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const rows: unknown[] = Array.isArray(data)
    ? data
    : (data as { sessions?: unknown[] })?.sessions ?? [];
  if (!Array.isArray(rows)) throw new Error("No sessions found in that file.");
  if (rows.length > 5000) throw new Error("That file is too large to import.");

  const today = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  const cnt = (v: unknown) =>
    typeof v === "number" && isFinite(v) ? Math.max(0, Math.min(999, Math.round(v))) : 0;
  const str = (v: unknown, max: number, fallback = "") =>
    typeof v === "string" ? v.slice(0, max) : fallback;
  const strip = (v: unknown) =>
    Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 999) : [];
  const isDate = (s: unknown) =>
    typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));
  const ts = (v: unknown) =>
    typeof v === "number" && isFinite(v) && v > 0 && v < 4e12 ? v : now;

  const recs: SavedSession[] = [];
  let skipped = 0;
  for (const raw of rows) {
    const r = raw as Record<string, any>;
    if (!r || typeof r !== "object" || typeof r.id !== "string" || !r.id) { skipped++; continue; }
    recs.push({
      id: r.id,
      weekId: str(r.weekId, 40),
      sessionLabel: str(r.sessionLabel, 60),
      date: isDate(r.date) ? r.date : today,
      notes: str(r.notes, 2000),
      driving: { fairway: cnt(r.driving?.fairway), left: cnt(r.driving?.left), right: cnt(r.driving?.right) },
      irons: { solid: cnt(r.irons?.solid), fat: cnt(r.irons?.fat), thin: cnt(r.irons?.thin) },
      chipping: { bestClub: str(r.chipping?.bestClub, 40), on: cnt(r.chipping?.on), off: cnt(r.chipping?.off) },
      pitching: { close: cnt(r.pitching?.close), short: cnt(r.pitching?.short), long: cnt(r.pitching?.long) },
      putting: { in: cnt(r.putting?.in), out: cnt(r.putting?.out) },
      strips: r.strips && typeof r.strips === "object" ? {
        driving: strip(r.strips.driving), irons: strip(r.strips.irons),
        chipping: strip(r.strips.chipping), pitching: strip(r.strips.pitching),
        putting: strip(r.strips.putting),
      } : undefined,
      startedAt: typeof r.startedAt === "number" && isFinite(r.startedAt) ? r.startedAt : undefined,
      createdAt: ts(r.createdAt),
      updatedAt: ts(r.updatedAt),
      deleted: !!r.deleted,
    });
  }
  // rounds (v2 backups) — coerced the same way, unusable rows skipped
  const roundRows: unknown[] = Array.isArray((data as { rounds?: unknown[] })?.rounds)
    ? (data as { rounds: unknown[] }).rounds
    : [];
  const par = (v: unknown): 3 | 4 | 5 => (v === 3 || v === 5 ? v : 4);
  const bn = (v: unknown): boolean | null => (v === true || v === false ? v : null);
  const roundRecs: SavedRound[] = [];
  for (const raw of roundRows.slice(0, 2000)) {
    const r = raw as Record<string, any>;
    if (!r || typeof r !== "object" || typeof r.id !== "string" || !r.id) { skipped++; continue; }
    const holes = r.holes === 9 ? 9 : 18;
    const src = Array.isArray(r.holeData) ? r.holeData : [];
    const holeData: RoundHole[] = Array.from({ length: holes }).map((_, i) => {
      const h = (src[i] ?? {}) as Record<string, any>;
      const p = par(h.par);
      return {
        par: p,
        fairwayHit: p === 3 ? null : bn(h.fairwayHit),
        gir: h.gir === true,
        putts: Math.max(0, Math.min(20, Math.round(Number(h.putts) || 0))),
        upAndDown: h.gir === true ? null : bn(h.upAndDown),
      };
    });
    roundRecs.push({
      id: r.id,
      date: isDate(r.date) ? r.date : today,
      course: typeof r.course === "string" ? r.course.slice(0, 80) : undefined,
      holes,
      holeData,
      createdAt: ts(r.createdAt),
      updatedAt: ts(r.updatedAt),
      deleted: !!r.deleted,
    });
  }
  // practice-game attempts (v3 backups)
  const gameRows: unknown[] = Array.isArray((data as { games?: unknown[] })?.games)
    ? (data as { games: unknown[] }).games
    : [];
  const gameRecs: GameAttempt[] = [];
  for (const raw of gameRows.slice(0, 5000)) {
    const r = raw as Record<string, any>;
    if (!r || typeof r !== "object" || typeof r.id !== "string" || !r.id) { skipped++; continue; }
    if (typeof r.gameId !== "string" || !r.gameId) { skipped++; continue; }
    gameRecs.push({
      id: r.id,
      gameId: r.gameId.slice(0, 60),
      date: isDate(r.date) ? r.date : today,
      score: Math.max(0, Math.min(999, Math.round(Number(r.score) || 0))),
      createdAt: ts(r.createdAt),
      updatedAt: ts(r.updatedAt),
      deleted: !!r.deleted,
    });
  }

  if (!recs.length && !roundRecs.length && !gameRecs.length) {
    throw new Error("No valid data found in that file.");
  }

  // de-dupe within the file (last one wins)
  const byId = new Map(recs.map((r) => [r.id, r]));
  const roundsById = new Map(roundRecs.map((r) => [r.id, r]));
  const gamesById = new Map(gameRecs.map((r) => [r.id, r]));
  // one transaction — a malformed file can't leave a half-applied import
  await db.transaction("rw", db.sessions, db.rounds, db.games, async () => {
    if (byId.size) await db.sessions.bulkPut([...byId.values()]);
    if (roundsById.size) await db.rounds.bulkPut([...roundsById.values()]);
    if (gamesById.size) await db.games.bulkPut([...gamesById.values()]);
  });
  return {
    added: byId.size + roundsById.size + gamesById.size,
    skipped:
      skipped +
      (recs.length - byId.size) +
      (roundRecs.length - roundsById.size) +
      (gameRecs.length - gamesById.size),
  };
}
