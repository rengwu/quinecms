import type { Context, Field, Handle, Values } from '../../../core/types';
import { escape, markdown } from '../../../core/markdown';
import { safeURL } from '../../../core/content';
import { mountWorkspaceDemo } from './workspace-demo.js';
import { mountPaneDemo } from './pane-demo.js';
import { mountThemePicker } from './theme-picker';
import { DEFAULT_APP_THEME } from './native-themes.js';
import { demoScope } from './lifecycle';
import { mountDownload } from './download';

type Schema = { fields: unknown[]; defaults: unknown };
export function renderSection(
  template: string,
  rows: Record<string, string>,
  definition: Schema,
  props: Values,
  context: Context,
): string {
  const fields = definition.fields as Field[];
  const values = { ...(definition.defaults as Values), ...props };
  function fill(template: string, data: Values, fields: Field[]): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
      if (key === 'instance')
        return escape(`chartr-${context.instanceId.replace(/[^\w-]/g, '-')}`);
      if (key === 'secondary')
        return data.secondaryLabel
          ? ` with <a class="text-link" href="${safeURL(data.secondaryURL) ? escape(data.secondaryURL) : ''}">${escape(data.secondaryLabel)}</a>`
          : '';
      const field = fields.find((f) => f.key === key);
      const value = data[key];
      if (field?.type === 'list')
        return (Array.isArray(value) ? value : [])
          .filter((v) => v && typeof v === 'object' && !Array.isArray(v))
          .map((v) => fill(rows[key] ?? '', v as Values, field.fields))
          .join('');
      if (field?.type === 'url') return safeURL(value) ? escape(value) : '';
      if (key === 'anchor')
        return escape(String(value ?? '').replace(/[^\w-]/g, ''));
      if (field?.type === 'richtext')
        return markdown(value, context.media)
          .replace(/^<p>/, '')
          .replace(/<\/p>\s*$/, '');
      return escape(value).replaceAll('\n', '<br>');
    });
  }
  return `<div class="chartr-scope chartr-block"><div class="page-layout">${fill(template, values, fields)}</div></div>`;
}

export function mountSection(
  kind: string,
  host: HTMLElement,
  props: Values,
  context: Context,
  render: (props: Values, context: Context) => string,
): Handle {
  let cleanups: (() => void)[] = [];
  let previous = '';
  function paint(next: Values, ctx: Context) {
    const html = render(next, ctx);
    // Token-only changes and layout settings updates must not reset demo state.
    if (html === previous) return;
    previous = html;
    for (const cleanup of cleanups.splice(0)) cleanup();
    host.innerHTML = html;
    const root = host.querySelector<HTMLElement>('.chartr-block')!;
    const scope = demoScope(root);
    for (const demo of root.querySelectorAll<HTMLElement>('.native-demo'))
      demo.dataset.appTheme = scope.dataset.chartrAppTheme ?? DEFAULT_APP_THEME;
    for (const demo of root.querySelectorAll<HTMLElement>(
      '[data-workspace-demo]',
    ))
      cleanups.push(mountWorkspaceDemo(demo));
    if (kind === 'panes')
      cleanups.push(mountPaneDemo(root.querySelector('[data-pane-story]')));
    if (kind === 'themes') cleanups.push(mountThemePicker(root));
    if (kind === 'download') cleanups.push(mountDownload(root));
  }
  paint(props, context);
  return {
    update: paint,
    destroy() {
      for (const cleanup of cleanups.splice(0)) cleanup();
      host.replaceChildren();
    },
  };
}
