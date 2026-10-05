export function youtubeId(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return;
    const host = url.hostname.replace(/^www\./, '');
    const id =
      host === 'youtu.be'
        ? url.pathname.slice(1)
        : host === 'youtube.com'
          ? url.pathname === '/watch'
            ? url.searchParams.get('v')
            : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1]
          : undefined;
    return id && /^[\w-]{11}$/.test(id) ? id : undefined;
  } catch {
    return;
  }
}
export function embedDestination(value: string) {
  const match = /^(media):([\w-]+)$|^(youtube):([\w-]{11})$/.exec(value);
  if (!match) return undefined;
  return {
    kind: (match[1] || match[3]) as 'media' | 'youtube',
    id: match[2] || match[4],
  };
}
export const embedMarkdown = (destination: string, alt: string) =>
  `![${alt.replace(/\r?\n/g, ' ').replace(/[\\\[\]]/g, '\\$&')}](${destination})`;
import { marked } from 'marked';

export function embeddedDestinations(value: string) {
  const destinations: string[] = [];
  marked.walkTokens(marked.lexer(value, { gfm: false }), (token) => {
    if (token.type === 'image') destinations.push(token.href);
  });
  return destinations;
}
