import {
  DecoratorNode,
  $getNodeByKey,
  type NodeKey,
  type SerializedLexicalNode,
} from 'lexical';
import type { TextMatchTransformer } from '@lexical/markdown';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalEditable } from '@lexical/react/useLexicalEditable';
import { Button } from '@cloudflare/kumo/components/button';
import type { Media } from '../core/types';
import { embedDestination, embedMarkdown } from '../core/embeds';
import styles from './editor.module.css';

export const EmbedMediaContext = createContext<Media[]>([]);
type SerializedEmbed = SerializedLexicalNode & {
  destination: string;
  alt: string;
};

function Embed({
  destination,
  alt,
  nodeKey,
}: {
  destination: string;
  alt: string;
  nodeKey: NodeKey;
}) {
  const media = useContext(EmbedMediaContext);
  const [editor] = useLexicalComposerContext();
  const editable = useLexicalEditable();
  const embed = embedDestination(destination);
  const image =
    embed?.kind === 'media' &&
    media.find(
      (m) => m.id === embed.id && m.original.mime.startsWith('image/'),
    );
  return (
    <span className={styles.embed} contentEditable={false}>
      {image ? (
        <img src={image.original.url} alt={alt} />
      ) : (
        <span>
          {embed?.kind === 'youtube'
            ? `YouTube · ${embed.id}`
            : 'Image unavailable'}
        </span>
      )}
      {alt && <span>{alt}</span>}
      {editable && (
        <Button
          size="sm"
          aria-label="Remove embedded media"
          onClick={() => editor.update(() => $getNodeByKey(nodeKey)?.remove())}
        >
          Remove
        </Button>
      )}
    </span>
  );
}

export class EmbedNode extends DecoratorNode<ReactNode> {
  __destination: string;
  __alt: string;
  constructor(destination = '', alt = '', key?: NodeKey) {
    super(key);
    this.__destination = destination;
    this.__alt = alt;
  }
  static getType() {
    return 'lean-embed';
  }
  static clone(node: EmbedNode) {
    return new EmbedNode(node.__destination, node.__alt, node.__key);
  }
  static importJSON(data: SerializedEmbed) {
    return new EmbedNode(data.destination, data.alt);
  }
  exportJSON(): SerializedEmbed {
    return {
      ...super.exportJSON(),
      type: 'lean-embed',
      version: 1,
      destination: this.__destination,
      alt: this.__alt,
    };
  }
  createDOM() {
    return document.createElement('span');
  }
  updateDOM() {
    return false;
  }
  isInline() {
    return true;
  }
  getTextContent() {
    return embedMarkdown(this.__destination, this.__alt);
  }
  decorate() {
    return (
      <Embed
        destination={this.__destination}
        alt={this.__alt}
        nodeKey={this.__key}
      />
    );
  }
}

export const EMBED: TextMatchTransformer = {
  dependencies: [EmbedNode],
  type: 'text-match',
  regExp: /!\[((?:\\.|[^\]\\])*)\]\((media:[\w-]+|youtube:[\w-]{11})\)$/,
  importRegExp: /!\[((?:\\.|[^\]\\])*)\]\((media:[\w-]+|youtube:[\w-]{11})\)/,
  trigger: ')',
  export: (node) => (node instanceof EmbedNode ? node.getTextContent() : null),
  replace: (node, match) => {
    node.replace(
      new EmbedNode(match[2], match[1].replace(/\\([\\\[\]])/g, '$1')),
    );
  },
};
