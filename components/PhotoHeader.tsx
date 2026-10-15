// Reusable full-bleed photo header — handoff Phase 2. The scrim is the same
// on every screen (a fixed dark gradient, not theme-reactive: the photo is
// always a dark-film island regardless of light/dark mode) except its last
// stop, which hands off to `var(--bg)` so the seam into the page below always
// matches the current theme. `top` is an optional absolutely-positioned
// overlay row (back button, greeting + toggles, logo); `bottom` is the
// photo's own text block, left to the caller so screens with a badge (the
// "LOGGED" pill) or different line counts don't have to force-fit one shape.
export function PhotoHeader({
  src, alt, height, position = "50% 50%", imgW, imgH, top, bottom,
}: {
  src: string;
  alt: string;
  height: number;
  position?: string;
  imgW: number;
  imgH: number;
  top?: React.ReactNode;
  bottom?: React.ReactNode;
}) {
  return (
    <header className="photo-hdr" style={{ height }}>
      <img
        src={src}
        alt={alt}
        width={imgW}
        height={imgH}
        decoding="async"
        className="photo-hdr-img"
        style={{ objectPosition: position }}
      />
      <div className="photo-hdr-scrim" aria-hidden />
      {top && <div className="photo-hdr-top">{top}</div>}
      {bottom && <div className="photo-hdr-bottom">{bottom}</div>}
    </header>
  );
}
