// Renders a session/round receipt as a shareable PNG — the same hero+sheet
// language as the in-app receipt (aqua header, ink body), drawn once to a
// canvas rather than pulling in a DOM-to-image library (html2canvas etc.)
// for a one-screen feature. Colors are fixed (not theme-aware) on purpose,
// same reasoning as the nav pill: a card headed for someone else's feed
// needs one consistent brand look, not whatever theme the sender had on.

const AQUA = "#96D6E2";
const INK = "#0F1321";
const WHITE = "#FFFFFF";
const W = 1080;
const H = 1350;

// the real brand mark (components/Mark.tsx), drawn via its own SVG path data
// so the canvas version never drifts from the app's actual logo. Built lazily
// inside renderShareCard (not here at module scope) — Path2D is browser-only
// and this file loads during Next's SSR pass too, where it doesn't exist.
const MARK_PATH_D =
  "M42 20C22 20 6 36 6 56L6 130C6 172 40 206 82 206C124 206 174 192 188 152C198 124 182 96 156 94C132 92 108 84 94 66C82 50 68 20 42 20Z";
const MARK_BALL = { cx: 168, cy: 46, r: 28 };

// value is pre-formatted by the caller ("4 of 10", "72%", "—") since the two
// receipts that feed this (session balls, on-course round stats) don't share
// a single "made of of" shape — a round's "Score" row, for instance, is just
// a number with no "of" at all.
export type ShareCardRow = { label: string; value: string; sub?: string };
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

function roundRectTop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
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

  // the real receipt card (SessionReceipt/RoundSummary) never uses the display
  // face — .receipt-h/.receipt-delta/etc. are all the body sans at heavy
  // weights — so read the actual resolved font stack off a live element
  // instead of guessing a family name next/font may have renamed internally.
  const sans = getComputedStyle(document.body).fontFamily || "Arial, sans-serif";
  const pad = 72;

  // -- aqua header --
  ctx.fillStyle = AQUA;
  ctx.fillRect(0, 0, W, MAX_H);

  ctx.fillStyle = INK;
  ctx.save();
  ctx.translate(pad, 70);
  ctx.scale(0.17, 0.17);
  ctx.fill(new Path2D(MARK_PATH_D));
  ctx.beginPath();
  ctx.arc(MARK_BALL.cx, MARK_BALL.cy, MARK_BALL.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.font = `800 34px ${sans}`;
  ctx.fillStyle = INK;
  ctx.fillText("RANGECARD", pad + 54, 102);

  ctx.font = `700 26px ${sans}`;
  ctx.globalAlpha = 0.65;
  ctx.fillText(ellipsize(ctx, data.kicker.toUpperCase(), W - pad * 2), pad, 180);
  ctx.globalAlpha = 1;

  ctx.font = `800 64px ${sans}`;
  ctx.fillText(ellipsize(ctx, data.title, W - pad * 2), pad, 262);

  ctx.font = `600 32px ${sans}`;
  ctx.globalAlpha = 0.65;
  ctx.fillText(ellipsize(ctx, data.meta, W - pad * 2), pad, 312);
  ctx.globalAlpha = 1;

  // -- ink sheet --
  const sheetY = 400;
  roundRectTop(ctx, 0, sheetY, W, MAX_H - sheetY, 48);
  ctx.fillStyle = INK;
  ctx.fill();

  let y = sheetY + 96;
  ctx.font = `800 160px ${sans}`;
  ctx.fillStyle = AQUA;
  const bigW = ctx.measureText(data.big).width;
  ctx.fillText(data.big, pad, y + 130);

  ctx.font = `700 34px ${sans}`;
  ctx.fillStyle = WHITE;
  const capX = pad + bigW + 28;
  const capLines = wrapText(ctx, data.bigCap, W - pad - capX, 2);
  capLines.forEach((l, i) => ctx.fillText(l, capX, y + 50 + i * 42));

  ctx.font = `600 30px ${sans}`;
  ctx.globalAlpha = 0.6;
  ctx.fillText(ellipsize(ctx, data.bigSub, W - pad - capX), capX, y + 50 + capLines.length * 42 + 6);
  ctx.globalAlpha = 1;

  y += 230;
  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
  y += 56;

  // -- rows --
  for (const r of data.rows) {
    ctx.font = `800 34px ${sans}`;
    ctx.textAlign = "right";
    ctx.fillStyle = AQUA;
    ctx.fillText(r.value, W - pad, y);
    ctx.textAlign = "left";

    const valueW = ctx.measureText(r.value).width + 24;
    ctx.font = `700 32px ${sans}`;
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.9;
    ctx.fillText(ellipsize(ctx, r.label, W - pad * 2 - valueW), pad, y);
    ctx.globalAlpha = 1;

    if (r.sub) {
      y += 36;
      ctx.font = `500 26px ${sans}`;
      ctx.globalAlpha = 0.5;
      ctx.fillText(ellipsize(ctx, r.sub, W - pad * 2 - valueW), pad, y);
      ctx.globalAlpha = 1;
    }

    y += 38;
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke();
    y += 44;
  }

  // -- note --
  if (data.note) {
    y += 16;
    const noteW = W - pad * 2 - 64;
    ctx.font = `italic 500 30px ${sans}`;
    ctx.fillStyle = WHITE;
    ctx.globalAlpha = 0.9;
    const lines = wrapText(ctx, `“${data.note}”`, noteW, 4);
    const boxH = lines.length * 42 + 56;
    roundRect(ctx, pad, y, W - pad * 2, boxH, 24);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    lines.forEach((l, i) => ctx.fillText(l, pad + 32, y + 46 + i * 42));
    ctx.globalAlpha = 1;
    y += boxH;
  }

  // -- footer — bottom-anchored to the final card height (same 48px margin
  // as the original fixed design), and that final height itself grows past
  // the nominal H only when real content (5 rows with tags + a long note)
  // needs the room. Short content still gets the normal card proportions,
  // with the footer sitting at the bottom where it always has.
  const finalH = Math.min(MAX_H, Math.max(H, y + 160));
  const footerY = finalH - 48;
  ctx.font = `700 24px ${sans}`;
  ctx.fillStyle = WHITE;
  ctx.globalAlpha = 0.4;
  ctx.textAlign = "center";
  ctx.fillText("rangecard.app", W / 2, footerY);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;

  // crop the tall working canvas down to the real content height
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
