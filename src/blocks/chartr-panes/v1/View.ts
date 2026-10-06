import type { Context, Values } from '../../../core/types';
import { renderSection, mountSection } from '../../../themes/chartr/v1/blocks';
import definition from './definition.json';
import { template, rows } from './markup';
import '../../../themes/chartr/v1/styles.css';
export const render = (props: Values, context: Context) =>
  renderSection(template, rows, definition, props, context);
export const mount = (host: HTMLElement, props: Values, context: Context) =>
  mountSection('panes', host, props, context, render);
