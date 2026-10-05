import type { Values, Context, Handle } from '../../../core/types';
import { escape } from '../../../core/markdown';
import styles from './quote.module.css';
export function render(props: Values, _context: Context) {
  return `<figure class="${styles.quote}"><blockquote>${escape(String(props.quote ?? ''))}</blockquote><figcaption>${escape(String(props.author ?? ''))}</figcaption></figure>`;
}
export function mount(
  host: HTMLElement,
  props: Values,
  context: Context,
): Handle {
  const update = (p: Values, c: Context) => {
    host.innerHTML = render(p, c);
  };
  update(props, context);
  return {
    update,
    destroy() {
      host.replaceChildren();
    },
  };
}
