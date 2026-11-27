import { describe, expect, it } from "vitest";
import { VIDEOS, videoKeyFor } from "@/lib/drillVideos";
import { PLANS } from "@/lib/plan";
import { LIBRARY } from "@/lib/library";

describe("drill videos", () => {
  it("every link is a YouTube watch URL with an 11-character id", () => {
    for (const v of Object.values(VIDEOS)) expect(v.url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
  });

  it("re-tests share the original drill's video", () => {
    expect(videoKeyFor("Lag to a towel — re-test")).toBe(videoKeyFor("Lag to a towel"));
    expect(videoKeyFor("Re-score the one-foot circle")).toBe(videoKeyFor("Hole everything from a foot"));
  });

  it("keeps same-word drills from different areas apart", () => {
    expect(videoKeyFor("Gate drill for a square strike")).toBe("puttGate");
    expect(videoKeyFor("Swing through the tees — check your path")).toBe("pathGate");
    expect(videoKeyFor("Match backswing length to distance (clock face)")).toBe("wedgeClock");
    expect(videoKeyFor("Match backswing to distance")).toBe("puttLength");
    expect(videoKeyFor("Check aim and stroke — brush vs full swing")).toBe("puttLength");
  });

  it("leaves a drill with no good match empty rather than guessing", () => {
    expect(videoKeyFor("Three trajectories to one target")).toBeNull();
    expect(videoKeyFor("Play the hole in your head, one tee shot")).toBeNull();
  });

  it("attaches links to the plans and the library", () => {
    const week1 = PLANS.intermediate[0].sessions[0];
    const all = JSON.stringify(week1);
    expect(all).toContain("youtube.com/watch");
    const chipping = LIBRARY.flatMap((a) => a.drills ?? []).find((d) => /brush the grass/i.test(d.name));
    expect(chipping?.video).toBe(VIDEOS.brushGrass.url);
  });
});
