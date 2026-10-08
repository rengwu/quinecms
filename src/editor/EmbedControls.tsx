import { useRef, useState } from 'react';
import {
  $getSelection,
  $setSelection,
  $insertNodes,
  $createTextNode,
  type BaseSelection,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import { Select } from '@cloudflare/kumo/components/select';
import { EmbedNode } from './EmbedNode';
import { youtubeId } from '../core/embeds';
import type { Media } from '../core/types';
import styles from './editor.module.css';

export default function EmbedControls({
  media,
  readOnly,
}: {
  media: Media[];
  readOnly: boolean;
}) {
  const [editor] = useLexicalComposerContext();
  const [mode, setMode] = useState(''),
    [image, setImage] = useState(''),
    [alt, setAlt] = useState(''),
    [url, setURL] = useState('');
  const selection = useRef<BaseSelection | null>(null);
  const images = media.filter((m) => m.original.mime.startsWith('image/'));
  function open(next: string) {
    editor.getEditorState().read(() => {
      selection.current = $getSelection()?.clone() ?? null;
    });
    setMode(next);
  }
  function insert(destination: string, text: string) {
    editor.update(() => {
      if (selection.current) $setSelection(selection.current.clone());
      $insertNodes([new EmbedNode(destination, text), $createTextNode(' ')]);
    });
    setMode('');
    setAlt('');
    setURL('');
  }
  return (
    <div className={styles.embedControls}>
      <div className={styles.row}>
        <Button
          size="sm"
          disabled={readOnly}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => open('image')}
        >
          Image
        </Button>
        <Button
          size="sm"
          disabled={readOnly}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => open('youtube')}
        >
          YouTube
        </Button>
      </div>
      {mode === 'image' && (
        <div className={styles.formStack}>
          <Select
            aria-label="Uploaded image"
            placeholder="Choose image…"
            value={image}
            disabled={readOnly}
            renderValue={(key) =>
              images.find((m) => m.id === key)?.name || 'Choose image…'
            }
            onValueChange={(key) => setImage(key ?? '')}
          >
            <Select.Option value="">Choose image…</Select.Option>
            {images.map((m) => (
              <Select.Option key={m.id} value={m.id}>
                {m.name}
              </Select.Option>
            ))}
          </Select>
          {!images.length && (
            <p className={styles.muted}>Upload an image in Media first.</p>
          )}
          <Input
            aria-label="Image alternative text"
            placeholder="Alternative text"
            value={alt}
            disabled={readOnly}
            onChange={(e) => setAlt(e.target.value)}
          />
          <div className={styles.dialogActions}>
            <Button variant="ghost" onClick={() => setMode('')}>
              Cancel
            </Button>
            <Button
              disabled={readOnly || !images.some((m) => m.id === image)}
              onClick={() => insert(`media:${image}`, alt)}
            >
              Insert image
            </Button>
          </div>
        </div>
      )}
      {mode === 'youtube' && (
        <div className={styles.formStack}>
          <Input
            aria-label="YouTube URL"
            placeholder="YouTube URL"
            value={url}
            disabled={readOnly}
            onChange={(e) => setURL(e.target.value)}
          />
          <div className={styles.dialogActions}>
            <Button variant="ghost" onClick={() => setMode('')}>
              Cancel
            </Button>
            <Button
              disabled={readOnly || !youtubeId(url)}
              onClick={() =>
                insert(`youtube:${youtubeId(url)}`, 'YouTube video')
              }
            >
              Insert video
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
