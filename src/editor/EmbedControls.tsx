import { useState, type RefObject } from 'react';
import {
  $setSelection,
  $insertNodes,
  $createTextNode,
  type BaseSelection,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { EmbedNode } from './EmbedNode';
import { youtubeId } from '../core/embeds';
import type { Media } from '../core/types';
import styles from './editor.module.css';
import { Button, Input, Select } from './ui';

/** The panel under the toolbar for inserting an image or a YouTube video. */
export default function EmbedControls({
  media,
  readOnly,
  mode,
  selection,
  onClose,
}: {
  media: Media[];
  readOnly: boolean;
  mode: 'image' | 'youtube';
  selection: RefObject<BaseSelection | null>;
  onClose(): void;
}) {
  const [editor] = useLexicalComposerContext();
  const [image, setImage] = useState(''),
    [alt, setAlt] = useState(''),
    [url, setURL] = useState('');
  const images = media.filter((m) => m.original.mime.startsWith('image/'));
  function insert(destination: string, text: string) {
    editor.update(() => {
      if (selection.current) $setSelection(selection.current.clone());
      $insertNodes([new EmbedNode(destination, text), $createTextNode(' ')]);
    });
    onClose();
  }
  const cancel = (
    <Button size="sm" variant="ghost" onClick={onClose}>
      Cancel
    </Button>
  );
  return mode === 'image' ? (
    <div className={styles.formatPanel}>
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
      <Input
        size="sm"
        aria-label="Image alternative text"
        placeholder="Alternative text"
        value={alt}
        disabled={readOnly}
        onChange={(e) => setAlt(e.target.value)}
      />
      {cancel}
      <Button
        size="sm"
        disabled={readOnly || !images.some((m) => m.id === image)}
        onClick={() => insert(`media:${image}`, alt)}
      >
        Insert image
      </Button>
      {!images.length && (
        <p className={styles.muted}>Upload an image in Media first.</p>
      )}
    </div>
  ) : (
    <div className={styles.formatPanel}>
      <Input
        size="sm"
        aria-label="YouTube URL"
        placeholder="YouTube URL"
        value={url}
        disabled={readOnly}
        autoFocus
        onChange={(e) => setURL(e.target.value)}
      />
      {cancel}
      <Button
        size="sm"
        disabled={readOnly || !youtubeId(url)}
        onClick={() => insert(`youtube:${youtubeId(url)}`, 'YouTube video')}
      >
        Insert video
      </Button>
    </div>
  );
}
