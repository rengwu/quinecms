// Shared native chrome and terminal markup for both HTML recreations.
import { icons } from './demo-icons.js';

export const icon = (name) => `<span class="demo-icon">${icons[name]}</span>`;
export const tools = () =>
  `<span class="demo-pane-tools" aria-hidden="true">${icon('plus')}${icon('expand')}</span>`;

export function titleBar(
  viewPicker,
  prefix = 'workspace',
  project = 'expensif',
) {
  const brand = icons.brand
    .replace(/id="([^"]+)"/g, `id="${prefix}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
  return `<div class="demo-titlebar"><div class="demo-traffic" aria-hidden="true"><i></i><i></i><i></i></div><span class="demo-brand" aria-label="chartr">${brand}</span><span class="demo-project">${project} <svg viewBox="0 0 12 16" aria-hidden="true"><path d="m4 6 2-2 2 2M4 10l2 2 2-2"/></svg></span><div class="demo-view-picker" role="tablist" aria-label="Workspace view">${viewPicker}</div><span class="demo-settings" aria-hidden="true">${icons.settings}</span></div>`;
}

export function zsh(project = 'expensif', hollow = false) {
  return `<div class="demo-terminal demo-zsh" role="region" aria-label="zsh terminal in ${project}, read only"><span>rengwu@JGRs-MacBook-Pro ${project} % </span><span class="demo-cursor${hollow ? ' demo-cursor-hollow' : ''}" aria-hidden="true"></span></div>`;
}
