// lib/course.ts
// On-course strategy & course management, from Essential Golf Skills (DK)
// and Golf Digest's Ultimate Drill Book. Pairs with the round tracker:
// these are the decision rules that turn tracked stats into lower scores.

export type CourseRule = { rule: string; detail: string; ref: string };
export type CourseGroup = { group: string; rules: CourseRule[] };

export const COURSE: CourseGroup[] = [
  {
    "group": "OFF THE TEE",
    "rules": [
      {
        "rule": "Position over power on tight holes",
        "detail": "You don't always need driver. A controlled ~195yd shot leaves a short iron in on most holes and keeps the ball in play. Take the club that finds the fairway, not the longest one.",
        "ref": ""
      },
      {
        "rule": "Pick a specific target, not 'the fairway'",
        "detail": "Aim at one spot \u2014 a distant tree, a bunker edge \u2014 never the fairway in general. A precise target tightens dispersion.",
        "ref": ""
      }
    ]
  },
  {
    "group": "APPROACH & PIN STRATEGY",
    "rules": [
      {
        "rule": "Aim for the centre of the green",
        "detail": "Ignore the flag by default. The middle of the green leaves a makeable putt and a big margin for error; chasing pins brings bunkers and water into play.",
        "ref": ""
      },
      {
        "rule": "Avoid 'sucker' pins",
        "detail": "A pin tucked behind a bunker or over water is bait. Stray a few paces and the penalty is severe. Aim centre; a long putt beats a hard bunker shot.",
        "ref": "p.68"
      },
      {
        "rule": "Divide a par 5 into mini-challenges",
        "detail": "Don't think 'reach in two'. Plan it as a series of positional shots \u2014 divide and conquer \u2014 so each shot has a clear, safe job.",
        "ref": "p.68"
      }
    ]
  },
  {
    "group": "TROUBLE & RECOVERY",
    "rules": [
      {
        "rule": "The 10-pace rough rule",
        "detail": "If you can't see the ball from 10 paces away, don't be a hero. Pitch out safely to the middle of the fairway and take your medicine \u2014 it saves big numbers.",
        "ref": "p.69"
      },
      {
        "rule": "Add ~5% distance from the rough at an angle",
        "detail": "Course planners measure from the fairway centre. From the rough the angle adds distance \u2014 a 165yd shot can play ~8yd longer. Check the flag position too.",
        "ref": "p.69"
      },
      {
        "rule": "Bare lie: ball back, no sand wedge",
        "detail": "Never a sand wedge off a bare lie (the sole bounces into the ball). Play the ball ~1in back in the stance for a clean, ball-first strike and a low, checking flight.",
        "ref": "p.152"
      },
      {
        "rule": "Divot: more loft, ball back, punch it",
        "detail": "In an old divot, take one more club's loft, move the ball back, hinge the wrists steeply and punch down into the back of the ball.",
        "ref": "p.153"
      }
    ]
  },
  {
    "group": "WIND",
    "rules": [
      {
        "rule": "Into wind: keep it low, club up",
        "detail": "No joy hitting a high ball into wind. Take less loft \u2014 e.g. a 5-iron for a normal 150yd 7-iron \u2014 tee lower, widen the stance ~5in, and sweep it away smoothly.",
        "ref": "p.154"
      }
    ]
  },
  {
    "group": "BUNKERS",
    "rules": [
      {
        "rule": "Greenside: open everything, hit the sand",
        "detail": "You don't hit the ball \u2014 you splash the sand 1\u20132.5in behind it. Open feet/hips/shoulders left of target, clubface open right (flag 12, face 2 o'clock, stance 10). Accelerate; follow-through longer than backswing.",
        "ref": "p.110"
      },
      {
        "rule": "Vary distance by swing length, same sand",
        "detail": "Take the same amount of sand each time and change how far the ball goes by changing backswing length \u2014 the more reliable method for most players.",
        "ref": "p.117"
      },
      {
        "rule": "Fairway bunker: clean strike, choke down",
        "detail": "Here you DO strike ball-first. Shuffle feet in for footing, choke down ~1in to offset it, and make a descending blow \u2014 ball then sand. Don't scoop.",
        "ref": "p.119"
      }
    ]
  },
  {
    "group": "MENTAL KEYS (from the drill book)",
    "rules": [
      {
        "rule": "Window of opportunity (trees)",
        "detail": "In trouble among trees, look for 'windows' to hit through \u2014 the bigger the safer. Visualise a ball through each gap, pick the least risky, then match club and swing to it.",
        "ref": "p.250"
      },
      {
        "rule": "Ruler image (bunker)",
        "detail": "Picture a 4in ruler behind the ball: the club should enter the sand and slide through about four inches beneath the ball. A mental key, not a technique change.",
        "ref": "p.252"
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// Contextual lookup for the round tracker. Read-only: every string comes
// straight from COURSE above \u2014 nothing is retyped here.

/** Find a rule by its exact `rule` text, across all groups. */
export function courseRule(rule: string): CourseRule | undefined {
  for (const g of COURSE) {
    const found = g.rules.find((r) => r.rule === rule);
    if (found) return found;
  }
  return undefined;
}

const pick = (...names: string[]): CourseRule[] =>
  names.map(courseRule).filter((r): r is CourseRule => !!r);

// General rules rotated through on holes with nothing situational to say.
const GENERAL_TIPS = [
  "Pick a specific target, not 'the fairway'",
  "Aim for the centre of the green",
  "Position over power on tight holes",
  "Avoid 'sucker' pins",
  "Window of opportunity (trees)",
];

// `missedFairway` is a resolved signal (the caller must confirm the golfer
// actually recorded a miss — the hole model defaults fairwayHit to false).
export type HoleContext = { par: 3 | 4 | 5; missedFairway: boolean };
export type HoleStrategy = { reason: string; rules: CourseRule[] };

/** The strategy nudge for a hole's current state. */
export function holeStrategy(ctx: HoleContext, holeIndex: number): HoleStrategy {
  if (ctx.par !== 3 && ctx.missedFairway) {
    return {
      reason: "Off the fairway",
      rules: pick("The 10-pace rough rule", "Aim for the centre of the green"),
    };
  }
  if (ctx.par === 5) {
    return { reason: "Par 5", rules: pick("Divide a par 5 into mini-challenges") };
  }
  if (ctx.par === 3) {
    return {
      reason: "Par 3",
      rules: pick("Aim for the centre of the green", "Avoid 'sucker' pins"),
    };
  }
  const tip = GENERAL_TIPS[holeIndex % GENERAL_TIPS.length];
  const rules = pick(tip);
  return {
    reason: "Keep in mind",
    rules: rules.length ? rules : pick("Pick a specific target, not 'the fairway'"),
  };
}
