import { openDB, DBSchema, IDBPDatabase } from "idb";

// A saved session record. Scores are stored as tallies so trends can compute rates.
export type SavedSession = {
  id: string;                 // uuid
  weekId: string;             // e.g. "week1"
  sessionLabel: string;       // e.g. "Session 1"
  date: string;               // ISO date
  notes: string;
  driving: { fairway: number; left: number; right: number };
  irons: { solid: number; fat: number; thin: number }; // summed across the 4 iron drills
  chipping: { bestClub: string; on: number; off: number };
  putting: { in: number; out: number };
  createdAt: number;
};

interface ScoreDB extends DBSchema {
  sessions: {
    key: string;
    value: SavedSession;
    indexes: { "by-date": string; "by-week": string };
  };
  meta: { key: string; value: any };
}

let dbp: Promise<IDBPDatabase<ScoreDB>> | null = null;

function db() {
  if (!dbp) {
    dbp = openDB<ScoreDB>("scorecard", 1, {
      upgrade(d) {
        const s = d.createObjectStore("sessions", { keyPath: "id" });
        s.createIndex("by-date", "date");
        s.createIndex("by-week", "weekId");
        d.createObjectStore("meta");
      },
    });
  }
  return dbp;
}

export async function saveSession(rec: SavedSession) {
  const d = await db();
  await d.put("sessions", rec);
}

export async function allSessions(): Promise<SavedSession[]> {
  const d = await db();
  const all = await d.getAll("sessions");
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function deleteSession(id: string) {
  const d = await db();
  await d.delete("sessions", id);
}

export async function getMeta<T = any>(key: string): Promise<T | undefined> {
  const d = await db();
  return d.get("meta", key);
}

export async function setMeta(key: string, value: any) {
  const d = await db();
  await d.put("meta", value, key);
}

export function uuid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
