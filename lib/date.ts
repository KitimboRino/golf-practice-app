// Today's date as yyyy-mm-dd in the golfer's LOCAL time zone.
//
// Not `toISOString().slice(0, 10)` — that's the UTC date, which in UTC+3
// (Uganda) labels anything logged between midnight and 3am as yesterday, while
// every reader in the app parses these strings as local midnight
// (`new Date(d + "T00:00:00")`). Writers and readers must agree on local.
export function localDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
