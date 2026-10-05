import { describe, it, expect } from 'vitest';
import { createEditor } from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown';
import { supportedMarkdown, transformers } from '../src/editor/RichText';
import { EmbedNode } from '../src/editor/EmbedNode';
import { markdown } from '../src/core/markdown';
function roundTrip(source: string) {
  const editor = createEditor({
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, EmbedNode],
    onError(e) {
      throw e;
    },
  });
  editor.update(() => $convertFromMarkdownString(source, transformers), {
    discrete: true,
  });
  return editor
    .getEditorState()
    .read(() => $convertToMarkdownString(transformers));
}
describe('visual Markdown contract', () => {
  for (const source of [
    '## A heading\n\nA paragraph with **bold** and *italic*.',
    '### Smaller\n\n[Safe link](https://example.com).',
    '- First\n- Second',
    '1. First\n2. Second',
    'A __bold__ and _italic_ line.',
  ])
    it('preserves rendered meaning: ' + source.slice(0, 30), () => {
      expect(supportedMarkdown(source)).toBe(true);
      expect(markdown(roundTrip(source))).toBe(markdown(source));
    });
  for (const source of [
    '```js\nalert(1)\n```',
    '<b>raw HTML</b>',
    '![image](https://example.com/image.jpg)',
    '> blockquote',
    '[unsafe](javascript:alert(1))',
  ])
    it(
      'preserves unsupported source outside visual editing: ' +
        source.slice(0, 20),
      () => {
        expect(supportedMarkdown(source)).toBe(false);
      },
    );
});

it('round trips image references and YouTube embeds through visual Markdown', () => {
  for (const source of [
    'Before\n\n![Cover](media:media_cover)\n\nAfter',
    '![A \\[caption\\]](media:media_cover)',
    '![Video](youtube:jNQXAC9IVRw)',
  ]) {
    expect(supportedMarkdown(source)).toBe(true);
    expect(roundTrip(source)).toBe(source);
  }
});
it('renders only registered image references and canonical YouTube frames', () => {
  const media = [
    {
      formatVersion: 1 as const,
      id: 'media_cover',
      name: 'Cover',
      original: {
        key: 'cover.jpg',
        url: 'https://media.example.com/cover.jpg',
        mime: 'image/jpeg',
        bytes: 20,
      },
      variants: [],
    },
  ];
  expect(markdown('![Cover](media:media_cover)', media)).toContain(
    'src="https://media.example.com/cover.jpg"',
  );
  expect(markdown('![Video](youtube:jNQXAC9IVRw)')).toContain(
    'src="https://www.youtube-nocookie.com/embed/jNQXAC9IVRw"',
  );
  expect(markdown('![bad](javascript:alert(1))')).not.toContain('<img');
  expect(markdown('![missing](media:missing)', media)).not.toContain('<img');
  expect(markdown('![bad](youtube:invalid)')).not.toContain('<iframe');
});
