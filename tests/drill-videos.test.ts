import { describe, expect, it } from "vitest";
import { VIDEOS, videoKeyFor, faultVideo, videoId, videoInfo, embedUrl } from "@/lib/drillVideos";
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

  it("links Dan Grieve's drills to his videos, and his club-choice video to the slope drills", () => {
    expect(videoKeyFor("Trail foot back")).toBe("grieveChipping");
    expect(videoKeyFor("Thumbs off")).toBe("grieveChipping");
    expect(videoKeyFor("Same spot, three clubs")).toBe("grieveMistakes");
    expect(videoKeyFor("Pitch from a slight upslope and downslope")).toBe("grieveMistakes");
    expect(faultVideo("heavy-chip")).toBe(VIDEOS.grieveChipping.url);
    const chipping = LIBRARY.find((a) => /chipping/i.test(a.area))!.drills;
    const grieve = chipping.filter((d) => d.ref === "Dan Grieve, PGA Master Coach");
    expect(grieve.map((d) => d.name)).toEqual(["Trail foot back", "Lead arm only", "Thumbs off", "Trail arm only", "Same spot, three clubs"]);
    expect(grieve.every((d) => !!d.video)).toBe(true);
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

  it("plays in-app through the privacy-enhanced embed", () => {
    expect(videoId("https://www.youtube.com/watch?v=YZA7DEt-MG4")).toBe("YZA7DEt-MG4");
    expect(videoId("https://youtu.be/YZA7DEt-MG4")).toBe("YZA7DEt-MG4");
    expect(videoId("https://example.com/not-a-video")).toBeNull();
    expect(videoInfo(VIDEOS.puttGate.url)).toMatchObject({ id: "YZA7DEt-MG4", channel: "Back 2 Basics Golf" });
    expect(videoInfo(VIDEOS.aimSpot.url)!.short).toBe(true);
    expect(embedUrl("YZA7DEt-MG4")).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/YZA7DEt-MG4\?/);
  });

  it("attaches links to the plans and the library", () => {
    const week1 = PLANS.intermediate[0].sessions[0];
    const all = JSON.stringify(week1);
    expect(all).toContain("youtube.com/watch");
    const chipping = LIBRARY.flatMap((a) => a.drills ?? []).find((d) => /brush the grass/i.test(d.name));
    expect(chipping?.video).toBe(VIDEOS.brushGrass.url);
  });
});
