// Ported directly from the 4-week Golf Training Plan spreadsheet (Intermediate track).
// Beginner and Professional tracks are original content, same shape, written to match.
// video is optional and unset by default — a YouTube link, opened in the
// system browser rather than embedded (the app stays usable with no
// connection; video playback can't be).
export type Focus = { name: string; how: string; sticks: string | null; video?: string };
export type PuttDrill = { name: string; how: string; sticks: string | null; video?: string };
export type Session = { label: string; drive: Focus; iron: Focus; chip: Focus; putts: PuttDrill[]; };
export type Week = { id: string; short: string; title: string; focus: string; sessions: Session[]; };

export type Level = "beginner" | "intermediate" | "professional";
// existing users have no "planLevel" meta yet — default them to the plan
// they already had, unchanged, rather than silently switching content.
export const DEFAULT_LEVEL: Level = "intermediate";
export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  professional: "Professional",
};

export const IRON_DRILLS = [
  "Jump the Fence (10 balls)",
  "Step Left with Lead Foot (10 balls)",
  "Starting Line, Left, Right (10 balls)",
  "Open Stance, Closed Stance (10 balls)",
];

export const PLAN_BEGINNER: Week[] = [
  {
    "id": "beg-week1",
    "short": "Week 1",
    "title": "Grip & Stance",
    "focus": "Build one repeatable setup — grip, stance, ball position — before worrying about swing mechanics. Everything else stacks on this.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "Build a neutral grip, knuckle check",
          "how": "Hold the club so you can see two knuckles on your lead hand when you look down, and let your trail hand's palm sit facing your lead hand's palm. Waggle the clubhead gently — a neutral grip returns the face square without you steering it. Hit a few easy shots focusing only on grip, not result.",
          "sticks": null
        },
        "iron": {
          "name": "Stride-width stance, one ball position",
          "how": "Walk a couple of normal paces and stop — that natural width is your stance. Pick a spot roughly under your front armpit and always place the ball there before you swing. One consistent spot removes a whole category of mis-hit.",
          "sticks": "Lay a stick on the ground along your toe line and a second pointing at the target, crossing where the ball sits — a simple 'railroad tracks' check for stance and aim together."
        },
        "chip": {
          "name": "Setup like a pendulum — weight forward, hands ahead",
          "how": "Stand with about 60% of your weight on your front foot and the ball back in your stance, hands slightly ahead of the clubhead. Rock your shoulders back and through like a pendulum with no wrist hinge. This setup alone produces ball-then-turf contact before you add any feel for distance.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Hole everything from a foot",
            "how": "Set up 10 balls in a circle one foot from the hole and hole every single one before you move anything back. This is about building a setup you trust, not testing nerve — there should be zero misses.",
            "sticks": null
          }
        ]
      },
      {
        "label": "Session 2",
        "drive": {
          "name": "Tee it forward and just make contact",
          "how": "Tee the ball at a height where half of it sits above your driver's crown, aimed at a wide, forgiving target. Don't worry about a slice or a hook yet — the only job is middle-of-the-face contact, which you'll feel as a solid thud and see as the ball jumping, not spinning sideways hard.",
          "sticks": null
        },
        "iron": {
          "name": "Three-quarter swings for control",
          "how": "Swing back only to about hip-to-shoulder height and through to the same height on the other side. Shorter swings are far easier to control and still produce solid contact — you're trading a little distance for a lot more consistency while the fundamentals are still new.",
          "sticks": null
        },
        "chip": {
          "name": "Brush the grass before you add a ball",
          "how": "On short grass, make several practice chipping swings with no ball, and watch exactly where the clubhead brushes the turf. That spot — not a guess — is where the ball goes. Put a ball there and the club will catch it slightly on the downswing, the way a clean chip should feel.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Two-footer, same line every time",
            "how": "From two feet, putt 10 balls at the same hole without changing anything between them. This builds a repeatable stroke instead of one that reacts to the last putt's result.",
            "sticks": null
          }
        ]
      }
    ]
  },
  {
    "id": "beg-week2",
    "short": "Week 2",
    "title": "Solid Contact",
    "focus": "Turn a repeatable setup into a repeatable strike — the single biggest jump a beginner can make.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "Step-through drill for balance",
          "how": "After you swing, let your back foot step forward naturally, like you're walking toward the target. If you can't do this without stumbling, you were off balance during the swing — usually from swinging too hard. Slow down until the step-through feels easy every time.",
          "sticks": null
        },
        "iron": {
          "name": "Towel under both arms",
          "how": "Tuck a small towel under both armpits and make swings without dropping it. This keeps your arms connected to your body turn instead of swinging independently, which is the most common cause of thin and fat shots for a new swing.",
          "sticks": null
        },
        "chip": {
          "name": "One-club carry-and-stop",
          "how": "Using the same club and swing every time, chip 10 balls to the same spot and watch where they land and how far they roll out. You're building a feel for what one swing, one club actually produces — the baseline every other chip gets compared to.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Gate drill for a square strike",
            "how": "Push two tees into the green just wider than your putter head, a few inches in front of the ball. Stroke putts through the gate without clipping either tee — doing so proves the putter face is square at impact, not just aimed square at address.",
            "sticks": "Two tees form the gate; widen them if you're clipping one consistently, then narrow as you improve."
          }
        ]
      },
      {
        "label": "Session 2",
        "drive": {
          "name": "Count your 'thuds', not your results",
          "how": "Hit 10 drives and, ignoring where they go, just count how many felt like a solid, centred thud versus a rattly, off-centre hit. Awareness of strike quality, separate from direction, is what lets you fix contact first and aim second instead of chasing both at once.",
          "sticks": null
        },
        "iron": {
          "name": "Divot-after-the-ball check",
          "how": "Hit a few shots off the grass and look at your divots. A good strike takes a shallow divot that starts just in front of where the ball was. A divot that starts behind the ball, or no divot at all, tells you exactly which way to adjust — not a vague 'swing better.'",
          "sticks": null
        },
        "chip": {
          "name": "Ladder: 5, 10, 15 yards, same club",
          "how": "Using one club, chip three balls to a target 5 yards away, then three to 10 yards, then three to 15 — only changing how big your swing is, not your setup. Distance control starts with swing length, which is simpler to repeat than trying to hit shots 'softer' or 'harder.'",
          "sticks": null
        },
        "putts": [
          {
            "name": "Clock drill, four feet all around",
            "how": "Place four balls at four, six, eight, and ten o'clock around the hole, all four feet away, and putt each one. Breaks in different directions teach you to read a green rather than memorising one putt.",
            "sticks": null
          },
          {
            "name": "Lag to a towel",
            "how": "From 20 feet, putt at a towel laid down as a target zone instead of the hole itself. Landing in the zone, not holing out, is success — this is purely a speed-control drill for longer putts.",
            "sticks": null
          }
        ]
      }
    ]
  },
  {
    "id": "beg-week3",
    "short": "Week 3",
    "title": "Tempo & Short Game",
    "focus": "Smooth out your rhythm and start turning solid contact into shots that actually finish near the target.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "Count 'one-two' through the swing",
          "how": "Say 'one' silently as you start the backswing and 'two' as you reach impact, trying to make the gap between them feel even every time. A rushed transition from backswing to downswing is the most common tempo fault, and it's easy to feel once you're counting for it.",
          "sticks": null
        },
        "iron": {
          "name": "Match your tempo, not your effort",
          "how": "Hit one shot swinging as slowly as you comfortably can, then one as fast as you can while staying balanced, then split the difference. That middle tempo, not the fastest one, is usually your most solid and most consistent swing.",
          "sticks": null
        },
        "chip": {
          "name": "Low-and-running vs high-and-soft",
          "how": "Chip one ball trying to keep it low and rolling like a putt, then one trying to fly it high and stop it quickly. Feeling both extremes makes it obvious which one a given shot actually calls for, instead of hitting the same chip regardless of the situation.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Eyes-closed feel putt",
            "how": "From six feet, take one practice stroke with your eyes open, then putt the real ball with your eyes closed, trusting the stroke you just rehearsed. It's a fast way to notice if you're peeking or steering instead of trusting your setup.",
            "sticks": null
          }
        ]
      },
      {
        "label": "Session 2",
        "drive": {
          "name": "Pick a smaller target than the fairway",
          "how": "Instead of aiming at 'the fairway,' pick one specific tree, bunker edge, or marker and aim only at that. A precise, small target narrows your focus and tends to produce straighter shots than a vague wide one.",
          "sticks": null
        },
        "iron": {
          "name": "Alternate clubs, same swing",
          "how": "Hit one shot with a shorter iron, then a longer one, then back again, using the exact same tempo for both. New players often swing harder with longer clubs without meaning to — this proves the swing shouldn't change, only the club does the extra work.",
          "sticks": null
        },
        "chip": {
          "name": "Landing spot, not the hole",
          "how": "Before each chip, pick the exact spot on the green where you want the ball to land — not where you want it to finish. Aiming at a landing spot rather than the hole itself makes carry distance control far more intuitive.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Three-ball ladder, 3/6/9 feet",
            "how": "Putt three balls from three feet, then three from six, then three from nine, without resetting your routine between distances. This builds trust that your stroke scales with distance instead of needing to be relearned each time.",
            "sticks": null
          }
        ]
      }
    ]
  },
  {
    "id": "beg-week4",
    "short": "Week 4",
    "title": "Play & Test",
    "focus": "Put it together under real conditions — one shot at a time, no do-overs — and re-score your Week 1 baseline to see what actually moved.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "One ball, one swing, like it's on the course",
          "how": "Play 10 drives as if each one were your only tee shot of the hole — no re-dos, no second attempts if you mishit. This is the first time contact, tempo, and target all have to work together at once, exactly what a real round demands.",
          "sticks": "Keep the railroad-track sticks down from Week 1 and count fairways found, same as your very first session, for a clean before/after."
        },
        "iron": {
          "name": "Pick the club, commit, swing once",
          "how": "Before each shot, name the distance and pick the club you'd actually hit on the course, then play it as a single committed shot. The goal is matching your practice decision-making to real decisions, not just grooving a swing in isolation.",
          "sticks": null
        },
        "chip": {
          "name": "Random lies, one shot each",
          "how": "Drop balls in a few different, slightly awkward spots around the green — longer grass, a slope, closer to the fringe — and play one shot from each without a practice attempt first. Real short-game shots rarely come from a perfect lie.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Re-score the one-foot circle",
            "how": "Repeat Week 1's one-foot circle drill and confirm you're still holing every single one. If you're not, that's worth more attention before moving to longer putts.",
            "sticks": null
          }
        ]
      },
      {
        "label": "Session 2 — Test Day",
        "drive": {
          "name": "Re-test: tee height 50% rule, count fairways",
          "how": "Tee the ball so half sits above the driver's crown, same as any solid setup, and play your test-day drives exactly like Week 1 — one swing each, counted the same way (fairway / left / right).",
          "sticks": "Railroad-track sticks down; count exactly like Week 1 for a clean comparison."
        },
        "iron": {
          "name": "Re-run Week 1's contact check",
          "how": "Play the same number of iron shots as your very first session, in the same order, and compare how many felt like a solid thud versus how many didn't. This is your headline number for how far contact has come in four weeks.",
          "sticks": null
        },
        "chip": {
          "name": "Re-score the carry-and-stop baseline",
          "how": "Chip to the same single target you used in Week 2's carry-and-stop drill and compare how tightly your shots group now versus then.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Re-score the two-footer test",
            "how": "Repeat Week 1's two-foot repeat-the-line drill and compare makes out of 10 against your very first attempt.",
            "sticks": null
          },
          {
            "name": "Lag to a towel — re-test",
            "how": "Repeat the 20-foot lag-to-a-towel drill from Week 2 and see how much tighter your grouping around the towel has gotten.",
            "sticks": null
          }
        ]
      }
    ]
  }
];

export const PLAN_INTERMEDIATE: Week[] = [
  {
    "id": "week1",
    "short": "Week 1",
    "title": "Foundations",
    "focus": "Groove clean contact and a repeatable start line. Baseline every skill so later weeks have something to beat.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "Step into a good stance — stride-width base",
          "how": "Walk a few normal paces and stop; keep your feet where they land — that natural width is your ideal stance. Turn and address the ball without narrowing or widening. Then tilt your spine slightly away from the target so about 60% of your weight sits on your back foot.",
          "sticks": "Lay one stick on the ground pointing at your target (ball-to-target line) and a second parallel to it along your toes. This 'railroad tracks' setup shows instantly whether a miss came from aim or from swing."
        },
        "iron": {
          "name": "Heel-toe weighting for balance",
          "how": "Hit a few shots with your weight deliberately on your toes (you'll feel yourself topple forward), then a few with weight on your heels (you'll stand too tall). Now split the difference — weight even between heels and toes. That balanced middle is what a good swing needs.",
          "sticks": null
        },
        "chip": {
          "name": "Brush the grass to find ball position",
          "how": "On short grass, make a few chipping swings without a ball and note where the clubhead brushes the ground. That low point is exactly where the ball should sit in your stance. Put a ball there and you'll strike ball-then-turf, leaving a small divot just after the ball.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Try holing putts — start at 12in, move back to 1yd",
            "how": "Start close enough that you make almost everything — about a foot from the hole. Roll 5-6 balls in, then move back 6 inches and repeat, out to about a yard. Building makes first grows confidence before you tackle longer putts.",
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
          "how": "Address a mid-iron with your feet only about 6 inches apart and swing freely. If you lose balance, your body is doing too much and your arms too little. Keep going until you can swing smoothly without wobbling — it teaches your arms their proper active role.",
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
            "sticks": "On the green, lay one stick pointing at the hole on a straight putt and stroke balls alongside it — the outdoor version of the wall drill."
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
          "name": "Swing through the tees — check your path",
          "how": "Set two sticks on the ground just wider than your clubhead to form a channel, with the ball at the far end. Swing so the club travels cleanly through the channel without touching either side. Clipping a side means your path is off — the cause of curving shots.",
          "sticks": "The two sticks ARE the drill: a clubhead-width-plus channel through impact. Widen slightly at first, then narrow as you improve."
        },
        "iron": {
          "name": "Intermediate target for direction",
          "how": "Pick a spot a few feet in front of the ball on your target line — a leaf, an old divot, a mark. Aim the clubface over that spot and swing to send the ball directly over it. Starting the ball on the right line is far easier over something close than aiming at a distant flag.",
          "sticks": "Lay a stick on your ball-to-target line pointing at the target; use its far tip as the intermediate reference."
        },
        "chip": {
          "name": "Throw some balls to feel height and roll",
          "how": "Before chipping, underarm-throw a few balls at the flag — first low and running, then high and soft. Notice the low ones finish closer and more predictably. Then chip, picking clubs that recreate those throws: less loft for run, more for a soft landing.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Match backswing length to the distance",
            "how": "From about 6 yards, make a very short backswing (a couple of inches) — you'll have to jab it, which feels wrong. Then a long backswing that you must decelerate — also wrong. The right length lets the putter swing and the ball simply 'gets in the way.' Feel that matched length.",
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
          "how": "Hit one ball as hard as you can, the next as lazily slow as possible, then a third exactly halfway between. That middle swing is your ideal tempo — balanced between control and power. Spend 10 minutes grooving it; it works for every iron.",
          "sticks": null
        },
        "chip": {
          "name": "Upturned umbrella drill — height and carry",
          "how": "Set two targets (umbrellas, towels, or headcovers) about 5 yards apart, with balls 5 yards from the nearer one. Alternate landing one ball on the near target, the next on the far one. It sharpens your control of how high and how far each chip carries.",
          "sticks": "Lay a stick on the ground a clubface-width outside the ball, parallel to your target line, to train the correct inside-to-inside chipping arc."
        },
        "putts": [
          {
            "name": "Check aim and stroke — brush vs full swing",
            "how": "From a yard on a straight putt: first just brush the ball forward with no backswing — if it goes dead centre your aim is square. Then an exaggerated long backswing you must slow down. Then split the difference so the putter accelerates smoothly. Reveals both aim and stroke faults.",
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
          "how": "In the backswing, feel like you're turning your back to the target, then point the club at the target at the top. This makes a full shoulder turn and stops the club pointing left — the fault that throws the club outside the line and causes a slice.",
          "sticks": null
        },
        "iron": {
          "name": "Ball above feet to shape an inside path",
          "how": "Find a lie where the ball sits above your feet (up to a foot higher). Hit shots from there with a mid-iron — the slope naturally rounds your swing and encourages the inside path that cures a left-to-right curve. Then try to copy that feel on flat ground.",
          "sticks": null
        },
        "chip": {
          "name": "Rock the shaft — arm/body coordination",
          "how": "From about 10 yards, make practice chipping swings while looking at the target, not the ground. Feel your arms and upper body move together as one unit. Trusting your natural hand-eye touch, then hitting while that feel is fresh, produces more consistent chips.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Every putt is a straight putt",
            "how": "On a breaking putt, read the break, then pick a spot out to the side that you'd start a straight putt toward (e.g. a foot right of the hole for a foot of right-to-left break). Putt straight at that spot and let the slope do the rest — commit fully, no steering.",
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
            "how": "On a breaking putt, hole several balls from one spot using different combinations: one struck firm to take out the break, another died in softly with more break. There's more than one way in — this builds your feel for the pace/line trade-off.",
            "sticks": null
          },
          {
            "name": "Up-and-down putts on a slope",
            "how": "On a slope, set two tees about 12 yards apart, one near the top and one near the bottom. Putt back and forth, uphill and downhill. Aim to leave every ball within ~2 feet past the target — trains the speed control that prevents three-putts.",
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
          "name": "Choke down — driver as a positional club",
          "how": "Grip down the driver an inch or so and swing normally. You lose a touch of length but gain control. It reframes the tee shot around finding the fairway, not maximum distance — the book's core driving message.",
          "sticks": "Keep the railroad-track sticks down and count fairways found — accuracy is the goal this week."
        },
        "iron": {
          "name": "Use your shadow to check weight shift",
          "how": "With the sun at your back, address so the ball sits in your shadow. Swing to the top — your shadow (and weight) should move right, putting the ball in sunlight. A helper can watch that your head stays level. Practice-swing drill only; you take your eyes off the ball.",
          "sticks": null
        },
        "chip": {
          "name": "Weak grip for a soft, floated chip",
          "how": "Rotate your left hand weaker (so you barely see one knuckle) — this holds the face slightly open through impact for a higher, softer landing with less run. Alternate soft chips with normal ones to feel the difference in flight and roll.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Hit to a smaller target — a coin",
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
        "label": "Session 2 — Test Day",
        "drive": {
          "name": "Tee height 50% rule + re-check fairways found",
          "how": "Tee the ball so half of it sits above the crown of the driver — this promotes the shallow, sweeping strike a driver needs. Then play your Positional Drive under test conditions and record fairways found against Week 1.",
          "sticks": "Railroad-track sticks down; count FAIRWAY / LEFT / RIGHT exactly as Week 1 for a clean comparison."
        },
        "iron": {
          "name": "Re-run Week 1 baseline drills; compare SOLID counts",
          "how": "Play the four iron drills exactly as you did in Week 1 — same order, one attempt each, no do-overs — and compare your SOLID count to your baseline. This is your headline number for iron progress.",
          "sticks": null
        },
        "chip": {
          "name": "3 Club Experimental + Towel, scored as Week 1",
          "how": "Run the standard 3-Club Experimental and Towel drills under test conditions and score them just like Week 1, so the ON/OFF numbers are directly comparable.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Try holing putts — re-score vs Week 1",
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

export const PLAN_PROFESSIONAL: Week[] = [
  {
    "id": "pro-week1",
    "short": "Week 1",
    "title": "Shot Shape On Demand",
    "focus": "Hit the shot you choose, not the one that happens — draw, fade, and straight, on command, before adding any pressure.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "Draw and fade, same target, same tee",
          "how": "From one tee, hit three drives shaping a gentle draw at the target, then three shaping a gentle fade, keeping the start line roughly the same for both. If you can only reliably hit one shape, that's the shape that's choosing you, not the one you're choosing — this exposes it directly.",
          "sticks": "Lay a stick on your start line and another slightly closed or open to it to pre-set the face/path combination for each shape before you swing."
        },
        "iron": {
          "name": "Flight windows — knock-down and full",
          "how": "Hit the same iron two ways from the same lie: a full, normal-trajectory shot, then a knock-down with the ball back, hands forward, and a shorter finish. Taking flight out of a shot on command matters as much as shaping it left or right once you're past the fundamentals.",
          "sticks": null
        },
        "chip": {
          "name": "Spin control — same landing spot, different roll-out",
          "how": "Land three chips on the exact same spot on the green, but vary the clubface loft and swing length so one releases a long way, one checks up quickly, and one lands in between. Controlling what happens after the ball lands, not just where it lands, is a mark of a refined short game.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Must-make from six feet, ten in a row",
            "how": "Putt from six feet and don't stop until you've holed ten in a row — a miss resets the count to zero. This manufactures real pressure on a putt length that decides a lot of rounds, rather than a low-stakes bucket of balls with no cost for missing.",
            "sticks": null
          }
        ]
      },
      {
        "label": "Session 2",
        "drive": {
          "name": "Low punch driver into the wind",
          "how": "Tee the ball lower than usual and make a controlled three-quarter swing to keep the ball flight down, as if hitting into a strong headwind. Taking height off the ball on demand is a shot most mid-level players never practise and most good ones lean on often.",
          "sticks": null
        },
        "iron": {
          "name": "Work the ball both ways from one stance",
          "how": "Without changing your stance or ball position, hit one iron shot curving left-to-right and the next curving right-to-left using only face-to-path adjustments at setup. Isolating the change to setup, not an in-swing manipulation, makes the shape far more repeatable under pressure.",
          "sticks": null
        },
        "chip": {
          "name": "Tight lie, no margin for error",
          "how": "Find the tightest lie you can on the practice area — bare ground or very short grass — and hit chips that demand ball-first contact with zero room for catching it heavy. This is deliberately harder than a normal lie so a normal lie starts to feel easy by comparison.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Lag to a 3-foot circle from 30+ feet",
            "how": "From well beyond 30 feet, lag putts toward a 3-foot circle around the hole. At this level, two-putting reliably from distance is about tight speed control, not makes — track how many finish inside the circle out of ten.",
            "sticks": null
          }
        ]
      }
    ]
  },
  {
    "id": "pro-week2",
    "short": "Week 2",
    "title": "Trajectory & Spin",
    "focus": "Control what the ball does in the air and on the ground, not just where it starts.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "High and low off the same tee",
          "how": "Hit three drives trying to flight the ball noticeably higher than normal, then three noticeably lower, without changing the tee height. Needing the tee to change height to flight the ball is a sign the control is coming from setup, not from you.",
          "sticks": null
        },
        "iron": {
          "name": "Three trajectories, one club",
          "how": "With a single iron, hit a low, a normal, and a high shot to the same target, adjusting ball position and hand position rather than swinging harder or softer. This is the skill that lets you take the same club at different distances depending on what the shot calls for.",
          "sticks": null
        },
        "chip": {
          "name": "Spin it back on a receptive green",
          "how": "On a green that will hold spin, hit a handful of chips with a steep, descending strike and an open face, trying to get visible check-back on landing. A low-percentage shot for most situations, but deliberately practising it sharpens strike quality across every other chip too.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Read it, then putt with your eyes shut",
            "how": "Read a breaking putt fully, take your stance, then close your eyes for the actual stroke. If the ball finishes well off line, you're very likely making a late, visually-driven correction mid-stroke instead of trusting your read.",
            "sticks": null
          }
        ]
      },
      {
        "label": "Session 2",
        "drive": {
          "name": "Fairway finder — lightest grip you can hold",
          "how": "Play 10 drives at a fairway-width target using the lightest grip pressure you can hold without losing the club, resisting the urge to grip down harder under pressure. Tension kills clubhead speed and control together — this isolates that one variable on its own.",
          "sticks": null
        },
        "iron": {
          "name": "Match flight to a specific number",
          "how": "Pick an exact yardage that sits between two clubs and hit it with a controlled, three-quarter swing on the longer club rather than a full swing on the shorter one. Owning the in-between numbers, not just full-swing yardages, is what separates scoring clubs from range clubs.",
          "sticks": null
        },
        "chip": {
          "name": "One-hop-and-stop from 20 yards",
          "how": "From a slightly longer chip/pitch distance, try to land the ball so it takes one hop and stops close to where it lands, rather than releasing out. This usually means a steeper, more committed strike than feels natural at first.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Four around the world, must finish",
            "how": "Putt from four points around the hole, all from a testing length, and you're not finished with the drill until all four are holed in the same visit — missing one sends you back to redo that point. Builds composure on the putt that most affects scoring average.",
            "sticks": null
          },
          {
            "name": "Speed-only lag, no line judged",
            "how": "From long range, putt purely for speed to a specific distance marker, ignoring line entirely — even putts that miss left or right count as a success if the distance is right. Isolating speed from line makes it obvious which one is actually letting you down on long putts.",
            "sticks": null
          }
        ]
      }
    ]
  },
  {
    "id": "pro-week3",
    "short": "Week 3",
    "title": "Pressure & Scoring",
    "focus": "Make every rep cost something. Scoring under pressure is a separate skill from range mechanics, and it has to be trained separately too.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "One swing, one shape, called before you hit",
          "how": "Before each drive, say out loud (or to yourself) exactly which shape and trajectory you're about to hit, then play it. Committing to a specific shot before the swing, rather than reacting to whatever comes out, is what playing a tee shot under real pressure demands.",
          "sticks": null
        },
        "iron": {
          "name": "Must-stick inside a scoring zone",
          "how": "From a scoring-club distance, hit iron shots and count only the ones that finish inside a tight zone you'd be happy to putt from — not just 'on the green.' Redefine success as scoring-zone, not green-in-regulation, and the standard gets noticeably harder.",
          "sticks": null
        },
        "chip": {
          "name": "Up-and-down contest, one ball only",
          "how": "Drop a ball in a random spot around the green and play the full up-and-down — chip plus putt — counting it a success only if you get down in two. No second attempts at the chip. This mirrors the real, single-shot stakes of a short-game shot on the course.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Five-footer, three in a row or start over",
            "how": "From five feet — a length that tests nerve more than stroke — putt until you've made three in a row, going back to zero on any miss. The discomfort of restarting is the point; it's what a missed five-footer on the course actually costs you.",
            "sticks": null
          }
        ]
      },
      {
        "label": "Session 2",
        "drive": {
          "name": "Pressure fairway finder — last-ball stakes",
          "how": "Play drives in sets of three and tell yourself the third ball is the only one that counts, as if it were a tee shot on the 18th with a score on the line. Manufacturing a 'one that matters' inside low-stakes practice is the closest you can get to tournament nerves without playing a round.",
          "sticks": null
        },
        "iron": {
          "name": "Worst-shot-counts scoring test",
          "how": "Hit five approach shots to a scoring zone, but your result for the set is whichever shot finished worst, not your best. This punishes a careless miss among four good ones — the exact pattern that costs real strokes — rather than letting one great shot flatter a sloppy set.",
          "sticks": null
        },
        "chip": {
          "name": "Three lies, three clubs, one shot each",
          "how": "Play one chip each from a tight lie, a fluffy lie, and a downhill lie, choosing a different club for each without a practice swing. Deciding correctly under time pressure, with no rehearsal, is closer to what actually happens on the course than hitting the same chip repeatedly.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Must-make string across three lengths",
            "how": "Make one putt each from four, seven, and ten feet, in that order, without missing any — a miss at any length restarts the whole sequence from four feet. Stringing different lengths together under a single pressure test is harder than any one length alone.",
            "sticks": null
          },
          {
            "name": "One-shot lag, no do-over",
            "how": "From well off the green, hit exactly one lag putt — no warm-up stroke on the same line — and judge it purely by how makeable the next putt is. This matches the one-shot reality of a real long putt far better than a bucket of practice attempts from the same spot.",
            "sticks": null
          }
        ]
      }
    ]
  },
  {
    "id": "pro-week4",
    "short": "Week 4",
    "title": "Transfer & Test",
    "focus": "Play it like it's the card that matters — one shot, real consequence — and re-score the Week 1 baseline.",
    "sessions": [
      {
        "label": "Session 1",
        "drive": {
          "name": "Play the hole in your head, one tee shot",
          "how": "Pick a hole you know well, picture it fully, and hit one tee shot as if you were actually standing on it, shaping the ball to the spot that sets up the easiest next shot. Committing to a real, specific target with a real, specific shape is the whole test — not just finding the short grass.",
          "sticks": "Railroad-track sticks down for aim reference, but judge the shot on shape and finishing position, not just fairway hit or miss."
        },
        "iron": {
          "name": "Call your number, then commit",
          "how": "Pick an exact yardage, say which club and which trajectory you're using before you swing, then play it as one committed shot — no second attempts if the number doesn't match what you called. This is the same decision-and-commit test as the course, with nowhere to hide if you guessed.",
          "sticks": null
        },
        "chip": {
          "name": "Random lie up-and-downs, scored",
          "how": "Play five up-and-downs from random, unrepeated lies around the green, scoring each as a success only on getting down in two. Compare your success rate here to where it was when you first tried this drill — this is the headline number for short-game progress at this level.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Re-test the must-make five-footer",
            "how": "Repeat the five-footer, three-in-a-row-or-restart drill from Week 3 and see how much faster you get through it now versus the first time you tried it.",
            "sticks": null
          }
        ]
      },
      {
        "label": "Session 2 — Test Day",
        "drive": {
          "name": "Re-test: shape and flight on command",
          "how": "Repeat Week 1's draw-and-fade test from the same tee, calling the shape before each swing, and compare how many came out as called against your first attempt.",
          "sticks": "Railroad-track sticks down; score exactly like Week 1 for a clean comparison."
        },
        "iron": {
          "name": "Re-run the scoring-zone test",
          "how": "Repeat the must-stick scoring-zone drill from Week 3 and compare how many finished inside the zone now versus your first attempt.",
          "sticks": null
        },
        "chip": {
          "name": "Re-score the up-and-down contest",
          "how": "Repeat the random-lie up-and-down test and compare your success rate to Week 4 Session 1 and to your very first attempt.",
          "sticks": null
        },
        "putts": [
          {
            "name": "Re-test the must-make six-footer",
            "how": "Repeat Week 1's six-feet-ten-in-a-row drill and compare how many attempts it took to complete the string now versus your very first try.",
            "sticks": null
          },
          {
            "name": "Re-test the speed-only lag",
            "how": "Repeat the speed-only long lag putt drill from Week 2 and compare your distance control against your very first attempt.",
            "sticks": null
          }
        ]
      }
    ]
  }
];

export const PLANS: Record<Level, Week[]> = {
  beginner: PLAN_BEGINNER,
  intermediate: PLAN_INTERMEDIATE,
  professional: PLAN_PROFESSIONAL,
};

// combined lookup for HISTORICAL week ids — a session logged under a level
// the golfer has since switched away from must still resolve its real title
// (see SessionReceipt/Trends). Forward-looking code (cursor, current session,
// the "jump to a session" grid) should use PLANS[level], not this.
export const ALL_WEEKS: Week[] = [...PLAN_BEGINNER, ...PLAN_INTERMEDIATE, ...PLAN_PROFESSIONAL];

export const planSlotKey = (weekId: string, label: string) => `${weekId}|${label}`;
// every (week, session) slot in one level's plan, flattened — used to detect
// the moment every slot in THAT level has been logged at least once (the
// plan is "complete"), regardless of the order they were done in.
export const planSlotKeysFor = (level: Level): string[] =>
  PLANS[level].flatMap((w) => w.sessions.map((s) => planSlotKey(w.id, s.label)));
