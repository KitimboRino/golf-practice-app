# ScoreCard — Golf Range Tracker (Next.js PWA)

A phone-installable app for logging range sessions from your 4-week training plan
and tracking progress over time. Works offline, stores everything on your device,
installs to your home screen — no app store needed.

## What it does

- **Plan** tab — pick your week/session; see the week's focus and your stats.
- **Log** tab — fast thumb-friendly logging. Tap an outcome to add, long-press
  (or right-click) a number to subtract. Four collapsible blocks: Driving
  (Fairway/Left/Right), Irons (Solid/Fat/Thin), Chipping (best club + On/Off towel),
  Putting (In/Out). Each block carries its focus drill and alignment-stick note.
- **Trends** tab — line charts of solid-strike %, fairways-found %, and putts-made %
  across every session, plus a deletable history list.

All plan content (drills, focus how-tos, stick setups) is ported directly from the
spreadsheet in `lib/plan.ts`.

## Run it locally

Requires Node 18+.

```bash
npm install
npm run dev
```

Open http://localhost:3000. To try it on your phone on the same Wi-Fi, run
`npm run dev -- -H 0.0.0.0` and visit `http://<your-computer-ip>:3000`.

## Preview / edit in Claude Code

Open this folder in Claude Code and ask it to run `npm run dev`, add features,
or restyle. The whole app is three files worth reading first:
`app/page.tsx` (screens + logging), `components/Trends.tsx` (charts),
`lib/plan.ts` (your plan data).

## Deploy as a real installable app

Easiest path is Vercel (free):

```bash
npm i -g vercel
vercel
```

Then on your phone open the deployed URL and choose **Add to Home Screen**
(iOS Safari: Share → Add to Home Screen; Android Chrome: install prompt).
It launches full-screen and runs offline.

## To do / nice-to-haves

- Add real app icons: drop `icon-192.png` and `icon-512.png` into `public/`
  (referenced by `manifest.json`).
- Per-iron-drill breakdown (currently irons are tallied together).
- Export history as CSV.
- Optional cloud sync (would need a backend; local-only today).
- Bump `next` to the latest 14.x patch when convenient (`npm i next@latest`).

## Notes

- Data lives in IndexedDB on the device. Clearing site data wipes history.
- No accounts, no tracking, no network calls. Fully local.
