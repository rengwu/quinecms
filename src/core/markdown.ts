import { marked, Renderer } from 'marked';
import { safeURL } from './content';
import { embedDestination } from './embeds';
import type { Media } from './types';
export const escape = (v: unknown) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!,
  );
export function markdown(value: unknown, media: Media[] = []): string {
  const renderer = new Renderer();
  renderer.html = ({ text }) => escape(text);
  renderer.link = function ({ href, tokens }) {
    return safeURL(href)
      ? `<a href="${escape(href)}" rel="noopener noreferrer">${this.parser.parseInline(tokens)}</a>`
      : this.parser.parseInline(tokens);
  };
  renderer.image = ({ text, href }) => {
    const embed = embedDestination(href);
    if (embed?.kind === 'youtube')
      return `<iframe src="https://www.youtube-nocookie.com/embed/${embed.id}" title="${escape(text || 'YouTube video')}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen style="width:100%;aspect-ratio:16/9;border:0"></iframe>`;
    const image =
      embed?.kind === 'media' &&
      media.find(
        (m) => m.id === embed.id && m.original.mime.startsWith('image/'),
      );
    if (!image || !safeURL(image.original.url)) return escape(text);
    return `<img src="${escape(image.original.url)}" alt="${escape(text)}" loading="lazy" style="max-width:100%;height:auto" />`;
  };
  return marked.parse(String(value ?? ''), {
    async: false,
    gfm: false,
    renderer,
  }) as string;
}
