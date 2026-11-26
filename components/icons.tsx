import type { ReactNode } from "react";

// RangeCard's own icon set. Drawn on a 24px grid with a 2px round stroke so
// the lines sit at the same weight as Archivo's strokes; geometric, open,
// no hairlines. Each entry is the SVG body; Icon wraps it. A `fill` entry is
// the selected / active variant. Names follow Material Symbols so call
// sites don't change; anything not drawn here falls back to the font.

type Glyph = { d: ReactNode; fill?: ReactNode };
const p = (d: string) => <path d={d} />;
const dot = (cx: number, cy: number, r = 1.3) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;

const arrowRight = p("M5 12h14M13 6l6 6-6 6");
const arrowLeft = p("M19 12H5M11 6l-6 6 6 6");
const arrowUp = p("M12 19V5M6 11l6-6 6 6");
const arrowDown = p("M12 5v14M6 13l6 6 6-6");
const northEast = p("M7 17L17 7M9 7h8v8");
const southEast = p("M7 7l10 10M17 9v8H9");
const check = p("M5 12.5l4.5 4.5L19 7.5");
const replay = <>{p("M4 12a8 8 0 1 0 2.4-5.7")}{p("M4 3.5v4.2h4.2")}</>;
const circle = (r: number) => <circle cx="12" cy="12" r={r} />;
const flagPole = p("M6 21V3.5");

export const GLYPHS: Record<string, Glyph> = {
  // navigation and direction
  arrow_back: { d: arrowLeft }, west: { d: arrowLeft },
  arrow_forward: { d: arrowRight }, east: { d: arrowRight },
  arrow_upward: { d: arrowUp }, north: { d: arrowUp },
  arrow_downward: { d: arrowDown }, south: { d: arrowDown },
  north_east: { d: northEast }, arrow_outward: { d: northEast }, south_east: { d: southEast },
  chevron_right: { d: p("M9 6l6 6-6 6") },
  chevron_left: { d: p("M15 6l-6 6 6 6") },
  expand_more: { d: p("M6 9l6 6 6-6") },
  expand_less: { d: p("M6 15l6-6 6 6") },
  close: { d: p("M6 6l12 12M18 6L6 18") },
  add: { d: p("M12 5v14M5 12h14") },
  remove: { d: p("M5 12h14") },
  check: { d: check },
  done_all: { d: p("M2.5 12.5L7 17 17 7M11.5 16.5l.5.5L22 7") },
  undo: { d: <>{p("M9 14L4 9l5-5")}{p("M4 9h10.5a5.5 5.5 0 0 1 0 11H11")}</> },
  redo: { d: <>{p("M15 14l5-5-5-5")}{p("M20 9H9.5a5.5 5.5 0 0 0 0 11H13")}</> },
  replay: { d: replay }, restart_alt: { d: replay },
  more_horiz: { d: <>{dot(5, 12, 1.8)}{dot(12, 12, 1.8)}{dot(19, 12, 1.8)}</> },
  search: { d: <>{<circle cx="11" cy="11" r="6.5" />}{p("M16 16l4.5 4.5")}</> },
  tune: { d: <>{p("M4 7h9M17 7h3M4 17h4M12 17h8")}<circle cx="15" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></> },
  swap_horiz: { d: p("M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4") },
  height: { d: p("M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4") },
  shuffle: { d: p("M4 7h3c4 0 6 10 10 10h3M17 14l3 3-3 3M4 17h3c1.6 0 2.8-1.6 3.8-3.5M13.2 9.5C14.2 8 15.4 7 17 7h3M17 4l3 3-3 3") },

  // actions
  play_arrow: { d: <path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6z" fill="currentColor" stroke="none" /> },
  edit: { d: p("M4 20h4L19 9a2.12 2.12 0 0 0-3-3L5 17v3zM14 7l3 3") },
  edit_note: { d: p("M4 6h11M4 11h7M4 16h4M13 20h3l6-6-3-3-6 6v3z") },
  delete: { d: p("M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13M10 11v6M14 11v6") },
  upload: { d: p("M12 15V4M7 9l5-5 5 5M4 15v4.5h16V15") },
  download: { d: p("M12 4v11M7 10l5 5 5-5M4 15v4.5h16V15") },
  ios_share: { d: p("M12 3v12M8 7l4-4 4 4M7.5 11H5v10h14V11h-2.5") },
  save: { d: p("M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6") },
  bookmark: { d: p("M6 4h12v17l-6-4-6 4z"), fill: <path d="M6 4h12v17l-6-4-6 4z" fill="currentColor" /> },
  lock: { d: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" />{p("M8.5 10.5V7a3.5 3.5 0 0 1 7 0v3.5")}</> },
  visibility: { d: <>{p("M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z")}{circle(3)}</> },
  touch_app: { d: p("M9.5 11.5V5.5a1.5 1.5 0 0 1 3 0v5M12.5 10.5a1.5 1.5 0 0 1 3 0v1M15.5 11.5a1.5 1.5 0 0 1 3 0V16a5 5 0 0 1-5 5h-1.6a5 5 0 0 1-4-2l-2.6-3.6a1.45 1.45 0 0 1 2.3-1.8l1.9 2.4") },
  bolt: { d: p("M13 2.5L5 13.5h6l-1 8 8-11h-6z") },
  build: { d: p("M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z") },

  // status and information
  info: { d: <>{circle(9)}{p("M12 11v5.5")}{dot(12, 7.6)}</> },
  help: { d: <>{circle(9)}{p("M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.7.3-1 .9-1 1.6v.4")}{dot(12, 17)}</> },
  warning: { d: <>{p("M10.3 4.4L2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0z")}{p("M12 9.5v4.5")}{dot(12, 17.2)}</> },
  report: { d: <>{p("M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z")}{p("M12 7.8v5")}{dot(12, 16.3)}</> },
  crisis_alert: { d: <>{circle(9)}{p("M12 7v6")}{dot(12, 16.3)}</> },
  check_circle: { d: <>{circle(9)}{p("M8 12.3l2.8 2.8 5.2-5.6")}</>, fill: <><circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.2" />{circle(9)}{p("M8 12.3l2.8 2.8 5.2-5.6")}</> },
  radio_button_unchecked: { d: circle(8.5) },
  fiber_manual_record: { d: <circle cx="12" cy="12" r="6" fill="currentColor" stroke="none" /> },
  lightbulb: { d: p("M9 18h6M10 21h4M8.2 14.4A6 6 0 1 1 15.8 14.4c-.6.6-.8 1.3-.8 2.1V18H9v-1.5c0-.8-.2-1.5-.8-2.1z") },
  format_quote: { d: p("M5 17c2-1 3.3-3 3.3-6.5V7H4.5v4H8M14.5 17c2-1 3.3-3 3.3-6.5V7H14v4h3.5") },
  health_and_safety: { d: p("M12 3l8 3v6c0 5-3.5 8-8 9.2C7.5 20 4 17 4 12V6zM12 9v6M9 12h6") },

  // time and lists
  history: { d: <>{p("M4 12a8 8 0 1 0 2.4-5.7")}{p("M4 3.5v4.2h4.2")}{p("M12 8v4.5l3 2")}</> },
  event: { d: <><rect x="4" y="5" width="16" height="15.5" rx="2.5" />{p("M4 10h16M8.5 3v4M15.5 3v4")}{dot(12, 15)}</> },
  event_busy: { d: <><rect x="4" y="5" width="16" height="15.5" rx="2.5" />{p("M4 10h16M8.5 3v4M15.5 3v4M10 13.5l4 4M14 13.5l-4 4")}</> },
  pending_actions: { d: <>{p("M9 3.5h6v3H9zM15 5h3v5M9 5H6v15.5h6")}<circle cx="17" cy="17" r="4" />{p("M17 15.3V17l1.2 1")}</> },
  checklist: { d: p("M11 6.5h9M11 12h9M11 17.5h9M3.8 6.5l1.6 1.6L8.5 5M3.8 12l1.6 1.6L8.5 10.5M4.5 17.5h2.5") },
  grid_view: { d: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></> },
  menu_book: { d: p("M3 5.5c3-1 6-.8 9 1.2 3-2 6-2.2 9-1.2V19c-3-1-6-.8-9 1.2-3-2-6-2.2-9-1.2zM12 6.7v13.5") },

  // trends
  trending_up: { d: p("M3 17l6-6 4 4 8-8M15 7h6v6") },
  trending_down: { d: p("M3 7l6 6 4-4 8 8M15 17h6v-6") },
  trending_flat: { d: p("M3 12h17M16 8l4 4-4 4") },
  show_chart: { d: p("M3 20.5h18M4 16l5-6 4 3 7-8") },
  stacked_line_chart: { d: p("M3 20.5h18M4 13l5-4 4 2 7-6M4 17.5l5-3 4 1 7-4") },
  insights: { d: p("M3 20.5h18M4 16l5-6 4 3 7-8") },
  conversion_path: { d: <>{<circle cx="6" cy="18" r="2" />}{<circle cx="18" cy="6" r="2" />}{p("M8 18h3a4 4 0 0 0 4-4v-4a4 4 0 0 1 1.5-3")}</> },
  troubleshoot: { d: <>{<circle cx="10.5" cy="10.5" r="6.5" />}{p("M15.5 15.5L21 21M6.5 10.5h2l1.5-2.5 2 5 1.5-2.5h1")}</> },

  // golf
  flag: { d: <>{flagPole}{p("M6 4h11.5l-2.8 4.2 2.8 4.3H6")}</>, fill: <>{flagPole}<path d="M6 4h11.5l-2.8 4.2 2.8 4.3H6z" fill="currentColor" /></> },
  golf_course: { d: <>{p("M11 18V3l7 3.2-7 3.2")}{p("M4 19c0-1.4 3.6-2.5 8-2.5s8 1.1 8 2.5-3.6 2.5-8 2.5-8-1.1-8-2.5z")}</>,
    fill: <><path d="M11 3l7 3.2-7 3.2z" fill="currentColor" />{p("M11 18V3")}{p("M4 19c0-1.4 3.6-2.5 8-2.5s8 1.1 8 2.5-3.6 2.5-8 2.5-8-1.1-8-2.5z")}</> },
  // a dimpled ball sitting on a T-shaped tee
  sports_golf: { d: <>{<circle cx="12" cy="9" r="5.8" />}{p("M8 16.5h8M12 16.5V21")}{dot(10.2, 7.6, 0.75)}{dot(13.2, 7.2, 0.75)}{dot(12, 10.4, 0.75)}{dot(14.4, 10, 0.75)}</>,
    fill: <><circle cx="12" cy="9" r="5.8" fill="currentColor" />{p("M8 16.5h8M12 16.5V21")}</> },
  adjust: { d: <>{circle(8.5)}<circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" /></> },
  target: { d: <>{circle(9)}{circle(5.2)}<circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></> },
  track_changes: { d: <>{circle(9)}{circle(5)}{p("M12 12l7.5-7.5M16 4.5h3.5V8")}</> },
  my_location: { d: <>{circle(6.5)}<circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />{p("M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3")}</> },
  place: { d: <>{p("M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z")}<circle cx="12" cy="9.5" r="2.4" /></> },
  add_location: { d: <>{p("M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z")}{p("M12 7v5M9.5 9.5h5")}</> },
  near_me: { d: p("M20 4L3.5 10.8l6.9 2.8 2.8 6.9z") },
  explore: { d: <>{circle(9)}{p("M15.6 8.4l-2 5.2-5.2 2 2-5.2z")}</> },
  map: { d: p("M9 4.5L3 6.5v13l6-2 6 2 6-2v-13l-6 2zM9 4.5v13M15 6.5v13") },
  straighten: { d: <><rect x="2.5" y="8" width="19" height="8" rx="1.5" />{p("M6.5 8v3M10.5 8v4M14.5 8v3M18.5 8v4")}</> },
  door_sliding: { d: <>{p("M7 4v16M17 4v16M4.5 20.5h15")}<circle cx="12" cy="15" r="1.8" /></> },
  swipe_up: { d: <>{p("M6 19c3-8.5 7.5-12.5 13-13.5M15.5 3.8l3.5 1.7-1.6 3.6")}<circle cx="6" cy="19" r="1.6" fill="currentColor" stroke="none" /></> },
  crop_square: { d: <rect x="5" y="5" width="14" height="14" rx="2.5" /> },
  emoji_events: { d: p("M8 4h8v5.5a4 4 0 0 1-8 0zM8 6H4.5c0 2.2 1.5 4 3.6 4.2M16 6h3.5c0 2.2-1.5 4-3.6 4.2M12 13.5V17M8.5 20.5h7M9.5 17h5v3.5h-5z") },
  military_tech: { d: <>{p("M8 3l4 5.5L16 3")}<circle cx="12" cy="15" r="5.5" />{p("M12 12.3l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z")}</> },
  eco: { d: p("M5 19.5C5 11 11 5 20 5c0 9-6 15-14 15M5 19.5c3-4.5 6.2-6.8 9.5-8") },

  // camera, sound, light
  videocam: { d: <><rect x="3" y="6" width="12.5" height="12" rx="2.5" />{p("M15.5 10.5l5.5-3v9l-5.5-3")}</> },
  videocam_off: { d: <><rect x="3" y="6" width="12.5" height="12" rx="2.5" />{p("M15.5 10.5l5.5-3v9l-5.5-3M3 3l18 18")}</> },
  smart_display: { d: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none" /></> },
  mic: { d: <><rect x="9" y="3" width="6" height="11" rx="3" />{p("M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21")}</> },
  graphic_eq: { d: p("M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2") },
  wb_sunny: { d: <>{circle(4)}{p("M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8")}</> },
  wb_twilight: { d: p("M3 18.5h18M7 18.5a5 5 0 0 1 10 0M12 7v2.5M5.5 10.5l1.6 1.6M18.5 10.5l-1.6 1.6") },
  self_improvement: { d: <><circle cx="12" cy="5" r="2" />{p("M12 8v5M6.5 11.5l5.5 1.8 5.5-1.8M8 18l4-2.5 4 2.5M4.5 20.5c2.2-.9 4.8-1.3 7.5-1.3s5.3.4 7.5 1.3")}</> },
  person: { d: <><circle cx="12" cy="8" r="4" />{p("M4.5 21a7.5 7.5 0 0 1 15 0")}</> },
};
