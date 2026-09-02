// lib/faults.ts
// Faults & Fixes reference, ported from Essential Golf Skills (DK).
// Maps a logged miss pattern to its likely fault and the first fix to try.
//
// Two ways to use this:
//  1) Reference screen — render CATALOG as a lookup list on a "Fixes" tab.
//  2) Reactive coaching — after a session is logged, call detectFaults(session)
//     and surface any returned cards ("Seeing lots of right misses? …").

export type Area = "driving" | "irons" | "chipping";

export type Fault = {
  id: string;
  area: Area;
  pattern: string;   // what the golfer logged / noticed
  fault: string;     // likely cause
  fix: string;       // first thing to try
  ref: string;       // page in the book
};

export const CATALOG: Fault[] = [
  {
    id: "slice",
    area: "driving",
    pattern: "Starts left, curves hard right",
    fault: "Slice — out-to-in path from an address aimed left, with an open clubface.",
    fix: "Square your stance and shoulders to the target line, then feel the ball start right of target on an inside path into impact. Soften grip pressure for a free release.",
    ref: "p.162",
  },
  {
    id: "push",
    area: "driving",
    pattern: "Starts right, stays right",
    fault: "Push — clubhead swinging in-to-out with the face square to that path.",
    fix: "Address with your left toe in line with your right heel so the left side is cleared, and swing more left through impact. Then rebuild the feel from a normal stance.",
    ref: "p.168",
  },
  {
    id: "hook",
    area: "driving",
    pattern: "Starts right, then curves left",
    fault: "Hook — in-to-out path with a closed face, hips sliding toward the target.",
    fix: "Put a headcover on the ground ~6in inside the target line to block the inside path. Unwind your hips instead of sliding them. Check grip — see only two knuckles.",
    ref: "p.163",
  },
  {
    id: "sky",
    area: "driving",
    pattern: "Flies straight but very short (pops up)",
    fault: "Skied drive — a too-steep, narrow takeaway chopping down on the ball.",
    fix: "Widen the arc: sweep away low and slow, turn your back on the target, swing more around your body. In the downswing, sweep the ball away rather than hitting down.",
    ref: "p.166",
  },
  {
    id: "top",
    area: "driving",
    pattern: "Clips the top, ball scuttles along the ground",
    fault: "Top — posture rising through the swing, lifting the arc off the ball.",
    fix: "Hold your spine angle from address to impact. Practice clipping a tee from the ground with the driver at a constant height, then hit drives focusing on solid contact.",
    ref: "p.167",
  },
  {
    id: "heavy-chip",
    area: "chipping",
    pattern: "Lots of fat / heavy contact on chips",
    fault: "Heavy-contact scoop — trying to help the ball up; clubhead passes the hands before impact.",
    fix: "Keep your hands ahead of the clubhead through impact — hold the angle in your right wrist so the low point is at the ball, leaving the smallest divot after it.",
    ref: "p.164",
  },
  {
    id: "shank",
    area: "irons",
    pattern: "Ball shoots ~45° sideways",
    fault: "Shank — struck from the hosel; clubhead thrown out on an out-to-in path.",
    fix: "Place an obstacle behind the ball ~3in outside the target line and hit short irons. It forces the club onto the correct path so the sweet spot meets the ball.",
    ref: "p.165",
  },
  {
    id: "pull",
    area: "irons",
    pattern: "Starts left, stays left",
    fault: "Pull — out-to-in path with the face square to that path.",
    fix: "Feel the club approach from inside the line: draw your right foot back so your right toe is level with your left heel (shoulders square) to make room for an inside path.",
    ref: "p.169",
  },
];

// --- Reactive detection -------------------------------------------------
// Pass the SavedSession shape from lib/db.ts. Thresholds are deliberately
// conservative so a card only appears on a clear pattern, not a stray miss.

export type FaultHit = { fault: Fault; note: string };

export function detectFaults(s: {
  driving: { fairway: number; left: number; right: number };
  irons: { solid: number; fat: number; thin: number };
  chipping: { on: number; off: number };
}): FaultHit[] {
  const hits: FaultHit[] = [];
  const driveTotal = s.driving.fairway + s.driving.left + s.driving.right;

  // Driving: a clear directional bias (>=50% of tee shots one way, min 5 shots)
  if (driveTotal >= 5) {
    if (s.driving.right / driveTotal >= 0.5) {
      hits.push({
        fault: byId("slice"),
        note: `${s.driving.right} of ${driveTotal} tee shots missed right. Most often that's a slice — try the fix, or a push if the ball never curves back.`,
      });
    } else if (s.driving.left / driveTotal >= 0.5) {
      hits.push({
        fault: byId("hook"),
        note: `${s.driving.left} of ${driveTotal} tee shots missed left. Could be a hook (curving) or a pull (straight-left).`,
      });
    }
  }

  // Irons: fat-heavy session
  const ironTotal = s.irons.solid + s.irons.fat + s.irons.thin;
  if (ironTotal >= 8 && s.irons.fat / ironTotal >= 0.4) {
    hits.push({
      fault: byId("heavy-chip"),
      note: `Fat strikes made up a big share of this session. Keeping the hands ahead of the clubhead is the usual fix.`,
    });
  }

  // Chipping: mostly off the towel
  const chipTotal = s.chipping.on + s.chipping.off;
  if (chipTotal >= 6 && s.chipping.off / chipTotal >= 0.6) {
    hits.push({
      fault: byId("heavy-chip"),
      note: `Most chips missed the towel. If contact felt heavy, work the hands-ahead fix; otherwise revisit the height-and-roll focus drill.`,
    });
  }

  return hits;
}

function byId(id: string): Fault {
  const f = CATALOG.find((x) => x.id === id);
  if (!f) throw new Error("unknown fault " + id);
  return f;
}
