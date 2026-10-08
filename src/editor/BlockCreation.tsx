import type { Block, Content } from '../core/types';
import { definitions } from '../generated/definitions';
import BlockFields from './BlockFields';
import FormScreen from './FormScreen';
import { PanelLevel } from './PanelNavigation';

export default function BlockCreation({
  block,
  content,
  onChange,
  onCreate,
  onCancel,
  pageId,
  footer = false,
  level = false,
}: {
  block: Block;
  content: Content;
  onChange(next: Block): void;
  onCreate(): void;
  onCancel(): void;
  pageId?: string;
  footer?: boolean;
  level?: boolean;
}) {
  const definition = definitions.find(
    (d) => d.type === block.type && d.version === block.version,
  );
  const page = content.pages.find((p) => p.id === pageId);
  const Screen = level ? PanelLevel : FormScreen;
  return (
    <Screen
      title={footer ? 'New footer' : 'New block'}
      subtitle={definition?.label ?? block.type}
      onBack={onCancel}
      creation={{ label: footer ? 'Create footer' : 'Create block', onCreate }}
    >
      <BlockFields
        block={block}
        fields={definition?.fields ?? []}
        generic={page?.kind === 'generic'}
        onChange={onChange}
        media={content.media}
        collections={content.collections}
        readOnly={false}
        pageId={pageId}
      />
    </Screen>
  );
}
