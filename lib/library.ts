// lib/library.ts
// Full drill bench (both books) + the per-session pitching focus drills.
// Pairs with plan.ts: use pitchFocus[i] for session i, and LIBRARY as a
// swap-in bench of alternates for any area.

export type LibDrill = { name: string; how: string; why: string; ref: string };
export type LibArea = { area: string; drills: LibDrill[] };
export type Focus = { name: string; how: string; sticks: string | null };

export const LIBRARY: LibArea[] = [
  {
    "area": "DRIVING (off the tee)",
    "drills": [
      {
        "name": "Stride-width stance",
        "how": "Walk a few paces, stop, keep that natural foot width as your stance.",
        "why": "A natural walking width gives you a stable base to turn against without swaying or losing balance.",
        "ref": "p.36"
      },
      {
        "name": "Weight 60% back at the top",
        "how": "Load the back foot like a boxer; keep it loaded at the top.",
        "why": "Loading into the trail side stores power and stops the reverse pivot that produces weak, fat strikes.",
        "ref": "p.37"
      },
      {
        "name": "Swing through the tees / channel",
        "how": "Two sticks a clubhead-width apart; swing through without clipping a side.",
        "why": "Clipping a gate stick is instant feedback that the club came in too steep or off its path.",
        "ref": "p.39"
      },
      {
        "name": "Turn and a swish",
        "how": "One-armed half-swings, shake hands with the target, then copy free motion.",
        "why": "Hearing the swish past the ball, not before it, means speed is arriving at impact rather than being spent early.",
        "ref": "p.40"
      },
      {
        "name": "Turn your back on the target",
        "how": "Feel your back turn to the target; point the club at it at the top.",
        "why": "A full shoulder turn builds width and coil, and pointing the club at the target sets a top position you can repeat.",
        "ref": "p.42"
      },
      {
        "name": "Sync arm-swing with body-turn",
        "how": "Drop hands to hip height before the shoulders unwind — anti-slice.",
        "why": "Letting the arms drop before the shoulders fire shallows the path and cures the over-the-top move that causes a slice.",
        "ref": "p.43"
      },
      {
        "name": "Choke down for control",
        "how": "Grip down an inch; trade a little length for a fairway found.",
        "why": "Shortening the lever tightens dispersion — usually a net gain when the fairway is narrow.",
        "ref": "p.46"
      },
      {
        "name": "Tee-height 50% rule",
        "how": "Half the ball above the crown for a sweeping strike.",
        "why": "Catching it slightly on the up launches the ball higher with less spin, so it carries further.",
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
        "why": "Settling into the middle of your feet sets a balanced address so the low point stays consistent shot to shot.",
        "ref": "p.54"
      },
      {
        "name": "Intermediate target",
        "how": "Aim over a spot a few feet ahead on the target line.",
        "why": "A spot two feet away is far easier to line up to than a flag 150 yards off.",
        "ref": "p.56"
      },
      {
        "name": "Split the difference for tempo",
        "how": "Hardest swing, laziest swing, then the middle — your ideal tempo.",
        "why": "Bracketing the extremes homes in on the rhythm you can actually repeat under pressure.",
        "ref": "p.58"
      },
      {
        "name": "Flex the right knee",
        "how": "Keep right-knee flex through the backswing to coil against.",
        "why": "Trail-knee flex gives you something to wind against instead of straightening and swaying off the ball.",
        "ref": "p.59"
      },
      {
        "name": "Learn from your shadow",
        "how": "Sun at your back; watch your weight shift the shadow right (practice swing).",
        "why": "The moving shadow shows whether weight is loading into the trail side or hanging back over the ball.",
        "ref": "p.60"
      },
      {
        "name": "Feet together",
        "how": "Mid-iron, feet ~6in apart; swing without wobbling to activate the arms.",
        "why": "With no base to push against, only a smooth arm-and-body sequence keeps you balanced — it exposes any lunge.",
        "ref": "p.62"
      },
      {
        "name": "Ball above feet",
        "how": "Hit from a ball-above-feet lie to feel the inside path, then flat ground.",
        "why": "The lie pre-sets a flatter, more inside path — the shallow angle that produces a solid iron strike.",
        "ref": "p.63"
      },
      {
        "name": "Rope swing for rhythm",
        "how": "Swing a 3ft rope; it snaps in the hitting zone — smooth speed.",
        "why": "A rope only loads and releases with smooth acceleration, so it trains effortless speed through impact.",
        "ref": "p.64"
      },
      {
        "name": "Soccer-ball release",
        "how": "Throw/spin a ball 30° left of target to feel the release.",
        "why": "Spinning a ball left of target mimics the forearm rotation that squares the face — a feel for a full release.",
        "ref": "p.65"
      },
      {
        "name": "Elbow squeeze",
        "how": "Hold a ball between the elbows to synchronise arm-swing and turn.",
        "why": "Keeping the arms connected to the chest makes them turn with the body rather than working independently.",
        "ref": "p.65"
      }
    ]
  },
  {
    "area": "CHIPPING",
    "drills": [
      {
        "name": "Brush the grass",
        "how": "Find where the club brushes the turf — that's your ball position.",
        "why": "Matching ball position to your real low point is what delivers ball-first contact.",
        "ref": "p.94"
      },
      {
        "name": "Hard-surface strike",
        "how": "Chip off a bare/hard surface to force clean ball-first contact.",
        "why": "Off a bare lie there's no margin for hitting behind it, so you learn to lead with the hands and strike down.",
        "ref": "p.95"
      },
      {
        "name": "Throw balls for height/roll",
        "how": "Underarm-throw low then high to feel carry vs run, then chip to match.",
        "why": "Underhand tosses build an instinct for carry-versus-roll that transfers straight into picking a landing spot.",
        "ref": "p.103"
      },
      {
        "name": "Upturned umbrella",
        "how": "Alternate landing chips on two targets 5yd apart for carry control.",
        "why": "A small landing target trains precise carry distance rather than just getting it somewhere on the green.",
        "ref": "p.102"
      },
      {
        "name": "Rock the shaft",
        "how": "Look at the target, feel arms and body move as one unit.",
        "why": "Moving arms and body together removes the flippy wrist action behind most fat and thin chips.",
        "ref": "p.104"
      },
      {
        "name": "Chip with putting technique",
        "how": "Putting grip and stroke, hands ahead — reliable simple chip.",
        "why": "Stripping the shot back to a putting stroke makes it dependable when nerves make a normal chip feel fiddly.",
        "ref": "p.107"
      },
      {
        "name": "Weak-grip float",
        "how": "Weaken the left hand for a higher, softer landing with less run.",
        "why": "A weaker lead hand adds loft, so the ball lands softly and stops quickly with little roll-out.",
        "ref": "p.106"
      }
    ]
  },
  {
    "area": "PITCHING (40–120 yds)",
    "drills": [
      {
        "name": "Find the swing-arc bottom",
        "how": "Practice swing; the turf-brush point is your ball position.",
        "why": "Ball position relative to your low point is the single biggest factor in clean pitch contact.",
        "ref": "p.82"
      },
      {
        "name": "Clock-face backswings",
        "how": "9 / 10 / 11 o'clock backswings to calibrate three distances.",
        "why": "Three calibrated backswing lengths give repeatable distances without changing speed or effort.",
        "ref": "p.81"
      },
      {
        "name": "Right-angle wrist hinge",
        "how": "Freeze at horizontal left arm; shaft and forearm form an L.",
        "why": "The L-shape sets the correct wrist load — too wide has no hinge, too steep hinges early and steepens the path.",
        "ref": "p.77"
      },
      {
        "name": "Distance ladder",
        "how": "Balls every 5 yds from 40→120 yds; find your favourite distance.",
        "why": "Hitting every gap exposes the numbers you're weak at and forces adjustments you'd never practise otherwise.",
        "ref": "p.83"
      },
      {
        "name": "Swing down on the backswing path",
        "how": "Two dummy backswings, then return on that exact path.",
        "why": "One thought — retrace the backswing — keeps the club on plane when pressure tempts you to steer it.",
        "ref": "p.76"
      },
      {
        "name": "Pre-set impact",
        "how": "Start from a mini impact position, then swing back to it.",
        "why": "Rehearsing from a good impact position makes it a shape you return to, not one you hunt for mid-swing.",
        "ref": "p.87"
      },
      {
        "name": "Hit the bucket",
        "how": "Pitch to land in a bucket ~35 yds out — target + authority.",
        "why": "A defined target with a carry demand builds an authoritative strike instead of a tentative lob.",
        "ref": "p.86"
      },
      {
        "name": "Right-armed swings",
        "how": "Right hand only, three-quarter swing, freewheel the release.",
        "why": "The trail hand alone can't steer or block, so it freewheels through impact and teaches a free release.",
        "ref": "p.85"
      },
      {
        "name": "Hover the club",
        "how": "Hover the head at address to start smoothly from rough.",
        "why": "Starting with the head off the ground removes the snag from thick grass and smooths the takeaway.",
        "ref": "p.84"
      }
    ]
  },
  {
    "area": "PUTTING",
    "drills": [
      {
        "name": "Match backswing to distance",
        "how": "20-foot putt with a tiny then long backswing; find the matched length.",
        "why": "Controlling pace with stroke length, not hit, is what makes lag putts finish consistently close.",
        "ref": "p.136"
      },
      {
        "name": "Check aim and stroke",
        "how": "Brush (no backswing), then long, then split — reveals aim/stroke.",
        "why": "Comparing a no-backswing tap with a full stroke shows whether misses come from aim or from the stroke path.",
        "ref": "p.137"
      },
      {
        "name": "Avoid excess wrist",
        "how": "Trap a ball at the wrist; hit 25-foot putts keeping it in place.",
        "why": "A trapped ball keeps the stroke driven by the shoulders, so the face stays square through impact.",
        "ref": "p.138"
      },
      {
        "name": "One-handed flow",
        "how": "Right hand only; group balls by feel, think pace not target.",
        "why": "One-handed putting forces you to feel pace instead of steering line — where most distance control lives.",
        "ref": "p.139"
      },
      {
        "name": "Wall / stick path",
        "how": "Stroke along a wall or stick; head still, putter tracks true.",
        "why": "A straight edge shows immediately if the putter is cutting across the ball rather than tracking the line.",
        "ref": "p.140"
      },
      {
        "name": "Find correct alignment",
        "how": "Two clubs as rails, 2yd straight putt, face square through the gate.",
        "why": "A gate proves whether your setup actually aims where you think — most players are off without knowing.",
        "ref": "p.135"
      },
      {
        "name": "Keep eyes down (coin)",
        "how": "Focus on a coin under the ball until the putt has set off.",
        "why": "Holding your gaze on the spot stops the head lifting early and pulling the putt off line.",
        "ref": "p.136"
      },
      {
        "name": "Holing ladder",
        "how": "From 12in back to 1yd, hole 5–6 each step — build confidence.",
        "why": "Banking a run of made putts sends confidence, not doubt, into the longer ones.",
        "ref": "p.142"
      },
      {
        "name": "Hit a smaller target",
        "how": "Putt at a coin from 2yd to make the hole feel huge.",
        "why": "Aiming at a coin makes the real hole look enormous by comparison, easing tension over short putts.",
        "ref": "p.142"
      },
      {
        "name": "Every putt is straight",
        "how": "Pick a spot for the break; putt straight at it, let slope do the rest.",
        "why": "Committing to a start line and trusting the slope removes the second-guessing that ruins breaking putts.",
        "ref": "p.143"
      },
      {
        "name": "Pace and line",
        "how": "Hole the same breaker firm then soft — feel the trade-off.",
        "why": "Holing one putt firm then soft shows how much break changes with speed — they're one decision, not two.",
        "ref": "p.144"
      },
      {
        "name": "Up-and-down on a slope",
        "how": "Two tees 12yd apart up/down the slope; leave within 2ft.",
        "why": "Practising from above and below the hole trains the very different pace for downhill versus uphill lag putts.",
        "ref": "p.145"
      }
    ]
  }
];

// Pitching focus drill for each of the 8 sessions, in plan order (W1S1 … W4S2).
export const PITCH_FOCUS: Focus[] = [
  {
    "name": "Find the bottom of your swing arc",
    "how": "On short grass make a firm practice swing and note where the club first brushes the ground — that low point is where the ball should sit in your stance. Hit pitches with the ball on that line; the divot should start just after it.",
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
    "how": "Drop balls every 5 yds from ~40 yds out to ~120 yds. Work from the shortest back, pitching each to the flag. The gaps force a slightly different swing each time and reveal your favourite pitching distance.",
    "sticks": null
  },
  {
    "name": "Swing down on the backswing path",
    "how": "Do two dummy backswings, watching the club go straight back then arc inside with your body turn. Make it your only downswing thought to return the club on that exact path. Simplifies pitching under pressure.",
    "sticks": null
  },
  {
    "name": "Pre-set impact",
    "how": "Set up with hips slightly open, right heel lifted, hands ahead and the shaft leaning toward the target — a mini impact position. Swing and try to return to it. Starting from a good impact position makes it easier to repeat one.",
    "sticks": null
  },
  {
    "name": "Hit the bucket for accuracy",
    "how": "Put a bucket ~35 yds away and pitch to land balls in it without a bounce first. Forces a specific target and an authoritative strike, not just anywhere on the green.",
    "sticks": null
  },
  {
    "name": "Right-armed pitch swings",
    "how": "Hold the grip halfway down with the right hand only, make three-quarter swings and let the club freewheel through impact. Trains a free release and smooth rhythm — a good Test-Day feel check.",
    "sticks": null
  }
];

// New scored area to add to the logger, matching the others:
//   Pitching — 10 balls to a ~35–65 yd target, tally CLOSE / SHORT / LONG.
export const PITCHING_DRILL =
  "Target Pitch — 10 balls to a chosen target ~35–65 yds. Tally CLOSE (within ~3 steps), SHORT, or LONG.";
