// lib/library.ts
// Full drill bench (both books) + the per-session pitching focus drills.
// Pairs with plan.ts: use PITCH_FOCUS_BY_LEVEL[level][i] for session i, and
// LIBRARY as a level-agnostic swap-in bench of alternates for any area.

import type { Level } from "@/lib/plan";

// video is optional and unset by default — a YouTube link, opened in the
// system browser rather than embedded (the app stays usable with no
// connection; video playback can't be). ref is a separate, existing field
// (a short source citation, e.g. which book) — not a link.
export type LibDrill = { name: string; how: string; why: string; ref: string; video?: string };
export type LibArea = { area: string; drills: LibDrill[] };
export type Focus = { name: string; how: string; sticks: string | null; video?: string };

export const LIBRARY: LibArea[] = [
  {
    "area": "DRIVING (off the tee)",
    "drills": [
      {
        "name": "Stride-width stance",
        "how": "Walk a few paces, stop, keep that natural foot width as your stance.",
        "why": "A natural walking width gives you a stable base to turn against without swaying or losing balance.",
        "ref": ""
      },
      {
        "name": "Weight 60% back at the top",
        "how": "Load the back foot like a boxer; keep it loaded at the top.",
        "why": "Loading into the trail side stores power and stops the reverse pivot that produces weak, fat strikes.",
        "ref": ""
      },
      {
        "name": "Swing through the tees / channel",
        "how": "Two sticks a clubhead-width apart; swing through without clipping a side.",
        "why": "Clipping a gate stick is instant feedback that the club came in too steep or off its path.",
        "ref": ""
      },
      {
        "name": "Turn and a swish",
        "how": "Right arm only, left hand in your pocket; extend toward the target through impact like a handshake, then copy that free motion with both hands.",
        "why": "Hearing the swish past the ball, not before it, means speed is arriving at impact rather than being spent early.",
        "ref": ""
      },
      {
        "name": "Turn your back on the target",
        "how": "Feel your back turn to the target; point the club at it at the top.",
        "why": "A full shoulder turn builds width and coil, and pointing the club at the target sets a top position you can repeat.",
        "ref": ""
      },
      {
        "name": "Sync arm-swing with body-turn",
        "how": "Drop hands to hip height before the shoulders unwind — anti-slice.",
        "why": "Letting the arms drop before the shoulders fire shallows the path and cures the over-the-top move that causes a slice.",
        "ref": ""
      },
      {
        "name": "Choke down for control",
        "how": "Grip down an inch; trade a little length for a fairway found.",
        "why": "Shortening the lever tightens dispersion — usually a net gain when the fairway is narrow.",
        "ref": ""
      },
      {
        "name": "Tee-height 50% rule",
        "how": "Half the ball above the crown for a sweeping strike.",
        "why": "Catching it slightly on the up launches the ball higher with less spin, so it carries further.",
        "ref": ""
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
        "ref": ""
      },
      {
        "name": "Intermediate target",
        "how": "Aim over a spot a few feet ahead on the target line.",
        "why": "A spot two feet away is far easier to line up to than a flag 150 yards off.",
        "ref": ""
      },
      {
        "name": "Split the difference for tempo",
        "how": "Hardest swing, laziest swing, then the middle — your ideal tempo.",
        "why": "Bracketing the extremes homes in on the rhythm you can actually repeat under pressure.",
        "ref": ""
      },
      {
        "name": "Flex the right knee",
        "how": "Keep right-knee flex through the backswing to coil against.",
        "why": "Trail-knee flex gives you something to wind against instead of straightening and swaying off the ball.",
        "ref": ""
      },
      {
        "name": "Learn from your shadow",
        "how": "Stand with the sun behind you and take a practice backswing — your shadow should shift onto your back foot, not hang over the ball.",
        "why": "The moving shadow shows whether weight is loading into the trail side or hanging back over the ball.",
        "ref": ""
      },
      {
        "name": "Feet together",
        "how": "Mid-iron, feet almost touching (a few inches apart); swing without wobbling to activate the arms.",
        "why": "With no base to push against, only a smooth arm-and-body sequence keeps you balanced — it exposes any lunge.",
        "ref": ""
      },
      {
        "name": "Ball above feet",
        "how": "Hit from a ball-above-feet lie to feel the inside path, then flat ground.",
        "why": "The lie pre-sets a flatter, more inside path — the shallow angle that produces a solid iron strike.",
        "ref": ""
      },
      {
        "name": "Rope swing for rhythm",
        "how": "Swing a 3ft rope; it snaps in the hitting zone — smooth speed.",
        "why": "A rope only loads and releases with smooth acceleration, so it trains effortless speed through impact.",
        "ref": ""
      },
      {
        "name": "Soccer-ball release",
        "how": "Underhand-throw a ball sidearm, spinning it to land left of target — the arm rotation mirrors how the clubface should release through impact.",
        "why": "Spinning a ball left of target mimics the forearm rotation that squares the face — a feel for a full release.",
        "ref": ""
      },
      {
        "name": "Elbow squeeze",
        "how": "Hold a ball between the elbows to synchronise arm-swing and turn.",
        "why": "Keeping the arms connected to the chest makes them turn with the body rather than working independently.",
        "ref": ""
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
        "ref": ""
      },
      {
        "name": "Hard-surface strike",
        "how": "Chip off a bare/hard surface to force clean ball-first contact.",
        "why": "Off a bare lie there's no margin for hitting behind it, so you learn to lead with the hands and strike down.",
        "ref": ""
      },
      {
        "name": "Throw balls for height/roll",
        "how": "Underarm-throw low then high to feel carry vs run, then chip to match.",
        "why": "Underhand tosses build an instinct for carry-versus-roll that transfers straight into picking a landing spot.",
        "ref": ""
      },
      {
        "name": "Upturned umbrella",
        "how": "Set two upturned umbrellas (or towels) 5yd apart; alternate landing chips on the near one, then the far one.",
        "why": "A small landing target trains precise carry distance rather than just getting it somewhere on the green.",
        "ref": ""
      },
      {
        "name": "Rock the shaft",
        "how": "Look at the target, not the ball, and rock the club back and through with arms and shoulders moving as one piece.",
        "why": "Moving arms and body together removes the flippy wrist action behind most fat and thin chips.",
        "ref": ""
      },
      {
        "name": "Chip with putting technique",
        "how": "Putting grip and stroke, hands ahead — reliable simple chip.",
        "why": "Stripping the shot back to a putting stroke makes it dependable when nerves make a normal chip feel fiddly.",
        "ref": ""
      },
      {
        "name": "Weak-grip float",
        "how": "Rotate your lead hand weaker on the grip — until you can barely see one knuckle — then chip normally.",
        "why": "A weaker lead hand adds loft, so the ball lands softly and stops quickly with little roll-out.",
        "ref": ""
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
        "ref": ""
      },
      {
        "name": "Clock-face backswings",
        "how": "9 / 10 / 11 o'clock backswings to calibrate three distances.",
        "why": "Three calibrated backswing lengths give repeatable distances without changing speed or effort.",
        "ref": ""
      },
      {
        "name": "Right-angle wrist hinge",
        "how": "Freeze at horizontal left arm; shaft and forearm form an L.",
        "why": "The L-shape sets the correct wrist load — too wide has no hinge, too steep hinges early and steepens the path.",
        "ref": ""
      },
      {
        "name": "Distance ladder",
        "how": "Balls every 5 yds from 40→120 yds; find your favourite distance.",
        "why": "Hitting every gap exposes the numbers you're weak at and forces adjustments you'd never practise otherwise.",
        "ref": ""
      },
      {
        "name": "Swing down on the backswing path",
        "how": "Two dummy backswings, then return on that exact path.",
        "why": "One thought — retrace the backswing — keeps the club on plane when pressure tempts you to steer it.",
        "ref": ""
      },
      {
        "name": "Pre-set impact",
        "how": "Set up in a mini impact position — hips slightly open, right heel lifted, hands ahead of the ball — then swing back and return to it.",
        "why": "Rehearsing from a good impact position makes it a shape you return to, not one you hunt for mid-swing.",
        "ref": ""
      },
      {
        "name": "Hit the bucket",
        "how": "Pitch to land in a bucket ~35 yds out — target + authority.",
        "why": "A defined target with a carry demand builds an authoritative strike instead of a tentative lob.",
        "ref": ""
      },
      {
        "name": "Right-armed swings",
        "how": "Right hand only, three-quarter swing, freewheel the release.",
        "why": "The trail hand alone can't steer or block, so it freewheels through impact and teaches a free release.",
        "ref": ""
      },
      {
        "name": "Hover the club",
        "how": "Hover the head at address to start smoothly from rough.",
        "why": "Starting with the head off the ground removes the snag from thick grass and smooths the takeaway.",
        "ref": ""
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
        "ref": ""
      },
      {
        "name": "Check aim and stroke",
        "how": "From a yard, tap the ball with no backswing at all, then putt with a long backswing, then one in between — compare which ones actually go straight at the hole.",
        "why": "Comparing a no-backswing tap with a full stroke shows whether misses come from aim or from the stroke path.",
        "ref": ""
      },
      {
        "name": "Avoid excess wrist",
        "how": "Trap a ball between your lead forearm and the grip; hit 25-foot putts without letting it drop.",
        "why": "A trapped ball keeps the stroke driven by the shoulders, so the face stays square through impact.",
        "ref": ""
      },
      {
        "name": "One-handed flow",
        "how": "Right hand only; group balls by feel, think pace not target.",
        "why": "One-handed putting forces you to feel pace instead of steering line — where most distance control lives.",
        "ref": ""
      },
      {
        "name": "Wall / stick path",
        "how": "Stroke along a wall or stick; head still, putter tracks true.",
        "why": "A straight edge shows immediately if the putter is cutting across the ball rather than tracking the line.",
        "ref": ""
      },
      {
        "name": "Find correct alignment",
        "how": "Two clubs as rails, 2yd straight putt, face square through the gate.",
        "why": "A gate proves whether your setup actually aims where you think — most players are off without knowing.",
        "ref": ""
      },
      {
        "name": "Keep eyes down (coin)",
        "how": "Focus on a coin under the ball until the putt has set off.",
        "why": "Holding your gaze on the spot stops the head lifting early and pulling the putt off line.",
        "ref": ""
      },
      {
        "name": "Holing ladder",
        "how": "From 12in back to 1yd, hole 5–6 each step — build confidence.",
        "why": "Banking a run of made putts sends confidence, not doubt, into the longer ones.",
        "ref": ""
      },
      {
        "name": "Hit a smaller target",
        "how": "Putt at a coin from 2yd to make the hole feel huge.",
        "why": "Aiming at a coin makes the real hole look enormous by comparison, easing tension over short putts.",
        "ref": ""
      },
      {
        "name": "Every putt is straight",
        "how": "Pick a spot for the break; putt straight at it, let slope do the rest.",
        "why": "Committing to a start line and trusting the slope removes the second-guessing that ruins breaking putts.",
        "ref": ""
      },
      {
        "name": "Pace and line",
        "how": "Hole the same breaker firm then soft — feel the trade-off.",
        "why": "Holing one putt firm then soft shows how much break changes with speed — they're one decision, not two.",
        "ref": ""
      },
      {
        "name": "Up-and-down on a slope",
        "how": "Two tees 12yd apart up/down the slope; leave within 2ft.",
        "why": "Practising from above and below the hole trains the very different pace for downhill versus uphill lag putts.",
        "ref": ""
      }
    ]
  }
];

// Pitching focus drill for each of the 8 sessions, in plan order (W1S1 … W4S2).
export const PITCH_FOCUS_BEGINNER: Focus[] = [
  {
    "name": "Land it on your own foot",
    "how": "From short range, take a small backswing and try to land the ball just past your own feet, checking that you're making ball-first contact rather than scooping. This is the very first building block of pitching — getting the ball airborne without digging or thinning it.",
    "sticks": null
  },
  {
    "name": "Clock face, two sizes only",
    "how": "Pick just two backswing lengths — hands to waist, and hands to shoulder — and hit a few pitches with each. Two repeatable sizes teaches you that backswing length, not swing speed, is what changes distance.",
    "sticks": null
  },
  {
    "name": "Same finish every time",
    "how": "Focus only on finishing in a balanced, stable position facing the target, no matter how the shot comes out. A consistent finish usually means a consistent swing got you there — work backward from the finish you want.",
    "sticks": null
  },
  {
    "name": "Bump-and-run with more club",
    "how": "From just off the green, use a more-lofted iron instead of a wedge and make a putting-style stroke, letting the ball run most of the way to the hole. This is the simplest, lowest-risk pitch shot there is, and a safe default when you're not confident.",
    "sticks": null
  },
  {
    "name": "Watch the ball come off the clubface",
    "how": "Hit a few pitches focusing only on watching the ball leave the clubface, not where it lands. Staying with the shot instead of looking up early is one of the most common fixes for mis-hit pitches at any level.",
    "sticks": null
  },
  {
    "name": "Three balls, three landing spots",
    "how": "Pick three different landing spots at different distances and hit one ball at each, changing only your backswing length between them. An early, low-pressure version of distance control, before worrying about spin or trajectory.",
    "sticks": null
  },
  {
    "name": "Pitch from a slight upslope and downslope",
    "how": "Find a small upslope and downslope near the green and hit a few pitches from each, noticing how the slope changes where the ball tends to fly. Getting used to uneven lies early means you won't be surprised by them on the course.",
    "sticks": null
  },
  {
    "name": "Test day — repeat the clock-face pitches",
    "how": "Repeat session one's two backswing lengths and see how much tighter your distance control has become. Compare carry distance for each size against your very first attempt.",
    "sticks": null
  }
];

export const PITCH_FOCUS_INTERMEDIATE: Focus[] = [
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

export const PITCH_FOCUS_PROFESSIONAL: Focus[] = [
  {
    "name": "Three trajectories to one target",
    "how": "Pitch the same distance three ways — low and running, standard, and high and soft — to the same landing area. Owning all three flights for one yardage means you're never stuck with the wrong shot for the lie or the pin position.",
    "sticks": null
  },
  {
    "name": "Spin it versus release it",
    "how": "Hit two pitches to the same spot: one designed to check up quickly, one designed to release toward the hole. Controlling roll-out after landing is as important as carry distance once you're inside wedge range.",
    "sticks": null
  },
  {
    "name": "Exact yardage, three-quarter swing only",
    "how": "Pick a precise number inside your wedge range and hit it using only backswing length, never easing off mid-swing to take pace off. A controlled three-quarter swing is more repeatable under pressure than a full swing you deliberately soften.",
    "sticks": null
  },
  {
    "name": "Must-land-short-side-safe",
    "how": "Pitch to a pin cut tight to one edge of the green and deliberately favour missing to the fat, safer side of the green rather than challenging the flag. Knowing when not to attack is as much a skill as the shot itself.",
    "sticks": null
  },
  {
    "name": "Uneven lie, same target",
    "how": "From an upslope and a downslope, pitch to the same single target and compare how far each lie tends to fly compared to flat ground. Slopes change loft at impact — adjusting club or swing for that is a repeatable skill, not luck.",
    "sticks": null
  },
  {
    "name": "One-ball, must-finish-inside-10-feet",
    "how": "Pitch from a realistic yardage and don't move on until a ball finishes inside 10 feet of the hole. Manufacturing a real pass/fail standard, rather than a bucket of balls with no bar to clear, is what makes practice transfer to the course.",
    "sticks": null
  },
  {
    "name": "Wind-adjusted trajectory call",
    "how": "Pick a wind direction (real or imagined) and choose the trajectory that holds up best in it before you swing, committing to that shape rather than a default one. Reading conditions and adjusting the shot, not just the target, is a scoring skill.",
    "sticks": null
  },
  {
    "name": "Test day — re-run the three-trajectory pitch",
    "how": "Repeat session one's three-trajectory pitch to the same target and compare how distinct and repeatable each flight is now compared to your very first attempt.",
    "sticks": null
  }
];

export const PITCH_FOCUS_BY_LEVEL: Record<Level, Focus[]> = {
  beginner: PITCH_FOCUS_BEGINNER,
  intermediate: PITCH_FOCUS_INTERMEDIATE,
  professional: PITCH_FOCUS_PROFESSIONAL,
};

// New scored area to add to the logger, matching the others:
//   Pitching — 10 balls to a ~35–65 yd target, tally CLOSE / SHORT / LONG.
export const PITCHING_DRILL =
  "Target Pitch — 10 balls to a chosen target ~35–65 yds. Tally CLOSE (within ~3 steps), SHORT, or LONG.";
