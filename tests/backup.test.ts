import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  db, wipeAll, saveSession, allSessions, saveRound, allRounds, setMeta, getMeta,
  exportBackup, importBackup,
} from "@/lib/db";
import { session, round, hole } from "./helpers";

beforeEach(async () => {
  await wipeAll();
});

describe("backup round trip", () => {
  it("restores sessions, rounds and settings exactly", async () => {
    await saveSession(session({ id: "a", notes: "windy", driving: { fairway: 3, left: 1, right: 2 } }));
    await saveRound(round([hole({ par: 3, score: 3, putts: 2 }), hole({ par: 5, score: 6 })], { id: "r1", course: "UGC" }));
    await setMeta("name", "Sam");
    await setMeta("planLevel", "beginner");
    await setMeta("goal", { area: "putting", targetPct: 70, byDate: "2026-12-31", createdAt: 5 });

    const json = await exportBackup();
    await wipeAll();
    await db.meta.clear();
    expect(await allSessions()).toHaveLength(0);

    const res = await importBackup(json);
    expect(res).toMatchObject({ added: 2, skipped: 0, settings: true });

    const [s] = await allSessions();
    expect(s).toMatchObject({ id: "a", notes: "windy", driving: { fairway: 3, left: 1, right: 2 } });
    const [r] = await allRounds();
    expect(r.course).toBe("UGC");
    expect(r.holeData[0]).toMatchObject({ par: 3, score: 3, putts: 2, fairwayHit: null });
    expect(await getMeta("name")).toBe("Sam");
    expect(await getMeta("planLevel")).toBe("beginner");
    expect(await getMeta("goal")).toMatchObject({ area: "putting", targetPct: 70, byDate: "2026-12-31" });
  });
});

describe("importBackup merging", () => {
  it("keeps this device's copy when it's newer, takes the file's when that's newer", async () => {
    // written straight to the table: saveSession stamps updatedAt with now
    await db.sessions.bulkPut([
      session({ id: "x", notes: "local, newer", updatedAt: 2000 }),
      session({ id: "y", notes: "local, older", updatedAt: 1000 }),
    ]);
    const file = JSON.stringify({
      sessions: [
        session({ id: "x", notes: "file, older", createdAt: 500, updatedAt: 1500 }),
        session({ id: "y", notes: "file, newer", createdAt: 500, updatedAt: 3000 }),
      ],
    });
    const res = await importBackup(file);
    expect(res.added).toBe(1);
    expect(res.older).toBe(1);
    const byId = Object.fromEntries((await allSessions()).map((s) => [s.id, s.notes]));
    expect(byId).toEqual({ x: "local, newer", y: "file, newer" });
  });

  it("never lets a row with no timestamp beat a local edit", async () => {
    await db.sessions.put(session({ id: "z", notes: "local", updatedAt: 10 }));
    const res = await importBackup(JSON.stringify([{ id: "z", notes: "file, undated" }]));
    expect(res.older).toBe(1);
    expect((await allSessions())[0].notes).toBe("local");
  });

  it("coerces bad fields and skips unusable rows", async () => {
    const res = await importBackup(JSON.stringify([
      { id: "ok", date: "not a date", driving: { fairway: -4, left: 2.6, right: "x" }, putting: { in: 5000 } },
      { notes: "no id" },
      null,
      "junk",
    ]));
    expect(res.added).toBe(1);
    expect(res.skipped).toBe(3);
    const [s] = await allSessions();
    expect(s.driving).toEqual({ fairway: 0, left: 3, right: 0 });
    expect(s.putting.in).toBe(999);
    expect(s.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("ignores prototype-polluting keys", async () => {
    await importBackup('{"sessions":[{"id":"p","__proto__":{"polluted":true}}],"settings":{"__proto__":{"polluted":true}}}');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it("rejects files that aren't JSON or are far too big", async () => {
    await expect(importBackup("{nope")).rejects.toThrow("isn't valid JSON");
    await expect(importBackup("x".repeat(12_000_001))).rejects.toThrow("too large");
    await expect(importBackup(JSON.stringify(Array.from({ length: 5001 }, (_, i) => ({ id: String(i) }))))).rejects.toThrow("too large");
  });

  it("drops settings that aren't valid", async () => {
    const res = await importBackup(JSON.stringify({
      sessions: [session({ id: "keep" })],
      settings: { planLevel: "wizard", cursor: { week: -1, session: 0 }, goal: { area: "bowling", targetPct: 50 }, name: "Ari" },
    }));
    expect(res.settings).toBe(true); // only the name survived
    expect(await getMeta("name")).toBe("Ari");
    expect(await getMeta("planLevel")).toBeUndefined();
    expect(await getMeta("cursor")).toBeUndefined();
    expect(await getMeta("goal")).toBeUndefined();
  });

  it("refuses a file with nothing usable in it", async () => {
    await expect(importBackup(JSON.stringify({ sessions: [{ notes: "no id" }] }))).rejects.toThrow("No valid data");
  });
});
