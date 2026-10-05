import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import { InputArea } from '@cloudflare/kumo/components/input';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  HEADING,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_STAR,
  ITALIC_STAR,
  BOLD_UNDERSCORE,
  ITALIC_UNDERSCORE,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  LINK,
} from '@lexical/markdown';
import {
  defineExtension,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  PASTE_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from 'lexical';
import { HeadingNode, $createHeadingNode } from '@lexical/rich-text';
import {
  ListNode,
  ListItemNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { $setBlocksType } from '@lexical/selection';
import { marked } from 'marked';
import { safeURL } from '../core/content';
import type { WidgetProps } from './widgets';
import styles from './editor.module.css';
import { EMBED, EmbedNode, EmbedMediaContext } from './EmbedNode';
import EmbedControls from './EmbedControls';
import { embedDestination } from '../core/embeds';
export const transformers = [
  EMBED,
  HEADING,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_STAR,
  ITALIC_STAR,
  BOLD_UNDERSCORE,
  ITALIC_UNDERSCORE,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  LINK,
];
export function supportedMarkdown(value: string): boolean {
  const tokens = marked.lexer(value, { gfm: false });
  let safe = true;
  marked.walkTokens(tokens, (t) => {
    if (
      ![
        'space',
        'heading',
        'paragraph',
        'text',
        'strong',
        'em',
        'link',
        'image',
        'list',
        'list_item',
        'escape',
      ].includes(t.type)
    )
      safe = false;
    if (t.type === 'image' && !embedDestination(t.href)) safe = false;
    if (t.type === 'link' && !safeURL(t.href)) safe = false;
  });
  // Backslash escapes and underscore emphasis can normalize in the restricted editor;
  // compare imported/exported data separately before permitting changes.
  return safe;
}
function Controls({ value, readOnly }: { value: string; readOnly: boolean }) {
  const [editor] = useLexicalComposerContext();
  const [url, setURL] = useState('');
  const last = useRef(value);
  useEffect(() => {
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);
  useEffect(() => {
    if (value !== last.current) {
      editor.getEditorState().read(() => {
        last.current = $convertToMarkdownString(transformers);
      });
      if (value !== last.current)
        editor.update(() => $convertFromMarkdownString(value, transformers));
      last.current = value;
    }
  }, [value, editor]);
  useEffect(
    () =>
      editor.registerCommand(
        PASTE_COMMAND,
        (event) => {
          if (!(event instanceof ClipboardEvent)) return false;
          event.preventDefault();
          const selection = $getSelection();
          if ($isRangeSelection(selection))
            selection.insertRawText(
              event.clipboardData?.getData('text/plain') ?? '',
            );
          return true;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    [editor],
  );
  const format = (tag: 'p' | 'h2' | 'h3') =>
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection))
        $setBlocksType(selection, () =>
          tag === 'p' ? $createParagraphNode() : $createHeadingNode(tag),
        );
    });
  return (
    <div className={styles.formatBar}>
      <Button
        size="sm"
        disabled={readOnly}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        aria-label="Bold"
      >
        <b>B</b>
      </Button>
      <Button
        size="sm"
        disabled={readOnly}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        aria-label="Italic"
      >
        <i>I</i>
      </Button>
      <Button
        size="sm"
        disabled={readOnly}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => format('h2')}
      >
        H2
      </Button>
      <Button
        size="sm"
        disabled={readOnly}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => format('h3')}
      >
        H3
      </Button>
      <Button
        size="sm"
        disabled={readOnly}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
          format('p');
        }}
      >
        ¶
      </Button>
      <Button
        size="sm"
        disabled={readOnly}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        aria-label="Bullet list"
      >
        • List
      </Button>
      <Button
        size="sm"
        disabled={readOnly}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        aria-label="Numbered list"
      >
        1. List
      </Button>
      <Input
        size="sm"
        disabled={readOnly}
        aria-label="Link URL"
        placeholder="Link URL"
        value={url}
        onChange={(e) => setURL(e.target.value)}
      />
      <Button
        size="sm"
        type="button"
        disabled={readOnly || (!!url && !safeURL(url))}
        onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null)}
      >
        Link
      </Button>
    </div>
  );
}
export default function RichText({
  value,
  onChange,
  readOnly,
  field,
  media = [],
}: WidgetProps) {
  const text = typeof value === 'string' ? value : '';
  const extension = useMemo(
    () =>
      defineExtension({
        name: 'lean/prose',
        namespace: 'lean-prose',
        editable: !readOnly,
        nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, EmbedNode],
        onError(e) {
          throw e;
        },
        $initialEditorState: () =>
          $convertFromMarkdownString(text, transformers),
        theme: {
          paragraph: styles.paragraph,
          text: { bold: styles.bold, italic: styles.italic },
        },
      }),
    [],
  );
  if (!supportedMarkdown(text))
    return (
      <div>
        <p>
          This Markdown uses formatting the visual editor cannot safely change.
          Its original text is preserved.
        </p>
        <InputArea
          aria-label={field.label}
          value={text}
          readOnly={readOnly}
          rows={8}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  return (
    <div className={styles.richText}>
      <EmbedMediaContext.Provider value={media}>
        <LexicalExtensionComposer extension={extension} contentEditable={null}>
          <Controls value={text} readOnly={readOnly} />
          <EmbedControls media={media} readOnly={readOnly} />
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label={field.label}
                className={styles.editable}
              />
            }
            placeholder={null}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin validateUrl={safeURL} />
          <MarkdownShortcutPlugin transformers={transformers} />
          <OnChangePlugin
            ignoreSelectionChange
            onChange={(state) =>
              state.read(() => {
                const next = $convertToMarkdownString(transformers);
                if (next !== text) onChange(next);
              })
            }
          />
        </LexicalExtensionComposer>
      </EmbedMediaContext.Provider>
    </div>
  );
}
