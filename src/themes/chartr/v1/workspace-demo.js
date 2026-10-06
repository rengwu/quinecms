import { lifecycle } from './lifecycle';
import {
  INITIAL_STATE,
  CHOICES,
  SESSIONS,
  sessionChoices,
  transition,
} from './demo-state.js';
import { icon, tools, titleBar, zsh } from './demo-primitives.js';
import { mountStarMap } from './demo-map.js';
import {
  ModeTransition,
  SelectionTransition,
  layoutAt,
} from './demo-motion.js';

export function mountWorkspaceDemo(demo) {
  const events = lifecycle();
  let alive = true;
  const prefix = demo.id;
  const screen = demo.querySelector('.native-demo-screen');
  const viewPicker = demo
    .closest('.chartr-block')
    .querySelector(`[data-demo-view-picker="${prefix}"]`);
  const viewChoices = [
    ...(viewPicker?.querySelectorAll('[data-demo-view]') ?? []),
  ];
  const labels = {
    tabs: 'Tabs',
    spaces: 'Spaces',
    chats: 'Chats',
    claude: 'claude',
    codex: 'codex',
    zsh: 'zsh',
    wayfinder: 'Wayfinder',
  };
  let state = INITIAL_STATE;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = new ModeTransition();
  const selection = new SelectionTransition();
  let raf = 0;
  let terminalsFrozen = false;
  const terminalSizes = new Map();

  function button(group, value) {
    const selected = state[group] === value;
    return `<button type="button" role="tab" id="${prefix}-${group}-${value}" data-demo-group="${group}" data-demo-value="${value}" aria-selected="${selected}" aria-controls="${group === 'view' ? `${prefix}-body` : `${prefix}-${group}-content`}" tabindex="${selected ? 0 : -1}">${group === 'view' ? '' : value === 'zsh' ? '<span class="demo-icon"></span>' : icon(value)}<span>${labels[value]}</span></button>`;
  }

  function spaceHeading(name) {
    return `<div class="demo-space-heading">${icon('down')}<span>${name}</span><span class="demo-space-tools" aria-hidden="true">${icon('plus')}${icon('expand')}</span></div>`;
  }
  function sessionButton(id, placement) {
    const session = SESSIONS[id];
    const selected = state.session === id;
    const name =
      id === 'expensif-group'
        ? 'Pane group: 4 tabs'
        : `${session.label} in ${session.space}`;
    return `<button type="button" class="demo-session-${placement}" role="tab" id="${prefix}-session-${placement}-${id}" data-demo-group="session" data-demo-value="${id}" aria-label="${name}" aria-selected="${selected}" aria-controls="${prefix}-session-content" tabindex="${selected ? 0 : -1}">${icon(session.icon)}<span>${session.label}</span></button>`;
  }
  function spaces() {
    return `<aside class="demo-sidebar demo-spaces" aria-label="Spaces"><div class="demo-sidebar-heading"><span>Spaces</span>${icon('plus')}</div><div role="tablist" aria-label="Workspace sessions" aria-orientation="vertical">${[
      'Free sessions',
      'expensif',
      'ladybird',
    ]
      .map(
        (space) =>
          `${spaceHeading(space)}<div class="demo-session-tree">${CHOICES.session
            .filter((id) => SESSIONS[id].space === space)
            .map((id) => sessionButton(id, 'row'))
            .join('')}</div>`,
      )
      .join('')}</div></aside>`;
  }
  function outerTabs() {
    return `<div class="demo-outer-tabs demo-session-strip"><div class="demo-session-list" role="tablist" aria-label="${SESSIONS[state.session].space} sessions">${CHOICES.session
      .map((id) => sessionButton(id, 'tab'))
      .join('')}</div>${tools()}</div>`;
  }
  function chats() {
    return `<aside class="demo-sidebar demo-chats" aria-label="Chats, fixed to the shown Claude conversation"><div class="demo-inbox-filter" aria-label="Inbox selected; Archive unavailable in this preview"><span class="is-selected">Inbox</span><span>Archive</span></div><div class="demo-sidebar-heading"><span>Recent chats</span>${icon('plus')}</div><div class="demo-chat-row">${icon('codex')}<span>expensif</span><time>32m</time></div><div class="demo-chat-row is-selected">${icon('claude')}<span>Claude conversation</span><time>32m</time></div><div class="demo-chat-row">${icon('claude')}<span>Claude conversation</span><time>39m</time></div></aside>`;
  }
  function claude(variant = 'group') {
    const standalone = variant !== 'group';
    const free = variant === 'free';
    const mode =
      variant === 'project'
        ? '<span class="demo-auto-mode">▸▸ auto mode on</span> (shift+tab to cycle) · ← for agents'
        : '⏸ manual mode on · ← for agents';
    return `<div class="demo-terminal demo-claude${standalone ? ' demo-claude-standalone' : ''}${free ? ' demo-claude-free' : ''}" data-terminal-view="spaces" role="region" aria-label="Claude Code terminal, read only"><div class="demo-claude-welcome"><svg class="demo-claude-mascot" viewBox="0 0 132 84" aria-hidden="true" shape-rendering="crispEdges"><path d="M15 0h102v34h15v16h-15v17h-16v17h-8V67h-7v17h-8V67H54v17h-7V67h-8v17h-8V67H15V50H0V34h15Z"/><path class="demo-mascot-eyes" d="M31 17h8v17h-8zm62 0h8v17h-8z"/></svg><div class="demo-claude-version"><div><strong>Claude Code</strong><span> v2.1.${standalone ? '275' : '274'}</span></div><div>Opus 5 with high effort<span class="demo-claude-plan"> · Claude Pro</span></div><div class="demo-claude-plan-narrow">Claude Pro</div><div>${free ? '/Users/rengwu' : '~/Desktop/Projects/expensif'}</div></div></div>${free ? '<div class="demo-claude-note">Using Opus 5 (from .claude/settings.json) · /model</div>' : ''}<div class="demo-claude-bottom">${free ? '<div class="demo-claude-effort">● high · /effort</div>' : ''}<div class="demo-terminal-prompt"><span>❯</span> <span class="demo-cursor${variant === 'project' ? ' demo-cursor-hollow' : ''}" aria-hidden="true"></span></div><div class="demo-terminal-mode">${mode}</div></div></div>`;
  }
  function codex() {
    return `<div class="demo-terminal demo-codex" role="region" aria-label="Codex terminal, read only"><div class="demo-codex-box"><div><span class="demo-term-muted">&gt;_ </span>OpenAI Codex <span class="demo-term-muted">(v0.154.0)</span></div><div class="demo-codex-properties"><div><span class="demo-term-muted">model:</span><span class="demo-codex-model">gpt-6-astra max</span><span class="demo-term-cyan">/model</span><span class="demo-model-more"> to…</span></div><div><span class="demo-term-muted">directory:</span><span class="demo-codex-directory">${state.view === 'spaces' ? '~/…/Projects/expensif' : '~/Desktop/Projects/expensif'}</span></div><div><span class="demo-term-muted">permissions:</span><span class="demo-term-purple">YOLO mode</span></div></div></div><div class="demo-codex-tip">Tip: Try the Desktop app. Run 'codex app' or visit<br>https://chatgpt.com/codex?app-landing-page=true</div><div class="demo-codex-warning"><span>⚠ </span><div>Under-development features enabled: default_mode_request_user_input. Under-development features are incomplete and may behave unpredictably. To suppress this warning, set &#96;suppress_unstable_features_warning = true&#96; in /Users/rengwu/.codex/config.toml.</div></div><div class="demo-codex-usage"><span class="demo-term-muted">• </span>You have 3 usage limit resets available.<br>Run /usage to use one.</div><div class="demo-codex-bottom"><div class="demo-codex-prompt"><span class="demo-term-orange">› </span><span class="demo-codex-placeholder"><span class="demo-cursor-letter">A</span>sk Codex to do anything</span></div><div class="demo-codex-status"><span>gpt-6-astra max</span><span class="demo-term-muted"> · </span><span class="demo-term-green">~/Desktop/Projects/expensif</span></div></div></div>`;
  }

  function ticket() {
    return `<section class="demo-ticket" aria-label="Ticket 06, CSV encoding correctness, resolved"><div class="demo-ticket-header"><div class="demo-ticket-identity"><span class="demo-ticket-number">06</span><span>CSV encoding correctness</span>${icon('close')}</div><div class="demo-ticket-metadata"><span>Grilling</span><span class="demo-ticket-badge">Resolved</span><span class="demo-ticket-open">Open file <span aria-hidden="true">↗</span></span></div></div><div class="demo-ticket-reading"><div class="demo-prose">
    <h3>Question</h3><p>The parts of CSV that bite in production. Waits on 03 because the columns and their formats are what gets encoded.</p><ul>
    <li><strong>Escaping.</strong> A <code>Description</code> can contain commas, double quotes, and newlines. Go's <code>encoding/csv</code> quotes and escapes these correctly — the decision is to <strong>use it</strong> rather than hand-rolling string joins, and to say so in the spec so no one &quot;optimises&quot; it away. Name a hostile description as a test fixture.</li>
    <li><strong>Encoding and the Excel BOM.</strong> UTF-8 is the default, but Excel on Windows misreads UTF-8 without a leading byte-order mark, mangling accented text and currency symbols. Decide whether to prepend a UTF-8 BOM (helps Excel, mildly pollutes strict parsers) — this is the crux of this ticket.</li>
    <li><strong>Delimiter and line endings.</strong> Comma vs semicolon (the latter dodges the decimal-comma locale clash — see the fog patch), and <code>\\r\\n</code> vs <code>\\n</code>. Pin both; RFC 4180 says CRLF.</li>
    <li><strong>The decimal-separator locale patch.</strong> Resolve or explicitly defer the <strong>&quot;locale and the decimal separator&quot;</strong> fog here: does the spec target US-format numbers only, or accommodate comma-decimal locales (which forces the delimiter choice above)?</li></ul>
    <p>The answer is a short, testable set of rules — an encoding contract ticket 08 asserts against.</p><h3>Answer</h3><p><strong>The encoding contract: <code>encoding/csv</code> for escaping, UTF-8 with a leading BOM, comma delimiter, CRLF line endings, one canonical US/ISO format that the spec documents.</strong></p><ul><li><strong>Escaping: <code>encoding/csv.Writer</code>, never hand-rolled.</strong> It quotes any field containing a comma, double-quote, <code>\\r</code>, or <code>\\n</code>, and doubles embedded quotes, per RFC 4180. The spec states this outright so no one &quot;optimises&quot; it into a <code>strings.Join</code>. <strong>Hostile fixture</strong> (for ticket 08): a description like <code>He said &quot;hi&quot;, then left</code> followed by an embedded newline — it must round-trip through a real <code>csv.Reader</code> byte-identical.</li><li><strong>BOM: prepend the three bytes <code>EF BB BF</code> once, before the header record.</strong></li></ul>
    </div><span class="demo-scrollbar" aria-hidden="true"></span></div></section>`;
  }
  function wayfinder() {
    return `<div class="demo-wayfinder" role="region" aria-label="Wayfinder, fixed map and ticket"><div class="demo-map"><div class="demo-map-art"></div><div class="demo-map-toolbar"><span class="demo-map-back">${icon('back')}Back</span><span class="demo-map-title">Export to CSV — a new Export page</span></div><span class="demo-map-fit" aria-hidden="true">${icon('expand')}</span></div>${ticket()}</div>`;
  }
  function pane(side) {
    const content = CHOICES[side]
      .map(
        (value) =>
          `<div class="demo-item" data-item="${value}">${{ claude, codex, wayfinder, zsh }[value]()}</div>`,
      )
      .join('');
    return `<section class="demo-pane demo-pane-${side}"><div class="demo-pane-header"><div role="tablist" aria-label="${side === 'left' ? 'Left' : 'Right'} pane">${CHOICES[side].map((v) => button(side, v)).join('')}</div>${tools()}</div><div class="demo-pane-content" id="${prefix}-${side}-content" role="tabpanel" aria-labelledby="${prefix}-${side}-${state[side]}">${content}</div></section>`;
  }
  function sessionContent() {
    return `<div class="demo-session-content" id="${prefix}-session-content" role="tabpanel"><div class="demo-panes" data-session="expensif-group">${pane('left')}${pane('right')}</div>${CHOICES.session
      .filter((id) => id !== 'expensif-group')
      .map(
        (id) =>
          `<div class="demo-single-terminal" data-session="${id}">${id === 'ladybird-zsh' ? zsh('ladybird', true) : claude(id === 'free-claude' ? 'free' : 'project')}</div>`,
      )
      .join('')}</div>`;
  }

  // Build once. Views share the same chrome, workspace, terminals and plugin.
  // In Chats the existing group Claude expands in place; other panes stay mounted.
  screen.innerHTML = `<div class="demo-window">${titleBar(`<span class="demo-view-pill" aria-hidden="true"></span>${CHOICES.view.map((v) => button('view', v)).join('')}`, prefix, SESSIONS[state.session].space)}<div class="demo-tab-slot">${outerTabs()}</div><div class="demo-body" id="${prefix}-body" role="tabpanel"><div class="demo-sidebar-slot"><div class="demo-sidebar-pages">${spaces()}${chats()}</div></div>${sessionContent()}</div></div>`;
  const controls = [...screen.querySelectorAll('[data-demo-group]')];
  const terminals = [...screen.querySelectorAll('.demo-terminal')];
  const titlePicker = screen.querySelector('.demo-view-picker');
  const pill = screen.querySelector('.demo-view-pill');
  const tabSlot = screen.querySelector('.demo-tab-slot');
  const spacesPage = screen.querySelector('.demo-spaces');
  const chatsPage = screen.querySelector('.demo-chats');
  const body = screen.querySelector('.demo-body');
  const sessionPanel = screen.querySelector('.demo-session-content');
  const projectLabel = screen.querySelector('.demo-project').firstChild;
  const directory = screen.querySelector('.demo-codex-directory');
  const updateMap = mountStarMap(screen.querySelector('.demo-map-art'), prefix);
  const sessions = [...screen.querySelectorAll('[data-session]')];
  const items = [...screen.querySelectorAll('[data-item]')];
  const headers = [...screen.querySelectorAll('.demo-pane-header')];
  const rightPane = screen.querySelector('.demo-pane-right');
  let terminalLayoutDirty = true;

  function enable(surface, enabled) {
    surface.inert = !enabled;
    surface.setAttribute('aria-hidden', String(!enabled));
  }
  function show(surface, shown) {
    surface.hidden = !shown;
    surface.inert = !shown;
  }
  function syncState() {
    demo.dataset.view = state.view;
    demo.dataset.session = state.session;
    terminalLayoutDirty = true;
    body.setAttribute('aria-labelledby', `${prefix}-view-${state.view}`);
    projectLabel.textContent = `${SESSIONS[state.session].space} `;
    projectLabel.parentElement.setAttribute(
      'aria-hidden',
      String(state.view !== 'tabs'),
    );
    titlePicker.setAttribute('aria-label', 'Workspace view');
    enable(tabSlot, state.view === 'tabs');
    enable(spacesPage, state.view === 'spaces');
    enable(chatsPage, state.view === 'chats');
    for (const session of sessions)
      show(session, session.dataset.session === state.session);
    for (const item of items)
      show(
        item,
        item.dataset.item === state.left || item.dataset.item === state.right,
      );
    for (const header of headers) show(header, state.view !== 'chats');
    show(rightPane, state.view !== 'chats');
    for (const control of controls) {
      const { demoGroup: group, demoValue: value } = control.dataset;
      if (control.classList.contains('demo-session-tab'))
        show(control, SESSIONS[value].space === SESSIONS[state.session].space);
      const selected = state[group] === value;
      control.setAttribute('aria-selected', String(selected));
      control.tabIndex =
        selected && !control.closest('[hidden], [inert]') ? 0 : -1;
    }
    screen
      .querySelector('.demo-session-list')
      .setAttribute('aria-label', `${SESSIONS[state.session].space} sessions`);
    sessionPanel.setAttribute(
      'aria-labelledby',
      state.view === 'chats'
        ? `${prefix}-view-chats`
        : `${prefix}-session-${state.view === 'tabs' ? 'tab' : 'row'}-${state.session}`,
    );
    for (const side of ['left', 'right'])
      screen
        .querySelector(`#${prefix}-${side}-content`)
        .setAttribute(
          'aria-labelledby',
          state.view === 'chats'
            ? `${prefix}-view-chats`
            : `${prefix}-${side}-${state[side]}`,
        );
    for (const choice of viewChoices) {
      const selected = choice.dataset.demoView === state.view;
      choice.setAttribute('aria-checked', String(selected));
      choice.tabIndex = selected ? 0 : -1;
    }
    demo.querySelector('[data-demo-status]').textContent =
      state.view === 'chats'
        ? 'Chats view. Inbox. Claude conversation selected. Read only.'
        : `${labels[state.view]} view. ${SESSIONS[state.session].space}, ${SESSIONS[state.session].label}. ${state.session === 'expensif-group' ? `${labels[state.left]} and ${labels[state.right]} selected.` : 'Read only.'}`;
  }

  function rememberTerminalSizes() {
    for (const terminal of terminals) {
      if (terminal.closest('[hidden]')) continue;
      const style = getComputedStyle(terminal);
      terminalSizes.set(terminal, { width: style.width, height: style.height });
    }
  }
  function freezeTerminals() {
    rememberTerminalSizes();
    for (const [terminal, size] of terminalSizes)
      Object.assign(terminal.style, size);
    terminalsFrozen = true;
  }
  function freezeNewTerminals() {
    // A pane/session can be selected before the view finishes moving. Give a
    // first-time surface one grid size too, instead of reflowing it every frame.
    for (const terminal of terminals) {
      if (terminal.closest('[hidden]') || terminal.style.width) continue;
      terminal.dataset.terminalView = state.view;
      const style = getComputedStyle(terminal);
      const size = { width: style.width, height: style.height };
      terminalSizes.set(terminal, size);
      Object.assign(terminal.style, size);
    }
  }
  function settleTerminals() {
    for (const terminal of terminals) {
      terminal.style.removeProperty('width');
      terminal.style.removeProperty('height');
      if (!terminal.closest('[hidden]'))
        terminal.dataset.terminalView = state.view;
    }
    directory.textContent =
      state.view === 'spaces'
        ? '~/…/Projects/expensif'
        : '~/Desktop/Projects/expensif';
    terminalsFrozen = false;
    terminalLayoutDirty = false;
    rememberTerminalSizes();
  }
  function renderFrame(
    now,
    frame = motion.advance(state.view, now, reducedMotion.matches),
  ) {
    const layout = layoutAt(frame);
    for (const [key, value] of Object.entries(layout)) {
      const name = key.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
      );
      screen.style.setProperty(
        `--demo-${name}`,
        `${value}${key.endsWith('Opacity') ? '' : 'px'}`,
      );
    }
    screen.style.setProperty('--demo-tabs-reveal', frame.tabs);
    spacesPage.style.visibility =
      frame.sidebar > 0 && frame.page < 1 ? 'visible' : 'hidden';
    chatsPage.style.visibility =
      frame.sidebar > 0 && frame.page > 0 ? 'visible' : 'hidden';
    tabSlot.style.visibility = frame.tabs > 0 ? 'visible' : 'hidden';
    updateMap(frame.tabs);
    if (!frame.geometryAnimating && (terminalsFrozen || terminalLayoutDirty))
      settleTerminals();
    const selected = screen.querySelector(`#${prefix}-view-${state.view}`);
    const scale = screen.getBoundingClientRect().width / 904;
    const bounds = selected.getBoundingClientRect();
    const pickerBounds = titlePicker.getBoundingClientRect();
    const highlight = selection.advance(
      state.view,
      [
        (bounds.left - pickerBounds.left) / scale - titlePicker.clientLeft,
        bounds.width / scale,
      ],
      now,
      reducedMotion.matches,
    );
    pill.style.transform = `translateX(${highlight.values[0]}px)`;
    pill.style.width = `${highlight.values[1]}px`;
    const animating = frame.animating || highlight.animating;
    demo.dataset.motion = animating ? 'running' : 'idle';
    demo.dataset.geometryMotion = String(frame.geometryAnimating);
    demo.dataset.sidebarView = frame.sidebarView;
    if (animating) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    raf = 0;
    renderFrame(now);
  }
  function select(group, value) {
    if (state[group] === value) return;
    const next = transition(state, group, value);
    if (next === state) return;
    const now = performance.now();
    const frame = motion.advance(next.view, now, reducedMotion.matches);
    if (frame.geometryAnimating && !terminalsFrozen) freezeTerminals();
    state = next;
    syncState();
    if (frame.geometryAnimating) freezeNewTerminals();
    cancelAnimationFrame(raf);
    raf = 0;
    renderFrame(now, frame);
  }
  function focusControl(group, value) {
    controls
      .find(
        (control) =>
          control.dataset.demoGroup === group &&
          control.dataset.demoValue === value &&
          !control.closest('[hidden], [inert]'),
      )
      ?.focus({ preventScroll: true });
  }
  // Outside cards share the existing view state; they do not affect other previews.
  events.on(viewPicker, 'click', (event) => {
    const choice = event.target.closest('[data-demo-view]');
    if (!choice) return;
    select('view', choice.dataset.demoView);
  });
  events.on(viewPicker, 'keydown', (event) => {
    const choice = event.target.closest('[data-demo-view]');
    if (
      !choice ||
      ![
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    const index = CHOICES.view.indexOf(state.view);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? viewChoices.length - 1
          : (index +
              (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) +
              viewChoices.length) %
            viewChoices.length;
    select('view', viewChoices[next].dataset.demoView);
    viewChoices[next].focus({ preventScroll: true });
  });
  // Only view, supplied session, and pane tabs are interactive. Other chrome is inert.
  for (const event of ['contextmenu', 'dragstart', 'selectstart'])
    events.on(demo, event, (e) => e.preventDefault());
  events.on(demo, 'click', (event) => {
    const control = event.target.closest('[data-demo-group]');
    if (!control || control.closest('[hidden], [inert]')) return;
    const { demoGroup: group, demoValue: value } = control.dataset;
    select(group, value);
    focusControl(group, value);
  });
  events.on(demo, 'keydown', (event) => {
    const control = event.target.closest('[data-demo-group]');
    if (
      !control ||
      control.closest('[hidden], [inert]') ||
      ![
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(event.key)
    )
      return;
    const group = control.dataset.demoGroup,
      choices = group === 'session' ? sessionChoices(state) : CHOICES[group];
    if (group !== 'session' && ['ArrowUp', 'ArrowDown'].includes(event.key))
      return;
    event.preventDefault();
    const index =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? choices.length - 1
          : (choices.indexOf(state[group]) +
              (event.key === 'ArrowRight' || event.key === 'ArrowDown'
                ? 1
                : -1) +
              choices.length) %
            choices.length;
    select(group, choices[index]);
    focusControl(group, choices[index]);
  });
  // The entire 904 × 677 logical window scales down together, never up.
  const resize = () =>
    screen.style.setProperty(
      '--demo-scale',
      Math.min(1, demo.clientWidth / 904),
    );
  const observer = new ResizeObserver(resize);
  observer.observe(demo);
  const refreshMotion = () => {
    if (!alive) return;
    cancelAnimationFrame(raf);
    raf = 0;
    renderFrame(performance.now());
  };
  events.on(reducedMotion, 'change', refreshMotion);
  document.fonts?.ready.then(refreshMotion);
  syncState();
  renderFrame(performance.now());
  resize();
  demo.dataset.ready = 'true';
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    observer.disconnect();
    events.destroy();
  };
}
