// Backup reminder. Everything RangeCard knows lives in this phone's IndexedDB,
// so a lost or reset phone loses it all. This decides when to nudge (often
// enough to matter, rarely enough not to nag) and saves the file through the
// share sheet, which on iOS is the way to put it in Files or iCloud Drive.
import { exportBackup, getMeta, setMeta } from "./db";
import { localDate } from "./date";

const DAY = 86_400_000;

export type BackupState = {
  lastAt: number | null;   // when the last backup was saved
  countAt: number;         // sessions + rounds at that moment
  snoozedAt: number | null; // last "Not now"
};

export const BACKUP_RULES = {
  minRecords: 5,    // nothing worth nagging about below this
  newRecords: 5,    // this many unsaved sessions/rounds makes it due
  staleDays: 30,    // or this long since the last backup, if anything changed
  snoozeDays: 7,    // "Not now" quiets it for a week
};

/** Whether to show the reminder. `records` is live sessions + rounds. */
export function backupDue(s: BackupState, records: number, now: number): boolean {
  const R = BACKUP_RULES;
  if (records < R.minRecords) return false;
  if (s.snoozedAt !== null && now - s.snoozedAt < R.snoozeDays * DAY) return false;
  const unsaved = records - s.countAt;
  if (unsaved <= 0) return false;
  if (s.lastAt === null) return true;
  return unsaved >= R.newRecords || now - s.lastAt >= R.staleDays * DAY;
}

/** Days since the last backup, or null if there's never been one. */
export function daysSinceBackup(s: BackupState, now: number): number | null {
  return s.lastAt === null ? null : Math.floor((now - s.lastAt) / DAY);
}

export async function loadBackupState(): Promise<BackupState> {
  const [lastAt, countAt, snoozedAt] = await Promise.all([
    getMeta<number>("backupAt"), getMeta<number>("backupCount"), getMeta<number>("backupSnoozedAt"),
  ]);
  return {
    lastAt: typeof lastAt === "number" ? lastAt : null,
    countAt: typeof countAt === "number" ? countAt : 0,
    snoozedAt: typeof snoozedAt === "number" ? snoozedAt : null,
  };
}

export async function snoozeBackup(now = Date.now()): Promise<void> {
  await setMeta("backupSnoozedAt", now);
}

export type BackupOutcome = "shared" | "downloaded" | "cancelled" | "failed";

/** Saves a backup file: the share sheet where it can take a file, a plain
 *  download otherwise. Records the backup only when a file actually left. */
export async function saveBackup(records: number): Promise<BackupOutcome> {
  let json: string;
  try { json = await exportBackup(); } catch { return "failed"; }
  const name = `rangecard-${localDate()}.json`;
  const file = new File([json], name, { type: "application/json" });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };

  let outcome: BackupOutcome = "failed";
  if (nav.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file], title: "RangeCard backup" });
      outcome = "shared";
    } catch (e) {
      // closing the sheet is a choice, not a failure: no surprise download
      if (e instanceof Error && e.name === "AbortError") return "cancelled";
    }
  }
  if (outcome === "failed") {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    outcome = "downloaded";
  }
  const now = Date.now();
  await Promise.all([setMeta("backupAt", now), setMeta("backupCount", records)]);
  return outcome;
}
