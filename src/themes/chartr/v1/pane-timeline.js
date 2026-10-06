// Choreography from the owner's second recording. Times are seconds.
// Layout changes snap as they do in the app; only the pointer and drop target move.
export const DURATION = 14.6;
export const SCENES = [
  { at: 0, name: 'one-terminal', tabs: ['zsh'], selected: 0, layout: 'single' },
  {
    at: 0.7,
    name: 'two-tabs',
    tabs: ['zsh', 'zsh'],
    selected: 1,
    layout: 'single',
  },
  {
    at: 1.5,
    name: 'three-tabs',
    tabs: ['zsh', 'zsh', 'zsh'],
    selected: 2,
    layout: 'single',
  },
  {
    at: 2.5,
    name: 'first-drop',
    tabs: ['zsh', 'zsh', 'zsh'],
    selected: 0,
    layout: 'single',
  },
  {
    at: 3.9,
    name: 'two-panes',
    tabs: ['zsh', '2 tabs'],
    selected: 1,
    layout: 'columns',
  },
  {
    at: 5.8,
    name: 'three-panes',
    tabs: ['3 tabs'],
    selected: 0,
    layout: 'three',
  },
  {
    at: 6.9,
    name: 'new-surface',
    tabs: ['3 tabs', 'New surface'],
    selected: 1,
    layout: 'launcher',
  },
  // Restore the destination group by clicking it before dragging the inactive
  // New surface tab. Dragging cannot reveal a different tab's pane layout.
  {
    at: 7.7,
    name: 'return-to-group',
    tabs: ['3 tabs', 'New surface'],
    selected: 0,
    layout: 'three',
  },
  {
    at: 8.8,
    name: 'surface-drop',
    tabs: ['3 tabs', 'New surface'],
    selected: 0,
    layout: 'three',
  },
  {
    at: 10.4,
    name: 'four-panes',
    tabs: ['4 tabs'],
    selected: 0,
    layout: 'four',
    surface: 'launcher',
  },
  {
    at: 11.6,
    name: 'browser',
    tabs: ['4 tabs'],
    selected: 0,
    layout: 'four',
    surface: 'browser',
  },
];

// The app's single 6px-inset drop preview travels across pane boundaries.
// Positions are in the same 904 × 677 logical coordinates as the shared window.
const DROPS = [
  { start: 2.7, end: 3.15, rect: [6, 68, 440, 603] },
  { start: 3.15, end: 3.9, rect: [458, 68, 440, 603] },
  { start: 4.8, end: 5.2, rect: [458, 68, 440, 603] },
  { start: 5.2, end: 5.8, rect: [458, 375.5, 440, 295.5] },
  { start: 9.1, end: 9.55, rect: [6, 68, 440, 603] },
  { start: 9.55, end: 10.4, rect: [6, 375.5, 440, 295.5] },
];
const POINTER = [
  [0, 246, 47, 0],
  [1.7, 604, 47, 0],
  [2.1, 511, 47, 1],
  [2.4, 511, 47, 1],
  [2.7, 150, 310, 1],
  [3.15, 335, 430, 1],
  [3.6, 766, 405, 1],
  [3.9, 766, 405, 1],
  [4.3, 100, 47, 1],
  [4.55, 100, 47, 1],
  [4.8, 690, 280, 1],
  [5.4, 747, 580, 1],
  [5.8, 747, 580, 1],
  [6.35, 246, 47, 1],
  [6.9, 246, 47, 1],
  [7.2, 311, 47, 1],
  [7.7, 100, 47, 1],
  [8.2, 100, 47, 1],
  [8.6, 311, 47, 1],
  [8.8, 311, 47, 1],
  [9.2, 192, 276, 1],
  [9.95, 234, 584, 1],
  [10.4, 234, 584, 1],
  [10.95, 115, 534, 1],
  [11.6, 115, 534, 1],
  [12, 115, 534, 0],
  [DURATION, 115, 534, 0],
];
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => 1 - (1 - t) ** 3;

export function frameAt(seconds) {
  const t = Math.max(
    0,
    Math.min(DURATION, Number.isFinite(seconds) ? seconds : 0),
  );
  const scene = SCENES.findLast((scene) => scene.at <= t);
  const i = DROPS.findIndex((drop) => t >= drop.start && t < drop.end);
  let drop = null;
  if (i !== -1) {
    const current = DROPS[i],
      previous = DROPS[i - 1];
    const progress = ease(Math.min(1, (t - current.start) / 0.14));
    drop =
      previous?.end === current.start
        ? current.rect.map((n, j) => lerp(previous.rect[j], n, progress))
        : current.rect;
  }
  const next = POINTER.findIndex((point) => point[0] > t);
  const a = POINTER[next === -1 ? POINTER.length - 1 : Math.max(0, next - 1)];
  const b = POINTER[next === -1 ? POINTER.length - 1 : next];
  const progress = a === b ? 1 : (t - a[0]) / (b[0] - a[0]);
  const smooth = progress * progress * (3 - 2 * progress);
  const dragging =
    (t >= 2.4 && t < 3.9) || (t >= 4.55 && t < 5.8) || (t >= 8.8 && t < 10.4);
  return {
    scene,
    drop,
    dragging,
    pointer: {
      x: lerp(a[1], b[1], smooth),
      y: lerp(a[2], b[2], smooth),
      visible: a[3] === 1,
    },
    browserHovered: t >= 10.95 && t < 11.6,
    finished: t === DURATION,
  };
}
