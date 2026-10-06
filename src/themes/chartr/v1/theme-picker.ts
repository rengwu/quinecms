import { APP_THEMES, DEFAULT_APP_THEME } from './native-themes.js';
import { demoScope, lifecycle } from './lifecycle';
import { escape } from '../../../core/markdown';

export function mountThemePicker(root: HTMLElement) {
  const scope = demoScope(root);
  const palette = root.querySelector<HTMLElement>('.theme-palette')!;
  const controls = root.querySelector<HTMLElement>('.theme-scroll-controls')!;
  const status = root.querySelector<HTMLElement>('[data-theme-status]')!;
  const events = lifecycle();
  let current = scope.dataset.chartrAppTheme ?? DEFAULT_APP_THEME;
  palette.innerHTML = APP_THEMES.map(
    (theme) =>
      `<button type="button" class="theme-choice" role="radio" aria-label="${escape(theme.name)}" aria-checked="false" tabindex="-1" data-app-theme="${escape(theme.id)}"><span class="theme-sample" aria-hidden="true"><span class="theme-sample-text">Aa</span><i></i><i></i><i></i><i></i></span><span class="theme-choice-name">${escape(theme.name)}<svg viewBox="0 0 12 12" aria-hidden="true"><path d="m2 6 2.5 2.5L10 3"/></svg></span></button>`,
  ).join('');
  const choices = [
    ...palette.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
  ];
  function reveal(choice: HTMLElement) {
    const bounds = choice.getBoundingClientRect(),
      viewport = palette.getBoundingClientRect();
    if (bounds.left < viewport.left + 3)
      palette.scrollLeft += bounds.left - viewport.left - 3;
    else if (bounds.right > viewport.right - 3)
      palette.scrollLeft += bounds.right - viewport.right + 3;
  }
  function sync() {
    current = scope.dataset.chartrAppTheme ?? DEFAULT_APP_THEME;
    for (const choice of choices) {
      const selected = choice.dataset.appTheme === current;
      choice.setAttribute('aria-checked', String(selected));
      choice.tabIndex = selected ? 0 : -1;
    }
  }
  function select(id: string) {
    const theme = APP_THEMES.find((theme) => theme.id === id);
    if (!theme) return;
    scope.dataset.chartrAppTheme = id;
    for (const demo of scope.querySelectorAll<HTMLElement>('.native-demo'))
      demo.dataset.appTheme = id;
    scope.dispatchEvent(new Event('chartr:app-theme'));
    status.textContent = `${theme.name} applied to all chartr previews.`;
  }
  events.on(scope, 'chartr:app-theme', sync);
  events.on(palette, 'click', (event) => {
    const choice = (event.target as HTMLElement).closest<HTMLElement>(
      '[role="radio"]',
    );
    if (choice?.dataset.appTheme) select(choice.dataset.appTheme);
  });
  events.on(palette, 'keydown', (event) => {
    const e = event as KeyboardEvent;
    if (
      ![
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(e.key)
    )
      return;
    e.preventDefault();
    const index = APP_THEMES.findIndex((theme) => theme.id === current);
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? choices.length - 1
          : (index +
              (['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 1) +
              choices.length) %
            choices.length;
    select(APP_THEMES[next].id);
    choices[next].focus({ preventScroll: true });
    reveal(choices[next]);
  });
  function updateScrollControls() {
    controls.hidden = palette.scrollWidth <= palette.clientWidth + 1;
    controls.querySelector<HTMLButtonElement>(
      '[data-theme-scroll="-1"]',
    )!.disabled = palette.scrollLeft <= 1;
    controls.querySelector<HTMLButtonElement>(
      '[data-theme-scroll="1"]',
    )!.disabled =
      palette.scrollLeft + palette.clientWidth >= palette.scrollWidth - 1;
  }
  events.on(controls, 'click', (event) => {
    const control = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-theme-scroll]',
    );
    if (control)
      palette.scrollBy({
        left: Number(control.dataset.themeScroll) * palette.clientWidth * 0.8,
        behavior: 'instant',
      });
  });
  events.on(palette, 'scroll', updateScrollControls, { passive: true });
  const observer = new ResizeObserver(updateScrollControls);
  observer.observe(palette);
  sync();
  reveal(choices.find((choice) => choice.dataset.appTheme === current)!);
  updateScrollControls();
  return () => {
    observer.disconnect();
    events.destroy();
  };
}
