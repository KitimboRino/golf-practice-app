// lib/library.ts
// Full drill bench (both books) + the per-session pitching focus drills.
// Pairs with plan.ts: use pitchFocus[i] for session i, and LIBRARY as a
// swap-in bench of alternates for any area.

export type LibDrill = { name: string; how: string; ref: string };
export type LibArea = { area: string; drills: LibDrill[] };
export type Focus = { name: string; how: string; sticks: string | null };

export const LIBRARY: LibArea[] = [
  {
    "area": "DRIVING (off the tee)",
    "drills": [
      {
        "name": "Stride-width stance",
        "how": "Walk a few paces, stop, keep that natural foot width as your stance.",
        "ref": "p.36"
      },
      {
        "name": "Weight 60% back at the top",
        "how": "Load the back foot like a boxer; keep it loaded at the top.",
        "ref": "p.37"
      },
      {
        "name": "Swing through the tees / channel",
        "how": "Two sticks a clubhead-width apart; swing through without clipping a side.",
        "ref": "p.39"
      },
      {
        "name": "Turn and a swish",
        "how": "One-armed half-swings, shake hands with the target, then copy free motion.",
        "ref": "p.40"
      },
      {
        "name": "Turn your back on the target",
        "how": "Feel your back turn to the target; point the club at it at the top.",
        "ref": "p.42"
      },
      {
        "name": "Sync arm-swing with body-turn",
        "how": "Drop hands to hip height before the shoulders unwind \u2014 anti-slice.",
        "ref": "p.43"
      },
      {
        "name": "Choke down for control",
        "how": "Grip down an inch; trade a little length for a fairway found.",
        "ref": "p.46"
      },
      {
        "name": "Tee-height 50% rule",
        "how": "Half the ball above the crown for a sweeping strike.",
        "ref": "p.48"
      }
    ]
  },
  {
    "area": "IRONS",
    "drills": [
      {
        "name": "Heel-toe weighting",
        "how": "Weight on toes, then heels, then split the difference for balance.",
        "ref": "p.54"
      },
      {
        "name": "Intermediate target",
        "how": "Aim over a spot a few feet ahead on the target line.",
        "ref": "p.56"
      },
      {
        "name": "Split the difference for tempo",
        "how": "Hardest swing, laziest swing, then the middle \u2014 your ideal tempo.",
        "ref": "p.58"
      },
      {
        "name": "Flex the right knee",
        "how": "Keep right-knee flex through the backswing to coil against.",
        "ref": "p.59"
      },
      {
        "name": "Learn from your shadow",
        "how": "Sun at your back; watch your weight shift the shadow right (practice swing).",
        "ref": "p.60"
      },
      {
        "name": "Feet together",
        "how": "Mid-iron, feet ~6in apart; swing without wobbling to activate the arms.",
        "ref": "p.62"
      },
      {
        "name": "Ball above feet",
        "how": "Hit from a ball-above-feet lie to feel the inside path, then flat ground.",
        "ref": "p.63"
      },
      {
        "name": "Rope swing for rhythm",
        "how": "Swing a 3ft rope; it snaps in the hitting zone \u2014 smooth speed.",
        "ref": "p.64"
      },
      {
        "name": "Soccer-ball release",
        "how": "Throw/spin a ball 30\u00b0 left of target to feel the release.",
        "ref": "p.65"
      },
      {
        "name": "Elbow squeeze",
        "how": "Hold a ball between the elbows to synchronise arm-swing and turn.",
        "ref": "p.65"
      }
    ]
  },
  {
    "area": "CHIPPING",
    "drills": [
      {
        "name": "Brush the grass",
        "how": "Find where the club brushes the turf \u2014 that's your ball position.",
        "ref": "p.94"
      },
      {
        "name": "Hard-surface strike",
        "how": "Chip off a bare/hard surface to force clean ball-first contact.",
        "ref": "p.95"
      },
      {
        "name": "Throw balls for height/roll",
        "how": "Underarm-throw low then high to feel carry vs run, then chip to match.",
        "ref": "p.103"
      },
      {
        "name": "Upturned umbrella",
        "how": "Alternate landing chips on two targets 5yd apart for carry control.",
        "ref": "p.102"
      },
      {
        "name": "Rock the shaft",
        "how": "Look at the target, feel arms and body move as one unit.",
        "ref": "p.104"
      },
      {
        "name": "Chip with putting technique",
        "how": "Putting grip and stroke, hands ahead \u2014 reliable simple chip.",
        "ref": "p.107"
      },
      {
        "name": "Weak-grip float",
        "how": "Weaken the left hand for a higher, softer landing with less run.",
        "ref": "p.106"
      }
    ]
  },
  {
    "area": "PITCHING (35\u2013110m)",
    "drills": [
      {
        "name": "Find the swing-arc bottom",
        "how": "Practice swing; the turf-brush point is your ball position.",
        "ref": "p.82"
      },
      {
        "name": "Clock-face backswings",
        "how": "9 / 10 / 11 o'clock backswings to calibrate three distances.",
        "ref": "p.81"
      },
      {
        "name": "Right-angle wrist hinge",
        "how": "Freeze at horizontal left arm; shaft and forearm form an L.",
        "ref": "p.77"
      },
      {
        "name": "Distance ladder",
        "how": "Balls every 5m from 35\u2192110m; find your favourite distance.",
        "ref": "p.83"
      },
      {
        "name": "Swing down on the backswing path",
        "how": "Two dummy backswings, then return on that exact path.",
        "ref": "p.76"
      },
      {
        "name": "Pre-set impact",
        "how": "Start from a mini impact position, then swing back to it.",
        "ref": "p.87"
      },
      {
        "name": "Hit the bucket",
        "how": "Pitch to land in a bucket ~30m out \u2014 target + authority.",
        "ref": "p.86"
      },
      {
        "name": "Right-armed swings",
        "how": "Right hand only, three-quarter swing, freewheel the release.",
        "ref": "p.85"
      },
      {
        "name": "Hover the club",
        "how": "Hover the head at address to start smoothly from rough.",
        "ref": "p.84"
      }
    ]
  },
  {
    "area": "PUTTING",
    "drills": [
      {
        "name": "Match backswing to distance",
        "how": "6m putt with a tiny then long backswing; find the matched length.",
        "ref": "p.136"
      },
      {
        "name": "Check aim and stroke",
        "how": "Brush (no backswing), then long, then split \u2014 reveals aim/stroke.",
        "ref": "p.137"
      },
      {
        "name": "Avoid excess wrist",
        "how": "Trap a ball at the wrist; hit 8m putts keeping it in place.",
        "ref": "p.138"
      },
      {
        "name": "One-handed flow",
        "how": "Right hand only; group balls by feel, think pace not target.",
        "ref": "p.139"
      },
      {
        "name": "Wall / stick path",
        "how": "Stroke along a wall or stick; head still, putter tracks true.",
        "ref": "p.140"
      },
      {
        "name": "Find correct alignment",
        "how": "Two clubs as rails, 2yd straight putt, face square through the gate.",
        "ref": "p.135"
      },
      {
        "name": "Keep eyes down (coin)",
        "how": "Focus on a coin under the ball until the putt has set off.",
        "ref": "p.136"
      },
      {
        "name": "Holing ladder",
        "how": "From 12in back to 1yd, hole 5\u20136 each step \u2014 build confidence.",
        "ref": "p.142"
      },
      {
        "name": "Hit a smaller target",
        "how": "Putt at a coin from 2yd to make the hole feel huge.",
        "ref": "p.142"
      },
      {
        "name": "Every putt is straight",
        "how": "Pick a spot for the break; putt straight at it, let slope do the rest.",
        "ref": "p.143"
      },
      {
        "name": "Pace and line",
        "how": "Hole the same breaker firm then soft \u2014 feel the trade-off.",
        "ref": "p.144"
      },
      {
        "name": "Up-and-down on a slope",
        "how": "Two tees 12yd apart up/down the slope; leave within 2ft.",
        "ref": "p.145"
      }
    ]
  }
];

// Pitching focus drill for each of the 8 sessions, in plan order (W1S1 … W4S2).
export const PITCH_FOCUS: Focus[] = [
  {
    "name": "Find the bottom of your swing arc",
    "how": "On short grass make a firm practice swing and note where the club first brushes the ground \u2014 that low point is where the ball should sit in your stance. Hit pitches with the ball on that line; the divot should start just after it.",
    "sticks": null
  },
  {
    "name": "Match backswing length to distance (clock face)",
    "how": "Picture the ball at 6 o'clock. Hit one pitch swinging your hands back to 9 o'clock, one to 10, one to 11, checking the carry after each. This calibrates three repeatable pitch distances off backswing length alone.",
    "sticks": null
  },
  {
    "name": "Right-angle wrist hinge",
    "how": "Take the club back and freeze when your left arm is horizontal: the shaft and forearm should form a right angle (an L). Too wide and the wrists haven't hinged; too steep and they've hinged too early. Groove the correct set, then hit pitches.",
    "sticks": null
  },
  {
    "name": "Distance ladder",
    "how": "Drop balls every 5m from ~35m out to ~110m. Work from the shortest back, pitching each to the flag. The gaps force a slightly different swing each time and reveal your favourite pitching distance.",
    "sticks": null
  },
  {
    "name": "Swing down on the backswing path",
    "how": "Do two dummy backswings, watching the club go straight back then arc inside with your body turn. Make it your only downswing thought to return the club on that exact path. Simplifies pitching under pressure.",
    "sticks": null
  },
  {
    "name": "Pre-set impact",
    "how": "Set up with hips slightly open, right heel lifted, hands ahead and the shaft leaning toward the target \u2014 a mini impact position. Swing and try to return to it. Starting from a good impact position makes it easier to repeat one.",
    "sticks": null
  },
  {
    "name": "Hit the bucket for accuracy",
    "how": "Put a bucket ~30m away and pitch to land balls in it without a bounce first. Forces a specific target and an authoritative strike, not just anywhere on the green.",
    "sticks": null
  },
  {
    "name": "Right-armed pitch swings",
    "how": "Hold the grip halfway down with the right hand only, make three-quarter swings and let the club freewheel through impact. Trains a free release and smooth rhythm \u2014 a good Test-Day feel check.",
    "sticks": null
  }
];

// New scored area to add to the logger, matching the others:
//   Pitching — 10 balls to a ~30–60m target, tally CLOSE / SHORT / LONG.
export const PITCHING_DRILL =
  "Target Pitch — 10 balls to a chosen target ~30–60m. Tally CLOSE (within ~3 steps), SHORT, or LONG.";
