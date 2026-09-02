import Dexie, { Table } from "dexie";

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
  putting: { in: number; out: number };
  createdAt: number;
  updatedAt: number;          // last local write — drives last-write-wins on sync
  deleted?: boolean;          // soft delete so removals propagate to the server
};

// Convenience input type for writers — updatedAt/deleted are stamped by saveSession.
export type SessionInput = Omit<SavedSession, "updatedAt" | "deleted"> & {
  updatedAt?: number;
  deleted?: boolean;
};

class RangeCardDB extends Dexie {
  sessions!: Table<SavedSession, string>;
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
  const sessions = await db.sessions.toArray(); // includes tombstones for a complete restore
  return JSON.stringify(
    { app: "rangecard", version: 1, exportedAt: new Date().toISOString(), sessions },
    null,
    2,
  );
}

// Accepts a full backup object or a bare array of sessions. Malformed fields are
// coerced rather than rejected. Returns the number of rows written.
export async function importBackup(text: string): Promise<number> {
  const data = JSON.parse(text);
  const rows: unknown[] = Array.isArray(data) ? data : data?.sessions;
  if (!Array.isArray(rows)) throw new Error("No sessions found in that file.");

  const num = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : 0);
  const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);
  const now = Date.now();

  const recs: SavedSession[] = [];
  for (const raw of rows) {
    const r = raw as Record<string, any>;
    if (!r || typeof r !== "object" || !r.id) continue;
    recs.push({
      id: String(r.id),
      weekId: str(r.weekId),
      sessionLabel: str(r.sessionLabel),
      date: str(r.date, new Date().toISOString().slice(0, 10)),
      notes: str(r.notes),
      driving: { fairway: num(r.driving?.fairway), left: num(r.driving?.left), right: num(r.driving?.right) },
      irons: { solid: num(r.irons?.solid), fat: num(r.irons?.fat), thin: num(r.irons?.thin) },
      chipping: { bestClub: str(r.chipping?.bestClub), on: num(r.chipping?.on), off: num(r.chipping?.off) },
      putting: { in: num(r.putting?.in), out: num(r.putting?.out) },
      createdAt: num(r.createdAt) || now,
      updatedAt: num(r.updatedAt) || now,
      deleted: !!r.deleted,
    });
  }
  if (!recs.length) throw new Error("No valid sessions found in that file.");
  await db.sessions.bulkPut(recs);
  return recs.length;
}
