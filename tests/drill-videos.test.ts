import { describe, expect, it } from "vitest";
import { VIDEOS, videoKeyFor, faultVideo } from "@/lib/drillVideos";
import { CATALOG } from "@/lib/faults";
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

  it("gives a fault a video only where one teaches that fix", () => {
    expect(faultVideo("slice")).toBe(VIDEOS.pathGate.url);
    expect(faultVideo("fat-iron")).toBe(VIDEOS.ballFirst.url);
    expect(faultVideo("hook")).toBeUndefined();
    // every fault id it knows is a real one
    for (const id of ["slice", "fat-iron", "heavy-chip", "pitch-dig"]) expect(CATALOG.some((f) => f.id === id)).toBe(true);
  });

  it("attaches links to the plans and the library", () => {
    const week1 = PLANS.intermediate[0].sessions[0];
    const all = JSON.stringify(week1);
    expect(all).toContain("youtube.com/watch");
    const chipping = LIBRARY.flatMap((a) => a.drills ?? []).find((d) => /brush the grass/i.test(d.name));
    expect(chipping?.video).toBe(VIDEOS.brushGrass.url);
  });
});
