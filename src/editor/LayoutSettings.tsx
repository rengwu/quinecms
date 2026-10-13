import { Suspense, lazy, type ComponentType } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Select } from '@cloudflare/kumo/components/select';
import { Label } from '@cloudflare/kumo/components/label';
import type {
  Content,
  LayoutDefinition,
  LayoutSelection,
  Page,
} from '../core/types';
import type { LayoutSettingsProps } from '../core/layout-contract';
import {
  layoutDefinitions,
  layoutKey,
  contentForLayout,
} from '../core/layouts';
import { layoutEditors } from '../generated/layout-browser';
import PanelSection from './PanelSection';
import styles from './editor.module.css';

const editors = Object.fromEntries(
  Object.entries(layoutEditors).map(([key, load]) => [
    key,
    lazy(
      load as () => Promise<{ default: ComponentType<LayoutSettingsProps> }>,
    ),
  ]),
);
export default function LayoutSettings({
  content,
  selection,
  previewPage,
  onPreviewPage,
  onChange,
  onDesign,
  onVersion,
}: {
  content: Content;
  selection: LayoutSelection;
  previewPage?: Page;
  onPreviewPage(id: string): void;
  onChange(selection: LayoutSelection): void;
  onDesign(): void;
  onVersion(definition: LayoutDefinition): void;
}) {
  const current = layoutDefinitions.find(
    (d) => layoutKey(d) === layoutKey(selection),
  );
  const Editor = editors[layoutKey(selection)];
  const versions = layoutDefinitions
    .filter((d) => d.id === selection.id)
    .sort((a, b) => b.version - a.version);
  return (
    <>
      <PanelSection
        title="Design"
        action={<Button onClick={onDesign}>Change design</Button>}
      >
        <strong>{current?.label ?? selection.id}</strong>
        <p className={styles.muted}>
          Version {selection.version}
          {current?.deprecated ? ' · Retained version' : ''}
        </p>
        <p className={styles.muted}>{current?.description}</p>
        {versions.length > 1 && (
          <div className={styles.field}>
            <Label htmlFor="layout-version">Layout version</Label>
            <Select
              id="layout-version"
              aria-label="Layout version"
              value={String(selection.version)}
              onValueChange={(v) => {
                const definition = versions.find(
                  (d) => String(d.version) === v,
                );
                if (definition) onVersion(definition);
              }}
            >
              {versions.map((d) => (
                <Select.Option key={d.version} value={String(d.version)}>
                  Version {d.version}
                  {d.deprecated ? ' (retained)' : ''}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
        <div className={styles.field}>
          <Label htmlFor="layout-preview-page">Preview page</Label>
          <Select
            id="layout-preview-page"
            aria-label="Preview page"
            value={previewPage?.id ?? ''}
            renderValue={(id) =>
              content.pages.find((p) => p.id === id)?.title ?? 'Choose page'
            }
            onValueChange={(id) => {
              if (id) onPreviewPage(id);
            }}
          >
            {content.pages.map((p) => (
              <Select.Option key={p.id} value={p.id}>
                {p.title}
                {p.kind === 'generic' ? ' (generic)' : ''}
              </Select.Option>
            ))}
          </Select>
        </div>
      </PanelSection>
      <Suspense fallback={<p>Loading layout settings…</p>}>
        {Editor ? (
          <Editor
            key={layoutKey(selection)}
            content={contentForLayout(content, selection)}
            settings={selection.settings}
            onChange={(settings) => onChange({ ...selection, settings })}
          />
        ) : (
          <p role="alert">This layout’s settings editor is unavailable.</p>
        )}
      </Suspense>
    </>
  );
}
