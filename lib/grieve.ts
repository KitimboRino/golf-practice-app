// Dan Grieve's drills (PGA Master Coach, Woburn GC; Golf Monthly Top 50),
// written in this app's own words from his Golf Monthly articles. One copy,
// used by the drill library (with a credit) and by the 4-week plans.
export const GRIEVE_REF = "Dan Grieve, PGA Master Coach";

export type GrieveDrill = { name: string; how: string; why: string };

export const GRIEVE: Record<string, GrieveDrill> = {
  trailFootBack: {
    name: "Trail foot back",
    how: "Slide your trail foot back and come up onto its toes so nearly all your weight sits on the lead leg. Make a few practice swings: if your weight drifts back you'll wobble or the heel will drop. Then hit chips, feeling the lead leg stay loaded.",
    why: "Leaning back moves the bottom of the swing behind the ball, so the club hits the ground first. Pinning your weight forward keeps the low point at or just past the ball.",
  },
  leadArmOnly: {
    name: "Lead arm only",
    how: "Take the trail hand off and make chipping swings with the lead arm alone, first without a ball, then with one. Let the shaft extend through the arm so the end of the grip points at your lead hip in the finish. Put the trail hand back on and copy that finish.",
    why: "Flipping with the trail hand is what sends chips thin or heavy. One arm can't flip, so you learn the release that keeps the leading edge down.",
  },
  thumbsOff: {
    name: "Thumbs off",
    how: "Make a few chipping swings with both thumbs off the grip, feeling the weight of the clubhead swing. Then put the thumbs back on as lightly as you can and hit chips with that same light feel.",
    why: "Nerves make the thumbs squeeze at the top, which turns a smooth swing into a hit at the ball. Taking them off removes that tension and brings back touch.",
  },
  trailArmOnly: {
    name: "Trail arm only",
    how: "Ball level with your lead heel on a lie the club can slide under. Rest your lead hand on your trail shoulder and hold the club in the trail hand only. Keep that shoulder snug to your body and let the club swing past your hands, so the end of the grip points at your belt buckle after impact.",
    why: "Softer, higher chips need the clubhead to release past the hands. Keeping the trail arm connected to your body lets it release without the wrists taking over.",
  },
  sameSpotThreeClubs: {
    name: "Same spot, three clubs",
    how: "Pick one landing area on the green. Chip to it with a 7-iron, then a 9-iron, then a 52° wedge, and watch how far each one runs out after landing. Repeat until you can predict the roll before you hit.",
    why: "Most golfers chip everything with one favourite wedge. Knowing how each loft lands and rolls lets you pick the club that makes the shot easy.",
  },
};

// Bunkers. The app logs a greenside bunker shot as a chip (did it land on the
// spot), so these sit in their own library section but score as chipping.
export const GRIEVE_BUNKER: Record<string, GrieveDrill> = {
  setup: {
    name: "Bunker: wriggle in, weight forward",
    how: "Wriggle both feet into the sand, wider than your shoulders, lead foot turned out. Lean so about 80% of your weight sits on the lead leg. Ball just inside your lead heel, open the face before you take your grip, hands low. Splash balls out without letting your weight drift back. No bunker at the range? Rehearse the setup, then chip from thick rough.",
    why: "Most bunker trouble starts at address. A narrow stance with your weight back moves the bottom of the swing around; a wide, forward setup makes where the club enters the sand repeatable.",
  },
  lines: {
    name: "Bunker: three lines in the sand",
    how: "Draw three lines in the sand about an inch apart and set the ball on the one nearest the target. For a shot that runs out, enter the sand on the far line with a wide, firm follow-through. For a higher, softer shot that stops, enter on the middle line and let the clubhead release under the ball. No bunker? Do the same off a mat line with a towel behind the ball.",
    why: "How much sand you take decides how much the ball spins and runs. Seeing where the club goes in turns that into a choice rather than luck.",
  },
  sandOnFace: {
    name: "Bunker: sand on the face",
    how: "With no ball, set a small clump of sand on the open clubface. Swing back and toss it over your trail shoulder at the top. Then swing through and toss it over your lead shoulder in the finish.",
    why: "If the sand falls off early, the face has turned over and lost its loft and bounce. Keeping the face open is what lets the club slide through the sand instead of digging.",
  },
  distances: {
    name: "Bunker: three distances, three wedges",
    how: "From a flat lie, splash to a short flag (about 5 yards) with your most lofted wedge, gripped down with the face wide open. Then a mid flag (about 15 yards) with a sand wedge. Then a long one with a gap wedge and less open face. Change distance with the speed of your chest turn, not a harder hit with the hands.",
    why: "One technique and three clubs is simpler than three techniques with one club, and gives you a plan for every greenside bunker.",
  },
};

export const GRIEVE_BUNKERS = [GRIEVE_BUNKER.setup, GRIEVE_BUNKER.lines, GRIEVE_BUNKER.sandOnFace, GRIEVE_BUNKER.distances];

export const GRIEVE_CHIPPING = [GRIEVE.trailFootBack, GRIEVE.leadArmOnly, GRIEVE.thumbsOff, GRIEVE.trailArmOnly, GRIEVE.sameSpotThreeClubs];

/** As a plan session's chip focus (the plans carry no "why", and no sticks). */
export const asFocus = (d: GrieveDrill) => ({ name: d.name, how: d.how, sticks: null });
