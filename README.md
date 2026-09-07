# RangeCard — Golf Practice Tracker (Next.js PWA)

A phone-installable app built around a 4-week range-practice plan, with on-course
round stats, scored practice games and a pre-shot routine trainer alongside it.
Works offline, stores everything on your device, installs to your home screen —
no app store, no account, no network calls.

Current version: **1.1.3** (see [Version history](#version-history)).

## What it does

Four tabs in the bottom bar — **Plan · Log · Round · More** — plus everything
else behind a tidy More list.

- **Plan** — pick your week/session, see the week's focus, "today's one thing",
  plan progress and last solid-strike rate. Start the session, or a shorter
  "venue" version, or an off-plan quick session.
- **Log** — fast thumb-friendly per-ball logging with a live shot strip. Tap an
  outcome to add, long-press (or right-click) a number to subtract. Five areas:
  Chipping, Pitching, Irons (Solid/Fat/Thin), Driving (Fairway/Left/Right),
  Putting (In/Out). Each block carries its focus drill and alignment-stick note.
  A guided warm-up runs once a day before the first session.
- **Round** — an on-course tracker, separate from range sessions. Log par,
  fairway, GIR, putts and up-and-down hole by hole; finish to a stats card
  (fairways %, GIR %, putts, scrambling %, 3-putts). Includes **"Where you're
  losing shots"**, a rough leak finder that scores driving / approach / short
  game / putting against amateur benchmarks and points you back to what to drill.
- **More** — a list screen linking to:
  - **Trends** — line charts of solid-strike %, fairways-found %, pitch
    accuracy % and putts-made % across every session, a baseline→test compare,
    miss-pattern bias bars, and a deletable history list. Export / import a
    JSON backup here (sessions, rounds and games).
  - **Practice games** — scored solo challenges with a saved personal best:
    Par 18, Up & Down challenge, Distance ladder, Fairway finder.
  - **Fixes** — your miss pattern and the first fix to try, detected from history.
  - **Pre-shot routine** — a calm read-through of the routine plus a "rehearse"
    mode that walks one step at a time.
  - **Prep** — warm-up, setup check and session flow.
  - **Drill library** — alternate drills for every area, swappable into a session.
  - **About** — version, data notes, reset.

An in-progress session or round is always one tap away from the Log / Round tabs
(they show a dot), and from a resume banner on the More screen.

All plan content (drills, focus how-tos, stick setups) and the fault/fix and
game definitions are plain editable data in `lib/`.

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
or restyle. Worth reading first:

- `app/page.tsx` — screens, tab state, session logging
- `components/Round.tsx` — round tracker + leak diagnostic
- `components/Trends.tsx` — charts and history
- `lib/plan.ts` — the 4-week plan data
- `lib/db.ts` — the local (Dexie/IndexedDB) schema
- `app/globals.css` — the whole design-token system
- `components/Mark.tsx` + `public/logo_kit/` — the brand mark and asset kit

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

- More iOS splash-screen sizes (only the 1284×2778 device class is wired up).
- Per-iron-drill breakdown (irons are tallied together today).
- Optional cloud sync — the Dexie schema is built for it (`updatedAt`, soft
  deletes, uuid keys) but there's no backend today.
- Volume-key logging on the shot strip.
- Bump `next` to the latest 14.x patch when convenient (`npm i next@latest`).

## Notes

- Data lives in IndexedDB (DB name `scorecard`) on the device. Clearing site
  data wipes it — export a backup first.
- Light / dark / system theme toggle lives in the Plan header.
- No accounts, no tracking, no network calls. Fully local.
- Security: response headers (incl. a CSP) are set in `next.config.js`; deps are
  watched by Dependabot + `npm audit` in CI. The client-only architecture is the
  main defence — no server, no API, nothing leaves the device. IndexedDB is not
  encrypted, so device access = data access.
- Brand assets live in `public/logo_kit/` (see its README). The in-app mark is
  `components/Mark.tsx`; favicons, app icons and the iOS splash are the copies
  in `public/` root wired up by `app/layout.tsx` and `public/manifest.json`.

## Version history

### 1.1.3 — 2026-09-07

Security hardening (the client-only architecture was already the main defence —
no server, no API, nothing leaves the device).

- Full set of response headers via `next.config.js` — a CSP whose teeth are
  `connect-src 'self'` (an injected script can't phone data home),
  `frame-ancestors 'none'` (no clickjacking of "Reset app"), and
  `object-src`/`base-uri`/`form-action 'none'`; plus HSTS, `X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, a deny-all
  `Permissions-Policy`, and COOP/CORP. Verified the app runs with zero CSP
  violations.
- `importBackup` strips prototype-polluting keys (JSON.parse reviver) and writes
  in a single transaction; Trends asks before importing.
- `.github/dependabot.yml` (weekly npm + actions) and a CI workflow
  (`tsc` · `next build` · `npm audit`). Removed the redundant `yarn.lock` —
  npm is the package manager.
- Known: `next-pwa@5.6.0` is unmaintained and carries build-time advisories;
  replacing it with a hand-written service worker is the next step.

### 1.1.2 — 2026-09-07

- **Accessibility**
  - Pinch-zoom is no longer disabled (was a WCAG 1.4.4 fail).
  - Faint grey text (`--hint`, and light-mode icon greys) darkened to meet
    WCAG AA contrast.
  - Keyboard focus rings no longer get clipped inside rounded cards / the nav.
  - The confirm dialog now traps focus, restores it on close, describes its
    body to screen readers, and lands on **Cancel** for destructive prompts
    (a stray Enter can't confirm a delete any more).
- **No more streak.** The Plan header showed a `{n} wk` streak that a missed
  week would break; it's now a calm "{n} this month" count, and the
  returning-after-a-gap greeting is warmer.
- **Motion** — the hidden "hold to subtract" gesture on the tally buttons now
  shows a filling bar; tallies and toggles land with a small spring overshoot
  (`--ease-spring`). All degrade under `prefers-reduced-motion`.
- The browser chrome / status-bar colour now tracks the light/dark theme
  instead of always being dark.
- Manifest cleaned up: real name and description, plus install-prompt
  screenshots.
- Boot and 404 screens show the mark + wordmark lockup (`components/Lockup.tsx`).
- Removed dead onboarding / streak CSS.

### 1.1.1 — 2026-09-07

- New brand identity — the **Wedge** mark (`public/logo_kit/`). Favicons, PWA /
  app icons (incl. dedicated maskable), the iOS splash screen and every in-app
  logo spot use it via `components/Mark.tsx`. Retired the placeholder-icon
  generator.

### 1.1.0 — 2026-09-06

- **Round tracker** — an on-course log (par / fairway / GIR / putts /
  up-and-down, hole by hole) with a stats card on finish. Drafts resume.
- **"Where you're losing shots"** — a leak diagnostic that scores driving /
  approach / short game / putting from your rounds against editable benchmarks
  (`lib/round.ts`), ranks them worst-first, trends them, and links each back to
  a scoped practice session.
- **Practice games** — scored solo challenges with a saved personal best
  (Par 18, Up & Down challenge, Distance ladder, Fairway finder; `lib/games.ts`).
- **Pre-shot routine trainer** — an editable routine (`lib/routine.ts`) with a
  read-through and a tap-to-advance rehearse mode.
- **Navigation** — bottom bar cut to four tabs (Plan · Log · Round · More);
  Trends, Games, Fixes, Prep, Library and Routine moved behind the More list.
  In-progress session/round stay one tap away (nav dots + a More resume banner).
- Full light/dark theming on every screen; backup format v3 now bundles rounds
  and games; IndexedDB schema at v5 (v4 `rounds`, v5 `games`, no-op migrations).

### 1.0.0

- Four-week range-practice plan (`lib/plan.ts`) with a session picker.
- Per-ball shot-strip logging across five areas with live notes.
- Quick and venue-limited sessions; first-run miss-read flow; daily warm-up.
- Trends charts, baseline→test compare, miss-pattern bias, JSON export/import.
- Fixes, Prep, Drill library (with in-session drill swap).
- Installable offline PWA, self-hosted fonts, theme toggle, About + reset.
