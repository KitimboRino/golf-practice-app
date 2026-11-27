// How-to videos for drills. One video per technique, matched to drills by
// name, so the "Re-test" and level variants of a drill share its video and a
// new drill with a familiar name picks one up without editing this file.
//
// Every link was checked against YouTube's oEmbed endpoint (title and channel
// below are what it returned) and chosen for showing the drill itself, from
// coaching channels where possible. Drills with no rule here get no video:
// a missing link is better than a wrong one. Opens in the system browser
// (see lib/plan.ts), never embedded.

export type DrillVideo = { url: string; title: string; channel: string };

const yt = (id: string, channel: string, title: string): DrillVideo =>
  ({ url: `https://www.youtube.com/watch?v=${id}`, channel, title });

export const VIDEOS = {
  // setup and full swing
  grip: yt("GyIiKYq8Tf4", "Britt Sharrock", "Golf Instruction: Grip Tutorial"),
  stance: yt("sxnmkAq17Xk", "Golf Distillery", "Ball Position - Where to Put the Ball in your Stance with Driver, Irons, Wedges"),
  teeHeight: yt("IdhS2O40RwU", "Ali Taylor Golf", "Correct Tee Height For Driver, Are You Losing Distance?"),
  feetTogether: yt("fFH73XecQbs", "Dan Whittaker Golf", "Feet Together Drill - Improve Balance in the Golf Swing"),
  towelArms: yt("PrVcYQPO1iE", "Jim, The Senior Golfer", "The Golf Towel Drill That Keeps You Connected"),
  stepThrough: yt("yK4vjCU_FF4", "Dan Whittaker Golf", "The Step Through Drill - Increase Club Head Speed And Improve Weight Transfer"),
  pathGate: yt("yPH3skcNkeA", "Kerrod Gray Golf", "STOP Slicing The Golf Ball - Alignment Stick Drill"),
  armDrop: yt("iyH3JMdcT2c", "Kerrod Gray Golf", "DROP THE ARMS! Downswing Sequence Drill That Instantly Improves Ball Striking"),
  backToTarget: yt("iwbHIX3IlhA", "mygolfinstructor", "Back to the Target Drill"),
  tempo: yt("i9H2jtwqHT4", "Larry Cheung", "Finding Good Tempo - Slow Fast Slow"),
  aimSpot: yt("0b8Kufz-agM", "Shawn Clement's Wisdom in Golf Lessons", "Golf Swing: Master the Intermediate Point for Accuracy!"),
  drawFade: yt("xDS1u2uJ2m4", "Michael Breed", "How to Hit a Draw AND a Fade On Command"),
  knockdown: yt("mhTT_ACfalA", "Golf Digest", "How to Master the Low Punch Shot with David Leadbetter"),
  ballAboveFeet: yt("Nprsmeto2Nk", "John Hughes Golf", "Mastering Uneven Lies - How to Hit a Ball Above Your Feet"),
  rightArm: yt("SvBG4Adsi10", "ChrisRyanGolf", "RIGHT ARM DOWNSWING DRILL"),
  ballFirst: yt("T6LMgVvmUCA", "Peter Finch Golf", "How to Hit Golf Ball First Then the Ground"),
  presetImpact: yt("gh0qM_Ocr1E", "mygolfinstructor", "Preset Impact Drill"),
  // chipping and pitching
  brushGrass: yt("M_GGNjy3PzQ", "Kellie Stenzel Golf", "Chipping Tip: Brush The Grass"),
  landingSpot: yt("KZH7GTUspSg", "SwingStation", "Chipping Drill - Hit Your Landing Spot"),
  chipLadder: yt("Q3DOS1U5oPI", "Golfshake.com", "Chipping Tips - Ladder Drill and Game"),
  puttChip: yt("2Qu7oRUDkeg", "GolfWRX", "Stickney: Use your putting stroke when chipping"),
  throwFeel: yt("3JztOhy4Xhk", "Sunshine Coast Golf Centre", "Mastering the Short Game: The Underarm Throw Technique"),
  softChip: yt("ggMFuuhg_vs", "True Swing by Erika Larkin", "How to hit an open face pitch shot with Erika Larkin, PGA"),
  upAndDown: yt("vjXAIwK6NTs", "Titleist", "Short Game Practice: Can You Shoot 21?"),
  wedgeClock: yt("UeEkXxKSxzs", "SwingStation", "Distance Control With Wedges - Clock face System"),
  wristHinge: yt("K3edSt0pIo4", "GolfNow", "How to Set the Wrists on the Backswing"),
  // putting
  puttGate: yt("YZA7DEt-MG4", "Back 2 Basics Golf", "Hitting Your Line with Richard Woodhouse | Simple Putting Drill with a Putting Gate"),
  shortPutts: yt("GXNWD7Kp2Is", "ChrisRyanGolf", "1 DRILL TO HOLE MORE SHORT PUTTS"),
  aroundWorld: yt("twzAY-WQok0", "pganewman", "Putting Drill - Around the World 4 Footers"),
  pressurePutts: yt("1BFTmsR7NU8", "Craig Salter", "How to Sink Those Pressure Putts | Pressure Putting Drill"),
  ladder369: yt("jEpMLvKLYeY", "Golf Insider", "3, 6, 9-Feet Putting Drill"),
  lag: yt("qPNIJ6Zo6Nw", "GolfNow", "Lag Putt like a pro - Putting Tips from Jim McLean"),
  eyesClosed: yt("CwfXDv-e6uE", "mygolfinstructor", "Close your Eyes Putting Drill"),
  straightPutts: yt("nvAg2BvEXF0", "GolfersRx", "All Putts Are Straight Putts"),
  puttPath: yt("xl6E0jFZ4RE", "BannLynchMcDade Golf Coaching", "How to Practice the Correct Path of the Putting Stroke"),
  puttLength: yt("ka_Mj_OSC2c", "Nick Duffy", "Putting Drill for Backswing Length"),
  headStill: yt("gRoVZsAlua8", "SwingStation", "Putting - Keep Your Head Still"),
} satisfies Record<string, DrillVideo>;

export type VideoKey = keyof typeof VIDEOS;
type RuleKey = VideoKey | "none";

// First match wins, so the order matters: putting and short-game names that
// share a word with a full-swing drill ("window", "brush", "coin", "slope")
// come before the broader rules.
const RULES: [RegExp, RuleKey][] = [
  // pitching names that would otherwise hit a putting or full-swing rule
  [/match backswing.*clock|clock.face|distance ladder|match flight to a specific number|three-quarter swing/i, "wedgeClock"],
  [/three.trajector.*(pitch|target)/i, "none"],
  // putting
  [/gate drill for a square|find correct alignment/i, "puttGate"],
  [/check aim and stroke|match backswing/i, "puttLength"],
  [/eyes down/i, "headStill"],
  [/eyes.closed|eyes shut/i, "eyesClosed"],
  [/3\/6\/9|three-ball ladder/i, "ladder369"],
  [/clock drill|around the world/i, "aroundWorld"],
  [/must-make|in a row|five-footer|must finish/i, "pressurePutts"],
  [/one-foot|from a foot|two-footer|holing|smaller target — a coin|hit a smaller target/i, "shortPutts"],
  [/lag|speed-only|on a slope|8-foot window/i, "lag"],
  [/straight putt|every putt is straight|pace and line/i, "straightPutts"],
  [/wall|stick path/i, "puttPath"],
  // chipping and pitching
  [/weak.grip|float|spin it|spin control|tight lie|one-hop/i, "softChip"],
  [/putting technique|rock the shaft|pendulum — weight forward|bump-and-run/i, "puttChip"],
  [/throw|low-and-running/i, "throwFeel"],
  [/ladder: 5, 10, 15/i, "chipLadder"],
  [/landing spot|carry-and-stop|umbrella|hit the bucket|3 club experimental/i, "landingSpot"],
  [/brush the grass|swing.arc bottom|bottom of your swing arc|hard.surface/i, "brushGrass"],
  [/up-and-down|random lie|three lies/i, "upAndDown"],
  [/wrist hinge/i, "wristHinge"],
  // setup and full swing
  [/knuckle check/i, "grip"],
  [/stride-width|good stance/i, "stance"],
  [/tee height|tee-height|tee it forward/i, "teeHeight"],
  [/feet together/i, "feetTogether"],
  [/towel under|elbow squeeze/i, "towelArms"],
  [/step-through/i, "stepThrough"],
  [/swing through the tees|channel/i, "pathGate"],
  [/sync arm/i, "armDrop"],
  [/turn your back|weight 60% back/i, "backToTarget"],
  [/tempo|one-two|split the difference|rope swing|alternate clubs, same swing/i, "tempo"],
  [/intermediate target|smaller target than the fairway/i, "aimSpot"],
  [/knock-down|knockdown|punch|high and low off|three trajectories, one club/i, "knockdown"],
  [/draw and fade|work the ball|shape and flight/i, "drawFade"],
  [/ball above feet/i, "ballAboveFeet"],
  [/right-armed|turn and a swish/i, "rightArm"],
  [/divot|contact check|thuds|compare solid/i, "ballFirst"],
  [/pre-set impact/i, "presetImpact"],
];

export function videoKeyFor(drillName: string): VideoKey | null {
  for (const [re, key] of RULES) if (re.test(drillName)) return key === "none" ? null : key;
  return null;
}

/** Sets `video` on every { name, how } drill under `data` that doesn't
 *  already have one. Mutates in place; returns the same object. */
export function attachVideos<T>(data: T): T {
  const walk = (x: unknown): void => {
    if (Array.isArray(x)) { x.forEach(walk); return; }
    if (!x || typeof x !== "object") return;
    const o = x as Record<string, unknown>;
    if (typeof o.name === "string" && typeof o.how === "string" && !o.video) {
      const key = videoKeyFor(o.name);
      if (key) o.video = VIDEOS[key].url;
    }
    Object.values(o).forEach(walk);
  };
  walk(data);
  return data;
}
