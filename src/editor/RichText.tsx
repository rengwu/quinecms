import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  ImageIcon,
  LinkSimpleIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  ParagraphIcon,
  TextBIcon,
  TextHThreeIcon,
  TextHTwoIcon,
  TextItalicIcon,
  YoutubeLogoIcon,
} from '@phosphor-icons/react';
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
  type BaseSelection,
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
import { Button, Input, InputArea } from './ui';
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
type Panel = '' | 'link' | 'image' | 'youtube';
function Controls({
  value,
  readOnly,
  panel,
  onPanel,
  selection,
}: {
  value: string;
  readOnly: boolean;
  panel: Panel;
  onPanel(panel: Panel): void;
  /** Where an embed is inserted once its panel is confirmed. */
  selection: RefObject<BaseSelection | null>;
}) {
  const [editor] = useLexicalComposerContext();
  const [url, setURL] = useState('');
  const openEmbed = (next: Panel) => {
    if (panel === next) return onPanel('');
    editor.getEditorState().read(() => {
      selection.current = $getSelection()?.clone() ?? null;
    });
    onPanel(next);
  };
  const embeds = (
    <>
      <span className={styles.formatDivider} aria-hidden />
      {tool(
        'Image',
        <ImageIcon />,
        () => openEmbed('image'),
        panel === 'image',
      )}
      {tool(
        'YouTube',
        <YoutubeLogoIcon />,
        () => openEmbed('youtube'),
        panel === 'youtube',
      )}
    </>
  );
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
  function tool(
    label: string,
    icon: ReactNode,
    action: () => void,
    pressed?: boolean,
  ) {
    return (
      <Button
        size="sm"
        shape="square"
        variant="ghost"
        type="button"
        disabled={readOnly}
        aria-label={label}
        title={label}
        aria-pressed={pressed}
        onMouseDown={(e) => e.preventDefault()}
        onClick={action}
        icon={icon}
      />
    );
  }
  return (
    <>
      <div className={styles.formatBar} role="toolbar" aria-label="Formatting">
        {tool('Bold', <TextBIcon weight="bold" />, () =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'),
        )}
        {tool('Italic', <TextItalicIcon />, () =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'),
        )}
        <span className={styles.formatDivider} aria-hidden />
        {tool('Heading 2', <TextHTwoIcon />, () => format('h2'))}
        {tool('Heading 3', <TextHThreeIcon />, () => format('h3'))}
        {tool('Paragraph', <ParagraphIcon />, () => {
          editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
          format('p');
        })}
        <span className={styles.formatDivider} aria-hidden />
        {tool('Bullet list', <ListBulletsIcon />, () =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
        )}
        {tool('Numbered list', <ListNumbersIcon />, () =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
        )}
        <span className={styles.formatDivider} aria-hidden />
        {tool(
          'Link',
          <LinkSimpleIcon />,
          () => onPanel(panel === 'link' ? '' : 'link'),
          panel === 'link',
        )}
        {embeds}
      </div>
      {panel === 'link' && (
        <div className={styles.formatPanel}>
          <Input
            size="sm"
            disabled={readOnly}
            aria-label="Link URL"
            placeholder="https://… or /page"
            value={url}
            autoFocus
            onChange={(e) => setURL(e.target.value)}
          />
          <Button
            size="sm"
            type="button"
            variant="ghost"
            disabled={readOnly}
            onClick={() => {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
              onPanel('');
            }}
          >
            Remove link
          </Button>
          <Button
            size="sm"
            type="button"
            disabled={readOnly || !url || !safeURL(url)}
            onClick={() => {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
              setURL('');
              onPanel('');
            }}
          >
            Apply link
          </Button>
        </div>
      )}
    </>
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
  const [panel, setPanel] = useState<Panel>('');
  const selection = useRef<BaseSelection | null>(null);
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
          <Controls
            value={text}
            readOnly={readOnly}
            panel={panel}
            onPanel={setPanel}
            selection={selection}
          />
          {(panel === 'image' || panel === 'youtube') && (
            <EmbedControls
              media={media}
              readOnly={readOnly}
              mode={panel}
              selection={selection}
              onClose={() => setPanel('')}
            />
          )}
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
