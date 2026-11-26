import type { Metadata } from "next";

// The public face of RangeCard: a scroll-through story of what the app does,
// in the app's own language (the five area colours, the display type, the
// ball strip). Server-rendered HTML only — no client JavaScript. The scroll
// reveals are CSS scroll-driven animations (see "Landing" in globals.css),
// so browsers without them, and anyone with reduced motion, simply see
// everything in place.

export const metadata: Metadata = {
  title: "RangeCard: Hit ten. We'll read your miss.",
  description:
    "A four-week range plan built around your one miss, and a number you watch move. Free, offline, no account. Nothing leaves your phone.",
  openGraph: {
    title: "RangeCard: Hit ten. We'll read your miss.",
    description: "A four-week range plan built around your one miss, and a number you watch move.",
    type: "website",
    images: [{ url: "/og-wide.png", width: 1200, height: 630, alt: "RangeCard: Hit ten. We'll read your miss." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RangeCard: Hit ten. We'll read your miss.",
    description: "A four-week range plan built around your one miss, and a number you watch move.",
    images: ["/og-wide.png"],
  },
};

const AREAS = [
  { key: "chipping", name: "Chipping", fill: 0.72 },
  { key: "pitching", name: "Pitching", fill: 0.6 },
  { key: "irons", name: "Irons", fill: 0.86 },
  { key: "driving", name: "Driving", fill: 0.5 },
  { key: "putting", name: "Putting", fill: 0.64 },
] as const;

// the first ten: four on line, one left, five right (the read in section 3)
const READ = ["on", "R", "on", "R", "R", "L", "on", "R", "on", "R"];

// sample strata for section 5: success rate per area, oldest first
const STRATA = [
  [40, 30, 41, 40, 50],
  [50, 40, 50, 42, 53],
  [60, 50, 56, 50, 60],
  [62, 55, 60, 55, 58],
  [70, 60, 67, 60, 64],
  [72, 64, 74, 62, 70],
];

export default function Tour() {
  return (
    <div className="landing">
      <header className="ld-bar">
        <a href="/tour" className="ld-word" aria-label="RangeCard home">RangeCard</a>
        <a href="/" className="ld-bar-cta">Open the app</a>
      </header>

      <main>
        {/* 1 — hero */}
        <section className="ld-hero" aria-labelledby="ld-h1">
          <div className="ld-wrap">
            <p className="ld-kicker">A range plan for golfers who practise alone</p>
            <h1 id="ld-h1" className="ld-h1">Hit ten.<br />We&apos;ll read your miss.</h1>
            <p className="ld-lede">
              A four-week plan built around your one miss, and a number you watch move.
              Free, offline, no account. Nothing leaves your phone.
            </p>
            <div className="ld-ctas">
              <a href="/?demo=1" className="ld-btn ld-btn-light">Look around first</a>
              <a href="/" className="ld-btn ld-btn-ghost">Start your plan</a>
            </div>
          </div>
          <div className="ld-hero-bands" aria-hidden="true">
            {AREAS.map((a, i) => (
              <div key={a.key} className={`ld-hero-band area-${a.key}`} style={{ "--i": i } as React.CSSProperties}>
                <span>{a.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2 — logging */}
        <section className="ld-sec ld-light" aria-labelledby="ld-log">
          <div className="ld-wrap ld-split">
            <div className="ld-copy rv">
              <p className="ld-num">01</p>
              <h2 id="ld-log" className="ld-h2">Every ball, one tap.</h2>
              <p className="ld-p">
                Five areas, each its own colour. Tap where the ball went and it drops into the strip.
                The number that matters, solid strike, counts up as you go. Hold to take one back.
              </p>
            </div>
            <div className="ld-phone rv" aria-hidden="true">
              <div className="ld-mini-band area-chipping folded"><b>Chipping</b><span>7/10 on</span></div>
              <div className="ld-mini-band area-pitching folded"><b>Pitching</b><span>6/10 close</span></div>
              <div className="ld-mini-band area-irons open">
                <div className="ld-mini-head"><b>Irons</b><span>struck solid</span></div>
                <div className="ld-mini-pct num">71<small>%</small></div>
                <div className="ld-mini-dots">
                  {["g", "g", "F", "g", "T", "g", "g", "", "", ""].map((d, i) => (
                    <i key={i} className={d === "g" ? "g" : d ? "m" : ""} style={{ "--d": i } as React.CSSProperties}>{d !== "g" ? d : ""}</i>
                  ))}
                </div>
                <div className="ld-mini-btns"><span className="on">Solid</span><span>Fat</span><span>Thin</span></div>
              </div>
              <div className="ld-mini-band area-driving folded"><b>Driving</b><span>Next</span></div>
              <div className="ld-mini-band area-putting folded last"><b>Putting</b><span>Next</span></div>
            </div>
          </div>
        </section>

        {/* 3 — the read */}
        <section className="ld-sec area-driving ld-band-sec" aria-labelledby="ld-read">
          <div className="ld-wrap">
            <p className="ld-num rv">02</p>
            <h2 id="ld-read" className="ld-h2 rv">Ten balls.<br />One read.</h2>
            <div className="ld-read rv" role="img" aria-label="Ten balls: four on line, one left, five right">
              {READ.map((d, i) => (
                <i key={i} className={d === "on" ? "g" : "m"} style={{ "--d": i } as React.CSSProperties}>{d !== "on" ? d : ""}</i>
              ))}
            </div>
            <p className="ld-verdict rv">Your miss goes right.</p>
            <p className="ld-p rv">
              No quiz about a swing you can&apos;t see. Hit ten with the driver and RangeCard reads the pattern,
              then names the one fault worth fixing first.
            </p>
          </div>
        </section>

        {/* 4 — the plan */}
        <section className="ld-sec ld-light" aria-labelledby="ld-plan">
          <div className="ld-wrap">
            <p className="ld-num rv">03</p>
            <h2 id="ld-plan" className="ld-h2 rv">Four weeks,<br />built around it.</h2>
            <ol className="ld-weeks">
              {[["Foundations", "Grip, aim, a setup you can repeat"], ["Control", "Start line and one chipping club"], ["Pressure", "Practice that counts like the course"], ["Transfer and test", "The same ten balls. Watch the number move"]].map(([t, d], i) => (
                <li key={t} className="ld-week rv" style={{ "--d": i } as React.CSSProperties}>
                  <span className="ld-week-n num">{i + 1}</span>
                  <b>{t}</b>
                  <span>{d}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 5 — progress */}
        <section className="ld-sec ld-ink" aria-labelledby="ld-move">
          <div className="ld-wrap ld-split">
            <div className="ld-copy">
              <p className="ld-num rv">04</p>
              <h2 id="ld-move" className="ld-h2 rv">Watch the number move.</h2>
              <p className="ld-big num rv">41<small>%</small> <span>→</span> 74<small>%</small></p>
              <p className="ld-p rv">
                Every session becomes a layer. Over a month the colours fill in, and you can see exactly
                which part of your game is growing, and which isn&apos;t.
              </p>
            </div>
            <div className="ld-strata rv" role="img" aria-label="Six sessions stacked as layers, each area's colour filling further as the weeks go on">
              {STRATA.slice().reverse().map((row, r) => (
                <div key={r} className="ld-stratum">
                  {row.map((v, i) => (
                    <span key={i} className={`area-${AREAS[i].key}`}>
                      <i style={{ "--w": v / 100, "--r": r } as React.CSSProperties} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 — on course */}
        <section className="ld-sec area-irons ld-band-sec" aria-labelledby="ld-course">
          <div className="ld-wrap ld-split">
            <div className="ld-copy">
              <p className="ld-num rv">05</p>
              <h2 id="ld-course" className="ld-h2 rv">On the course, too.</h2>
              <p className="ld-p rv">
                Log a round hole by hole: score, fairway, green, putts. RangeCard finds where the shots are
                going and sends you back to the range to fix it.
              </p>
            </div>
            <div className="ld-round rv">
              <p className="ld-round-score num">+7</p>
              <div className="ld-round-tiles">
                <span className="area-driving"><b className="num">43%</b>fairways</span>
                <span className="area-chipping"><b className="num">0/3</b>up and downs</span>
                <span className="area-putting"><b className="num">2.2</b>putts a hole</span>
              </div>
              <p className="ld-round-leak">Where you&apos;re losing shots: <b>putting</b></p>
            </div>
          </div>
        </section>

        {/* 7 — principles */}
        <section className="ld-sec ld-light" aria-labelledby="ld-yours">
          <div className="ld-wrap">
            <h2 id="ld-yours" className="ld-h2 rv">Yours, and only yours.</h2>
            <ul className="ld-points">
              <li className="rv"><b>No account</b><span>Open it and start. Nothing to sign up for.</span></li>
              <li className="rv"><b>Nothing leaves your phone</b><span>Every ball lives on your device. Back it up to a file whenever you like.</span></li>
              <li className="rv"><b>Works offline</b><span>Out on the range with no signal, it works the same.</span></li>
              <li className="rv"><b>Installs from your browser</b><span>Add it to your home screen. No app store.</span></li>
            </ul>
          </div>
        </section>

        {/* 8 — closing call */}
        <section className="ld-end" aria-labelledby="ld-end">
          <div className="ld-wrap">
            <h2 id="ld-end" className="ld-h1 rv">Your next<br />ten balls.</h2>
            <div className="ld-ctas rv">
              <a href="/" className="ld-btn ld-btn-light">Start your plan</a>
              <a href="/?demo=1" className="ld-btn ld-btn-ghost">Look around first</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="ld-foot">
        <span>RangeCard · made for the range</span>
        <span>© 2026 Kred Inc</span>
      </footer>
    </div>
  );
}
