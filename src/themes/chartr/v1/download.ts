import { demoScope, lifecycle } from './lifecycle';
export function mountDownload(root: HTMLElement) {
  const scope = demoScope(root);
  const dialog = root.querySelector<HTMLDialogElement>(
    '[data-download-dialog]',
  )!;
  const events = lifecycle();
  let trigger: HTMLElement | undefined;
  events.on(scope, 'click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-download]',
    );
    if (!target) return;
    // Own actions always target this dialog; shared layout actions use the first.
    if (
      !root.contains(target) &&
      scope.querySelector('[data-download-dialog]') !== dialog
    )
      return;
    event.preventDefault();
    trigger = target;
    dialog.showModal();
  });
  events.on(dialog.querySelector('[data-dialog-close]'), 'click', () =>
    dialog.close(),
  );
  events.on(dialog, 'close', () => trigger?.focus({ preventScroll: true }));
  events.on(dialog, 'click', (event) => {
    if (event.target !== dialog) return;
    const e = event as MouseEvent,
      bounds = dialog.getBoundingClientRect();
    if (
      e.clientX < bounds.left ||
      e.clientX > bounds.right ||
      e.clientY < bounds.top ||
      e.clientY > bounds.bottom
    )
      dialog.close();
  });
  return () => {
    events.destroy();
    if (dialog.open) dialog.close();
  };
}
