// Ported directly from the 4-week Golf Training Plan spreadsheet.
export type Focus = { name: string; how: string; sticks: string | null };
export type PuttDrill = { name: string; how: string; sticks: string | null };
export type Session = { label: string; drive: Focus; iron: Focus; chip: Focus; putts: PuttDrill[]; };
export type Week = { id: string; short: string; title: string; focus: string; sessions: Session[]; };

export const IRON_DRILLS = [
  "Jump the Fence (10 balls)",
  "Step Left with Lead Foot (10 balls)",
  "Starting Line, Left, Right (10 balls)",
  "Open Stance, Closed Stance (10 balls)",
];

export const PLAN: Week[] = [
  {
    "id": "week1",
    "short": "Week 1",
    "title": "Foundations",
    "focus": "Groove clean contact and a repeatable start line. Baseline every skill so later weeks have something to beat.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "Step into a good stance \u2014 stride-width base",
          "how": "Walk a few normal paces and stop; keep your feet where they land \u2014 that natural width is your ideal stance. Turn and address the ball without narrowing or widening. Then tilt your spine slightly away from the target so about 60% of your weight sits on your back foot.",
          "sticks": "Lay one stick on the ground pointing at your target (ball-to-target line) and a second parallel to it along your toes. This 'railroad tracks' setup shows instantly whether a miss came from aim or from swing."
        },
        "iron": {
          "name": "Heel-toe weighting for balance",
          "how": "Hit a few shots with your weight deliberately on your toes (you'll feel yourself topple forward), then a few with weight on your heels (you'll stand too tall). Now split the difference \u2014 weight even between heels and toes. That balanced middle is what a good swing needs.",
          "sticks": null
        },
        "chip": {
          "name": "Brush the grass to find ball position",
          "how": "On short grass, make a few chipping swings without a ball and note where the clubhead brushes the ground. That low point is exactly where the ball should sit in your stance. Put a ball there and you'll strike ball-then-turf, leaving a small divot just after the ball.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Try holing putts \u2014 start at 12in, move back to 1yd",
            "how": "Start close enough that you make almost everything \u2014 about a foot from the hole. Roll 5-6 balls in, then move back 6 inches and repeat, out to about a yard. Building makes first grows confidence before you tackle longer putts.",
            "sticks": null
          }
        ]
      },
      {
        "label": "Session 2",
        "drive": {
          "name": "Plant your weight 60% back at the top",
          "how": "Like a boxer loading the back foot before a punch, start with weight favouring your right side, then feel it stay loaded there at the top of the backswing. This sets up the weight transfer that delivers power into the ball.",
          "sticks": null
        },
        "iron": {
          "name": "Feet together to improve arm-swing",
          "how": "Address a mid-iron with your feet only about 6 inches apart and swing freely. If you lose balance, your body is doing too much and your arms too little. Keep going until you can swing smoothly without wobbling \u2014 it teaches your arms their proper active role.",
          "sticks": null
        },
        "chip": {
          "name": "Play off a hard surface for a clean strike",
          "how": "Chip a few balls off a bare, hard surface like a path (use an old wedge you don't mind scratching). Ball back in stance, hands ahead. There's no margin for hitting the ground first, so it forces clean ball-first contact. Real chips off grass then feel easy.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Stand against a wall to groove the path",
            "how": "At home, address the ball with your head lightly touching a wall, and stroke medium putts along the base of the wall. Watch the putter track straight back, arc slightly inside as it lengthens, then return square. Five minutes trains a repeatable path.",
            "sticks": "On the green, lay one stick pointing at the hole on a straight putt and stroke balls alongside it \u2014 the outdoor version of the wall drill."
          }
        ]
      }
    ]
  },
  {
    "id": "week2",
    "short": "Week 2",
    "title": "Control",
    "focus": "Tighten start-line dispersion and commit to one chipping club. Match putting backswing length to distance.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "Swing through the tees \u2014 check your path",
          "how": "Set two sticks on the ground just wider than your clubhead to form a channel, with the ball at the far end. Swing so the club travels cleanly through the channel without touching either side. Clipping a side means your path is off \u2014 the cause of curving shots.",
          "sticks": "The two sticks ARE the drill: a clubhead-width-plus channel through impact. Widen slightly at first, then narrow as you improve."
        },
        "iron": {
          "name": "Intermediate target for direction",
          "how": "Pick a spot a few feet in front of the ball on your target line \u2014 a leaf, an old divot, a mark. Aim the clubface over that spot and swing to send the ball directly over it. Starting the ball on the right line is far easier over something close than aiming at a distant flag.",
          "sticks": "Lay a stick on your ball-to-target line pointing at the target; use its far tip as the intermediate reference."
        },
        "chip": {
          "name": "Throw some balls to feel height and roll",
          "how": "Before chipping, underarm-throw a few balls at the flag \u2014 first low and running, then high and soft. Notice the low ones finish closer and more predictably. Then chip, picking clubs that recreate those throws: less loft for run, more for a soft landing.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Match backswing length to the distance",
            "how": "From about 6 yards, make a very short backswing (a couple of inches) \u2014 you'll have to jab it, which feels wrong. Then a long backswing that you must decelerate \u2014 also wrong. The right length lets the putter swing and the ball simply 'gets in the way.' Feel that matched length.",
            "sticks": null
          }
        ]
      },
      {
        "label": "Session 2",
        "drive": {
          "name": "Turn and a Swish for a natural swing",
          "how": "Without a club, put your left hand in your pocket and make half-swings with the right arm, feeling like you 'shake hands' with the target through impact. Then hold the driver and copy that free, unforced motion. It restores rhythm when the swing feels mechanical.",
          "sticks": null
        },
        "iron": {
          "name": "Split the difference for ideal swing speed",
          "how": "Hit one ball as hard as you can, the next as lazily slow as possible, then a third exactly halfway between. That middle swing is your ideal tempo \u2014 balanced between control and power. Spend 10 minutes grooving it; it works for every iron.",
          "sticks": null
        },
        "chip": {
          "name": "Upturned umbrella drill \u2014 height and carry",
          "how": "Set two targets (umbrellas, towels, or headcovers) about 5 yards apart, with balls 5 yards from the nearer one. Alternate landing one ball on the near target, the next on the far one. It sharpens your control of how high and how far each chip carries.",
          "sticks": "Lay a stick on the ground a clubface-width outside the ball, parallel to your target line, to train the correct inside-to-inside chipping arc."
        },
        "putts": [
          {
            "name": "Check aim and stroke \u2014 brush vs full swing",
            "how": "From a yard on a straight putt: first just brush the ball forward with no backswing \u2014 if it goes dead centre your aim is square. Then an exaggerated long backswing you must slow down. Then split the difference so the putter accelerates smoothly. Reveals both aim and stroke faults.",
            "sticks": null
          },
          {
            "name": "8-foot window putts",
            "how": "Same as your 6-foot window drill but from 8 feet: roll putts and count how many stop within a window just past the hole. Tracks whether your pace holds up as distance grows.",
            "sticks": "Two sticks (or two tees) just past the hole form a 'gate' the ball must finish inside."
          }
        ]
      }
    ]
  },
  {
    "id": "week3",
    "short": "Week 3",
    "title": "Pressure",
    "focus": "Add consequence: tighter targets, mixed distances, and putts that test speed on slopes.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "Turn your back on the target for power",
          "how": "In the backswing, feel like you're turning your back to the target, then point the club at the target at the top. This makes a full shoulder turn and stops the club pointing left \u2014 the fault that throws the club outside the line and causes a slice.",
          "sticks": null
        },
        "iron": {
          "name": "Ball above feet to shape an inside path",
          "how": "Find a lie where the ball sits above your feet (up to a foot higher). Hit shots from there with a mid-iron \u2014 the slope naturally rounds your swing and encourages the inside path that cures a left-to-right curve. Then try to copy that feel on flat ground.",
          "sticks": null
        },
        "chip": {
          "name": "Rock the shaft \u2014 arm/body coordination",
          "how": "From about 10 yards, make practice chipping swings while looking at the target, not the ground. Feel your arms and upper body move together as one unit. Trusting your natural hand-eye touch, then hitting while that feel is fresh, produces more consistent chips.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Every putt is a straight putt",
            "how": "On a breaking putt, read the break, then pick a spot out to the side that you'd start a straight putt toward (e.g. a foot right of the hole for a foot of right-to-left break). Putt straight at that spot and let the slope do the rest \u2014 commit fully, no steering.",
            "sticks": null
          },
          {
            "name": "8-foot window putts",
            "how": "Roll 8-footers and count how many finish in a window just past the hole. Keeps pace control honest at a distance where three-putts creep in.",
            "sticks": "Two sticks past the hole as a finishing gate."
          }
        ]
      },
      {
        "label": "Session 2",
        "drive": {
          "name": "Sync arm-swing with body-turn (anti-slice)",
          "how": "From the top, feel your hands and arms drop the club to about hip height BEFORE your shoulders start unwinding. Most slices come from the upper body spinning out too early. Get the sequence right and you'll strike it more solidly and stop cutting across the ball.",
          "sticks": null
        },
        "iron": {
          "name": "Flex the right knee for resistance",
          "how": "At address, set a little flex in your right knee and keep it there through the backswing. It stops your hips over-turning and gives your upper body something to coil against. If the knee straightens you're likely reverse-pivoting; if it slides right, you're swaying.",
          "sticks": null
        },
        "chip": {
          "name": "Chip using your putting technique",
          "how": "For a simple greenside chip, use your putting grip and stroke. Lean the shaft toward the target with hands ahead of the ball, then swing like a long putt, keeping the hands leading. Many tour players use this for its reliability on straightforward chips.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Experiment with pace and line",
            "how": "On a breaking putt, hole several balls from one spot using different combinations: one struck firm to take out the break, another died in softly with more break. There's more than one way in \u2014 this builds your feel for the pace/line trade-off.",
            "sticks": null
          },
          {
            "name": "Up-and-down putts on a slope",
            "how": "On a slope, set two tees about 12 yards apart, one near the top and one near the bottom. Putt back and forth, uphill and downhill. Aim to leave every ball within ~2 feet past the target \u2014 trains the speed control that prevents three-putts.",
            "sticks": null
          }
        ]
      }
    ]
  },
  {
    "id": "week4",
    "short": "Week 4",
    "title": "Transfer & Test",
    "focus": "Simulate the course: play each shot once, no do-overs, and re-score the Week 1 baselines to measure gains.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "Choke down \u2014 driver as a positional club",
          "how": "Grip down the driver an inch or so and swing normally. You lose a touch of length but gain control. It reframes the tee shot around finding the fairway, not maximum distance \u2014 the book's core driving message.",
          "sticks": "Keep the railroad-track sticks down and count fairways found \u2014 accuracy is the goal this week."
        },
        "iron": {
          "name": "Use your shadow to check weight shift",
          "how": "With the sun at your back, address so the ball sits in your shadow. Swing to the top \u2014 your shadow (and weight) should move right, putting the ball in sunlight. A helper can watch that your head stays level. Practice-swing drill only; you take your eyes off the ball.",
          "sticks": null
        },
        "chip": {
          "name": "Weak grip for a soft, floated chip",
          "how": "Rotate your left hand weaker (so you barely see one knuckle) \u2014 this holds the face slightly open through impact for a higher, softer landing with less run. Alternate soft chips with normal ones to feel the difference in flight and roll.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Hit to a smaller target \u2014 a coin",
            "how": "Place a coin on the green and putt balls at it from a couple of yards, trying to hit the coin. Aiming at something small makes the hole feel huge afterward. Best done just before a round for a confidence boost.",
            "sticks": null
          },
          {
            "name": "Up-and-down putts on a slope",
            "how": "Repeat the uphill/downhill slope drill from Week 3, aiming to leave each ball within 2 feet. Your speed control should be noticeably sharper than three weeks ago.",
            "sticks": null
          }
        ]
      },
      {
        "label": "Session 2 \u2014 Test Day",
        "drive": {
          "name": "Tee height 50% rule + re-check fairways found",
          "how": "Tee the ball so half of it sits above the crown of the driver \u2014 this promotes the shallow, sweeping strike a driver needs. Then play your Positional Drive under test conditions and record fairways found against Week 1.",
          "sticks": "Railroad-track sticks down; count FAIRWAY / LEFT / RIGHT exactly as Week 1 for a clean comparison."
        },
        "iron": {
          "name": "Re-run Week 1 baseline drills; compare SOLID counts",
          "how": "Play the four iron drills exactly as you did in Week 1 \u2014 same order, one attempt each, no do-overs \u2014 and compare your SOLID count to your baseline. This is your headline number for iron progress.",
          "sticks": null
        },
        "chip": {
          "name": "3 Club Experimental + Towel, scored as Week 1",
          "how": "Run the standard 3-Club Experimental and Towel drills under test conditions and score them just like Week 1, so the ON/OFF numbers are directly comparable.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Try holing putts \u2014 re-score vs Week 1",
            "how": "Repeat the Week 1 holing ladder from a foot out to a yard and compare makes. Simple, and a clear read on short-putt confidence.",
            "sticks": null
          },
          {
            "name": "Up-and-down putts on a slope",
            "how": "Final speed-control test on a slope; leave each ball within 2 feet.",
            "sticks": null
          }
        ]
      }
    ]
  }
];
