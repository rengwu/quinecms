// Port of chartr's mode.rs and components/selection.rs. Times are milliseconds.
// The source/provenance and six directed transitions are recorded in docs/28.
export const MODE_DURATION = 500;
export const PILL_DURATION = 250;
export const modeEasing = (progress) =>
  (1 - 2 ** (-10 * progress)) / (1 - 2 ** -10);
const pillEasing = (progress) => 1 - (1 - progress) ** 3;
const visibility = (view) => (view === 'tabs' ? [0, 1] : [1, 0]);
const equal = (a, b) => a.every((value, i) => value === b[i]);

function sample(motion, now, duration, easing) {
  const progress = Math.max(0, (now - motion.started) / duration);
  if (progress >= 1 || equal(motion.from, motion.to))
    return { values: motion.to, animating: false };
  const eased = easing(progress);
  return {
    values: motion.from.map(
      (value, i) => value + (motion.to[i] - value) * eased,
    ),
    animating: true,
  };
}

export class ModeTransition {
  motion = null;
  sidebarMotion = null;
  sidebarView = 'spaces';

  advance(view, now, reduced = false) {
    if (view !== 'tabs') this.sidebarView = view;
    const page = this.sidebarView === 'chats' ? 1 : 0;
    // Keep the outgoing sidebar on exit. Only Spaces <-> Chats slides its pages.
    const snapPage =
      reduced || view === 'tabs' || !this.motion || this.motion.to[1] === 1;
    if (snapPage || !this.sidebarMotion || this.sidebarMotion.to[0] !== page) {
      const from =
        snapPage || !this.sidebarMotion
          ? [page]
          : sample(this.sidebarMotion, now, MODE_DURATION, modeEasing).values;
      this.sidebarMotion = { from, to: [page], started: now };
    }
    const to = visibility(view);
    if (!this.motion || !equal(this.motion.to, to) || reduced) {
      const from =
        reduced || !this.motion
          ? to
          : sample(this.motion, now, MODE_DURATION, modeEasing).values;
      this.motion = { from, to, started: now };
    }
    const chrome = sample(this.motion, now, MODE_DURATION, modeEasing);
    const pages = sample(this.sidebarMotion, now, MODE_DURATION, modeEasing);
    return {
      sidebar: chrome.values[0],
      tabs: chrome.values[1],
      page: pages.values[0],
      sidebarView: this.sidebarView,
      geometryAnimating: chrome.animating,
      pagesAnimating: pages.animating,
      animating: chrome.animating || pages.animating,
    };
  }
}

export class SelectionTransition {
  selected = null;
  motion = null;

  advance(selected, bounds, now, reduced = false) {
    const changed = this.selected !== selected;
    // Font/layout changes to the same option track it immediately, as in GPUI.
    if (reduced || changed || !this.motion || !equal(this.motion.to, bounds)) {
      const from =
        changed && !reduced && this.motion
          ? sample(this.motion, now, PILL_DURATION, pillEasing).values
          : bounds;
      this.motion = { from, to: bounds, started: now };
    }
    this.selected = selected;
    return sample(this.motion, now, PILL_DURATION, pillEasing);
  }
}

// Endpoint dimensions retain the supplied 904 x 677 window, including its
// measured split ratio. One owner paints each divider throughout the slide.
export function layoutAt({ sidebar, tabs, page }) {
  const distance = Math.min(1, (192.5 * sidebar) / 32);
  return {
    sidebarWidth: 192.5 * sidebar,
    sidebarOffset: 192.5 * (sidebar - 1),
    spacesOffset: -224.5 * page,
    chatsOffset: 224.5 * (1 - page),
    tabTop: 34 - 4 * tabs,
    tabHeight: 32 * tabs,
    tabOffset: 32 * (tabs - 1),
    tabOpacity: Math.sqrt(tabs),
    bodyTop: 34 + 28 * tabs,
    leftWidth: 348 + 94.5 * tabs,
    mapHeight: 298.5 - 28 * tabs,
    dividerOpacity: distance * distance * (3 - 2 * distance),
  };
}
