import { lifecycle } from './lifecycle';
import { icon, tools, titleBar, zsh } from './demo-primitives.js';
import { paneIcons } from './pane-icons.js';
import { DURATION, frameAt } from './pane-timeline.js';

export function mountPaneDemo(root) {
  const events = lifecycle();
  let alive = true;
  const demo = root.querySelector('[data-pane-demo]');
  const screen = demo.querySelector('.native-demo-screen');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const LOOP_REST = 3;
  const surfaceIcon = (name) =>
    `<span class="demo-icon">${paneIcons[name]}</span>`;

  function launcher() {
    return `<div class="paning-launcher"><div class="paning-launcher-cards">${[
      [
        'agent',
        'Agent',
        'Configure and launch coding agents in your workspace.',
      ],
      [
        'browser',
        'Browser',
        'Browse the web alongside your terminals and tools.',
      ],
      [
        'markdown',
        'Markdown Prompt',
        'Compose Markdown from text, saved prompts and plugin templates.',
      ],
      [
        'wayfinder',
        'Wayfinder',
        'Plan work, track tickets, and launch agents with shared skills.',
      ],
    ]
      .map(
        ([glyph, name, description]) =>
          `<div class="paning-launcher-card" data-surface="${glyph}"><div>${glyph === 'wayfinder' ? icon(glyph) : surfaceIcon(glyph)}<span>${name}</span></div><p>${description}</p></div>`,
      )
      .join('')}</div><span class="paning-launcher-scrollbar"></span></div>`;
  }
  function browser() {
    return `<div class="paning-browser"><div class="paning-browser-toolbar"><span class="paning-browser-disabled">${icon('back')}</span><span class="paning-browser-disabled">${surfaceIcon('forward')}</span>${surfaceIcon('reload')}<div class="paning-address">${surfaceIcon('public')}<span>Search or enter address</span></div></div><div class="paning-browser-page"><div><div class="paning-globe">🌏</div><h3>Browse the web</h3><p>Enter a URL or search above</p></div></div></div>`;
  }
  function pane(id, content = 'zsh') {
    const label =
      content === 'browser'
        ? 'Browser'
        : content === 'launcher'
          ? 'New surface'
          : 'zsh';
    const mark =
      content === 'browser'
        ? surfaceIcon('browser')
        : content === 'launcher'
          ? icon('expand')
          : '<span class="demo-icon"></span>';
    return `<div class="demo-pane paning-pane paning-${id}"><div class="demo-pane-header"><div class="paning-pane-tab">${mark}<span>${label}</span></div>${tools()}</div><div class="demo-pane-content">${content === 'zsh' ? zsh() : content === 'browser' ? browser() : launcher()}</div></div>`;
  }
  function layout(scene) {
    if (scene.layout === 'single') return zsh();
    if (scene.layout === 'launcher') return launcher();
    return `${pane('first')}${pane('second')}${scene.layout !== 'columns' ? pane('third') : ''}${scene.layout === 'four' ? pane('surface', scene.surface) : ''}`;
  }

  const picker = `<div class="paning-view-options">${['Tabs', 'Spaces', 'Chats'].map((name) => `<span class="demo-view-option${name === 'Tabs' ? ' is-selected' : ''}">${name}</span>`).join('')}</div>`;
  // Reuse the main preview's exact native title bar, fonts, icons, tabs, and shell.
  // In this demonstration the entire app is inert, including all apparent controls.
  screen.innerHTML = `<div class="demo-window">${titleBar(picker, 'paning')}<div class="demo-outer-tabs paning-outer-tabs"></div><div class="paning-layout"></div><div class="paning-drop"></div><div class="paning-pointer"><svg viewBox="0 0 16 22"><path d="M1 1v16l4-4 3.5 7 3-1.5L8 12h6Z"/></svg><span class="paning-drag-pill">tab</span></div></div>`;
  const outer = screen.querySelector('.paning-outer-tabs');
  const content = screen.querySelector('.paning-layout');
  const drop = screen.querySelector('.paning-drop');
  const pointer = screen.querySelector('.paning-pointer');
  let currentScene = '';
  let elapsed = motion.matches ? DURATION : 0;
  let visible = false;
  let raf = 0;
  let previousTime = null;

  function render(seconds) {
    const frame = frameAt(seconds),
      scene = frame.scene;
    if (currentScene !== scene.name) {
      currentScene = scene.name;
      outer.innerHTML =
        scene.tabs
          .map(
            (label, i) =>
              `<span class="paning-outer-tab${i === scene.selected ? ' demo-outer-selected' : ''}">${label.endsWith('tabs') ? icon('split') : label === 'New surface' ? icon('expand') : '<span class="demo-icon"></span>'}<span>${label}</span></span>`,
          )
          .join('') + tools();
      content.dataset.layout = scene.layout;
      content.innerHTML = layout(scene);
      demo.dataset.scene = scene.name;
    }
    demo.dataset.dragging = String(frame.dragging);
    demo.dataset.browserHovered = String(frame.browserHovered);
    drop.hidden = !frame.drop;
    if (frame.drop) {
      const [x, y, width, height] = frame.drop;
      Object.assign(drop.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      });
    }
    pointer.hidden = !frame.pointer.visible;
    pointer.style.transform = `translate(${frame.pointer.x}px,${frame.pointer.y}px)`;
    demo.dataset.time = seconds.toFixed(2);
  }
  function tick(time) {
    if (!alive) return;
    raf = 0;
    if (previousTime !== null)
      elapsed =
        (elapsed + (time - previousTime) / 1000) % (DURATION + LOOP_REST);
    previousTime = time;
    // Hold the completed frame for three seconds before the next cycle.
    render(Math.min(DURATION, elapsed));
    raf = requestAnimationFrame(tick);
  }
  function syncPlayback() {
    if (!alive) return;
    cancelAnimationFrame(raf);
    raf = 0;
    previousTime = null;
    const playing = visible && !document.hidden && !motion.matches;
    demo.dataset.playing = String(playing);
    if (playing) raf = requestAnimationFrame(tick);
  }
  // Reduced motion keeps the completed four-pane layout without an automatic loop.
  events.on(motion, 'change', () => {
    elapsed = motion.matches ? DURATION : 0;
    render(elapsed);
    syncPlayback();
  });
  const intersection = new IntersectionObserver(
    (entries) => {
      visible = entries[0].intersectionRatio >= 0.25;
      syncPlayback();
    },
    { threshold: 0.25 },
  );
  intersection.observe(demo);
  events.on(document, 'visibilitychange', syncPlayback);
  for (const event of ['contextmenu', 'dragstart', 'selectstart'])
    events.on(demo, event, (e) => e.preventDefault());
  const resize = () =>
    screen.style.setProperty(
      '--demo-scale',
      Math.min(1, demo.clientWidth / 904),
    );
  const observer = new ResizeObserver(resize);
  observer.observe(demo);
  render(elapsed);
  resize();
  demo.dataset.ready = 'true';

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    intersection.disconnect();
    observer.disconnect();
    events.destroy();
  };
}
