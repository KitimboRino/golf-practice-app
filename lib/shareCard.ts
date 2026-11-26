// Renders a session/round receipt as a shareable PNG poster in the app's own
// language: an ink card, the headline number in the display face, and each
// stat as an overlapping colour band in its practice area's colour — the same
// band stack as the Log and receipt screens. Drawn once to a canvas rather
// than pulling in a DOM-to-image library for a one-screen feature. Colours
// are fixed (not theme-aware) on purpose: a card headed for someone else's
// feed needs one consistent look, not whatever theme the sender had on.

const AQUA = "#96D6E2";
const INK = "#0F1321";
const WHITE = "#FFFFFF";
const W = 1080;
const H = 1080; // square minimum; taller sessions grow to fit (1350 = 4:5 at six bands)
// area band colours and the text colour that reads on each (globals.css)
const BAND: Record<string, { bg: string; fg: string }> = {
  chipping: { bg: "#D8B26E", fg: INK },
  pitching: { bg: "#A9482F", fg: WHITE },
  irons: { bg: "#2D5E3E", fg: WHITE },
  driving: { bg: "#1E2F4D", fg: WHITE },
  putting: { bg: "#96D6E2", fg: INK },
};
const NEUTRAL = { bg: "#2A3142", fg: WHITE };

// value is pre-formatted by the caller ("4 of 10", "72%", "—") since the two
// receipts that feed this (session balls, on-course round stats) don't share
// a single "made of of" shape — a round's "Score" row, for instance, is just
// a number with no "of" at all.
export type ShareCardRow = { label: string; value: string; sub?: string; area?: string };
export type ShareCardData = {
  kicker: string;
  title: string;
  meta: string;
  big: string;
  bigCap: string;
  bigSub: string;
  rows: ShareCardRow[];
  note?: string;
  filename: string;
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length === maxLines && words.join(" ") !== lines.join(" ")) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(last + "…").width > maxWidth && last.length > 1) last = last.slice(0, -1);
    lines[maxLines - 1] = last.trimEnd() + "…";
  }
  return lines;
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
  return t.trimEnd() + "…";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// generous upper bound for the working canvas — a full 5-area session (each
// row with a club/distance tag) plus a long note can run well past the
// nominal H; drawing tall and cropping to the real content height afterward
// is simpler and safer than a separate dry-run measurement pass that has to
// stay in exact sync with the real one.
const MAX_H = 2400;

export async function renderShareCard(data: ShareCardData): Promise<Blob | null> {
  try { await document.fonts?.ready; } catch { /* best effort — fall back to system sans */ }

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = MAX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // read the real font stacks off the page instead of guessing the family
  // names next/font generated: body sans, and the display face (Archivo,
  // drawn extended like the app's headings where the canvas supports it)
  const root = getComputedStyle(document.documentElement);
  const sans = getComputedStyle(document.body).fontFamily || "Arial, sans-serif";
  const display = root.getPropertyValue("--font-display").trim() || sans;
  const ext = ctx as CanvasRenderingContext2D & { fontStretch?: string };
  const setDisplay = (weight: number, px: number) => {
    ctx.font = `${weight} ${px}px ${display}`;
    if ("fontStretch" in ext) ext.fontStretch = "expanded";
  };
  const setSans = (weight: number, px: number) => {
    ctx.font = `${weight} ${px}px ${sans}`;
    if ("fontStretch" in ext) ext.fontStretch = "normal";
  };
  const pad = 80;

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, W, MAX_H);

  // -- wordmark, kicker, title, meta --
  setDisplay(900, 38);
  ctx.fillStyle = AQUA;
  ctx.fillText("RangeCard", pad, 118);

  setSans(800, 26);
  ctx.fillStyle = WHITE;
  ctx.globalAlpha = 0.62;
  ctx.fillText(ellipsize(ctx, data.kicker.toUpperCase(), W - pad * 2), pad, 196);
  ctx.globalAlpha = 1;

  setDisplay(900, 74);
  ctx.fillStyle = WHITE;
  const titleLines = wrapText(ctx, data.title, W - pad * 2, 2);
  titleLines.forEach((l, i) => ctx.fillText(l, pad, 280 + i * 78));
  let y = 280 + (titleLines.length - 1) * 78;

  setSans(600, 30);
  ctx.globalAlpha = 0.72;
  ctx.fillText(ellipsize(ctx, data.meta, W - pad * 2), pad, y + 56);
  ctx.globalAlpha = 1;
  y += 120;

  // -- the headline number, with its caption beside it --
  setDisplay(900, 220);
  ctx.fillStyle = AQUA;
  const bigW = ctx.measureText(data.big).width;
  ctx.fillText(data.big, pad - 6, y + 190);
  const capX = pad + bigW + 30;
  setSans(800, 34);
  ctx.fillStyle = WHITE;
  const capLines = wrapText(ctx, data.bigCap, W - pad - capX, 2);
  capLines.forEach((l, i) => ctx.fillText(l, capX, y + 110 + i * 42));
  if (data.bigSub) {
    setSans(600, 28);
    ctx.globalAlpha = 0.62;
    ctx.fillText(ellipsize(ctx, data.bigSub, W - pad - capX), capX, y + 110 + capLines.length * 42 + 4);
    ctx.globalAlpha = 1;
  }
  y += 250;

  // -- the note, as a quiet quote --
  if (data.note) {
    setSans(600, 30);
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.86;
    const lines = wrapText(ctx, `“${data.note}”`, W - pad * 2, 3);
    lines.forEach((l, i) => ctx.fillText(l, pad, y + i * 42));
    ctx.globalAlpha = 1;
    y += lines.length * 42 + 30;
  }

  // -- the stats as an overlapping band stack --
  const bandH = 150, overlap = 32, bx = 40, bw = W - 80;
  y += 10;
  data.rows.forEach((r, i) => {
    const c = (r.area && BAND[r.area]) || NEUTRAL;
    const top = y + i * (bandH - overlap);
    // a soft shadow above each band so the stack reads as layers
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = -10;
    roundRect(ctx, bx, top, bw, bandH + (i === data.rows.length - 1 ? 0 : overlap), 42);
    ctx.fillStyle = c.bg;
    ctx.fill();
    ctx.restore();

    const textY = top + 60;
    setDisplay(900, 52);
    ctx.fillStyle = c.fg;
    ctx.textAlign = "right";
    ctx.fillText(r.value, bx + bw - 36, textY + 6);
    const valueW = ctx.measureText(r.value).width + 30;
    ctx.textAlign = "left";
    setDisplay(800, 40);
    ctx.fillText(ellipsize(ctx, r.label, bw - 72 - valueW), bx + 36, textY);
    if (r.sub) {
      setSans(700, 24);
      ctx.globalAlpha = 0.85;
      ctx.fillText(ellipsize(ctx, r.sub, bw - 72 - valueW), bx + 36, textY + 38);
      ctx.globalAlpha = 1;
    }
  });
  y += data.rows.length ? (data.rows.length - 1) * (bandH - overlap) + bandH : 0;

  // -- footer, bottom-anchored; the card only grows past the nominal height
  // when real content (many rows, a long note) needs the room --
  const finalH = Math.min(MAX_H, Math.max(H, y + 120));
  setSans(800, 24);
  ctx.fillStyle = WHITE;
  ctx.globalAlpha = 0.5;
  ctx.textAlign = "center";
  ctx.fillText("rangecard.app", W / 2, finalH - 46);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;

  const out = document.createElement("canvas");
  out.width = W;
  out.height = finalH;
  const outCtx = out.getContext("2d");
  if (!outCtx) return null;
  outCtx.drawImage(canvas, 0, 0, W, finalH, 0, 0, W, finalH);
  return new Promise((resolve) => out.toBlob((b) => resolve(b), "image/png", 0.95));
}

export type ShareOutcome = "shared" | "cancelled" | "downloaded" | "copied" | "failed";

// Shares the card image via the Web Share API (with text as a caption when
// files are shareable), falling back to a straight download, then to
// clipboard text if even that's unavailable. Reports what actually happened
// so the caller can toast something accurate ("Image saved" vs "Shared").
export async function shareCard(data: ShareCardData, textFallback: string): Promise<ShareOutcome> {
  const blob = await renderShareCard(data);
  if (blob) {
    const file = new File([blob], data.filename, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (nav.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({ files: [file], text: textFallback });
        return "shared";
      } catch (e) {
        // AbortError = the user closed the share sheet themselves — not a
        // failure, and falling back to a download here would be a surprise
        // second action they never asked for.
        if (e instanceof Error && e.name === "AbortError") return "cancelled";
        /* any other failure — fall through to download */
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return "downloaded";
  }
  // canvas failed entirely — last resort, the original plain-text share
  if (navigator.share) {
    try { await navigator.share({ text: textFallback }); return "shared"; }
    catch (e) { if (e instanceof Error && e.name === "AbortError") return "cancelled"; }
  }
  try {
    await navigator.clipboard?.writeText(textFallback);
    return "copied";
  } catch {
    return "failed";
  }
}
