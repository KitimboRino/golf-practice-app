import { describe, expect, it } from "vitest";
import { backupDue, daysSinceBackup, type BackupState } from "@/lib/backup";

const DAY = 86_400_000;
const NOW = 1_800_000_000_000;
const never: BackupState = { lastAt: null, countAt: 0, snoozedAt: null };

describe("backupDue", () => {
  it("stays quiet until there are five records", () => {
    expect(backupDue(never, 4, NOW)).toBe(false);
    expect(backupDue(never, 5, NOW)).toBe(true);
  });

  it("after a backup, waits for five new records or a month with any change", () => {
    const s: BackupState = { lastAt: NOW - 3 * DAY, countAt: 10, snoozedAt: null };
    expect(backupDue(s, 10, NOW)).toBe(false); // nothing new
    expect(backupDue(s, 14, NOW)).toBe(false); // four new, three days on
    expect(backupDue(s, 15, NOW)).toBe(true);  // five new
    const old = { ...s, lastAt: NOW - 30 * DAY };
    expect(backupDue(old, 11, NOW)).toBe(true);  // a month and one new
    expect(backupDue(old, 10, NOW)).toBe(false); // a month, nothing new
  });

  it("'Not now' quiets it for a week", () => {
    const s: BackupState = { ...never, snoozedAt: NOW - 6 * DAY };
    expect(backupDue(s, 20, NOW)).toBe(false);
    expect(backupDue({ ...s, snoozedAt: NOW - 7 * DAY }, 20, NOW)).toBe(true);
  });

  it("isn't fooled by deleting records after a backup", () => {
    expect(backupDue({ lastAt: NOW - 40 * DAY, countAt: 12, snoozedAt: null }, 9, NOW)).toBe(false);
  });
});

describe("daysSinceBackup", () => {
  it("counts whole days, null when never", () => {
    expect(daysSinceBackup(never, NOW)).toBeNull();
    expect(daysSinceBackup({ ...never, lastAt: NOW - 2.5 * DAY }, NOW)).toBe(2);
  });
});
