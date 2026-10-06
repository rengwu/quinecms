import { Suspense, lazy, useState, type ComponentType } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Select } from '@cloudflare/kumo/components/select';
import { Label } from '@cloudflare/kumo/components/label';
import { Dialog } from '@cloudflare/kumo/components/dialog';
import { Input } from '@cloudflare/kumo/components/input';
import { XIcon } from '@phosphor-icons/react';
import type { Content, LayoutDefinition, Page } from '../core/types';
import type { LayoutSettingsProps } from '../core/layout-contract';
import {
  activeLayout,
  layoutChoices,
  layoutDefinitions,
  layoutKey,
  selectLayout,
} from '../core/layouts';
import { layoutEditors } from '../generated/layout-browser';
import PanelSection from './PanelSection';
import LayoutSurface, { PageBlocks } from './LayoutSurface';
import styles from './editor.module.css';
import catalog from './layout-catalog.module.css';

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
  allowedIds,
  previewPage,
  onPreviewPage,
  onChange,
}: {
  content: Content;
  allowedIds?: string[];
  previewPage?: Page;
  onPreviewPage(id: string): void;
  onChange(content: Content): void;
}) {
  const active = activeLayout(content.site);
  const current = layoutDefinitions.find(
    (d) => layoutKey(d) === layoutKey(active),
  );
  const Editor = editors[layoutKey(active)];
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<LayoutDefinition>();
  const [mobile, setMobile] = useState(false);
  const choices = layoutChoices(allowedIds);
  const cards = [...new Set(choices.map((d) => d.id))]
    .map(
      (id) =>
        choices
          .filter((d) => d.id === id)
          .sort(
            (a, b) =>
              Number(!!a.deprecated) - Number(!!b.deprecated) ||
              b.version - a.version,
          )[0],
    )
    .filter((d) =>
      `${d.label} ${d.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  const versions = layoutDefinitions
    .filter((d) => d.id === active.id)
    .sort((a, b) => b.version - a.version);
  function apply(d: LayoutDefinition) {
    onChange(selectLayout(content, d));
    setOpen(false);
    setPreview(undefined);
  }
  // Candidate previews always use defaults and never mutate the active draft.
  const candidate = (d: LayoutDefinition): Content => ({
    ...content,
    site: {
      ...content.site,
      layout: {
        id: d.id,
        version: d.version,
        settings: structuredClone(d.defaults),
      },
    },
  });
  return (
    <>
      <PanelSection
        title="Site Layout"
        action={
          <Button
            variant="primary"
            onClick={() => {
              setOpen(true);
              setPreview(undefined);
            }}
          >
            Change layout
          </Button>
        }
      >
        <strong>{current?.label ?? active.id}</strong>
        <p className={styles.muted}>
          Version {active.version}
          {current?.deprecated ? ' · Retained version' : ''}
        </p>
        <p className={styles.muted}>{current?.description}</p>
        {versions.length > 1 && (
          <div className={styles.field}>
            <Label htmlFor="layout-version">Layout version</Label>
            <Select
              id="layout-version"
              aria-label="Layout version"
              value={String(active.version)}
              onValueChange={(v) => {
                const d = versions.find((d) => String(d.version) === v);
                if (d) apply(d);
              }}
            >
              {versions.map((d) => (
                <Select.Option key={d.version} value={String(d.version)}>
                  Version {d.version}
                  {d.deprecated ? ' (retained)' : ''}
                </Select.Option>
              ))}
            </Select>
            <small>
              Changing versions starts with that version’s default settings.
            </small>
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
            key={layoutKey(active)}
            content={content}
            settings={active.settings}
            onChange={(settings) =>
              onChange({
                ...content,
                site: { ...content.site, layout: { ...active, settings } },
              })
            }
          />
        ) : (
          <p role="alert">This layout’s settings editor is unavailable.</p>
        )}
      </Suspense>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog size="lg" className={`${styles.popup} ${styles.catalogPopup}`}>
          <Dialog.Title className={styles.srOnly}>
            Choose a site layout
          </Dialog.Title>
          <Dialog.Close
            render={
              <Button
                variant="ghost"
                shape="square"
                className={styles.catalogClose}
                aria-label="Close layout library"
              />
            }
          >
            <XIcon size={20} />
          </Dialog.Close>
          <div className={catalog.library}>
            <div className={catalog.heading}>
              <h2>{preview ? preview.label : 'Site layouts'}</h2>
              <p>
                Switching layouts starts with its defaults. Your pages and
                blocks stay in place.
              </p>
            </div>
            {preview ? (
              <>
                <div className={catalog.toolbar}>
                  <Button onClick={() => setPreview(undefined)}>
                    Back to layouts
                  </Button>
                  <Button onClick={() => setMobile(!mobile)}>
                    {mobile ? 'Desktop' : 'Mobile'}
                  </Button>
                  <Button variant="primary" onClick={() => apply(preview)}>
                    Use this layout
                  </Button>
                </div>
                <div className={catalog.preview} data-mobile={mobile}>
                  <LayoutSurface content={candidate(preview)}>
                    <PageBlocks
                      content={candidate(preview)}
                      page={previewPage}
                    />
                  </LayoutSurface>
                </div>
              </>
            ) : (
              <>
                <Input
                  aria-label="Search layouts"
                  placeholder="Search layouts"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className={catalog.grid}>
                  {cards.map((d) => (
                    <article key={d.id} className={catalog.card}>
                      <button
                        className={catalog.choose}
                        aria-label={`Use ${d.label} layout`}
                        onClick={() => apply(d)}
                      >
                        <div
                          className={catalog.thumbnail}
                          aria-hidden="true"
                          inert
                        >
                          <div className={catalog.miniature}>
                            <LayoutSurface content={candidate(d)}>
                              <div className={catalog.sample}>
                                <div />
                                <div />
                                <div />
                              </div>
                            </LayoutSurface>
                          </div>
                        </div>
                        <strong>{d.label}</strong>
                        <span>{d.description}</span>
                      </button>
                      <Button
                        variant="secondary"
                        aria-label={`Preview ${d.label} layout`}
                        onClick={() => {
                          setPreview(d);
                          setMobile(false);
                        }}
                      >
                        Preview
                      </Button>
                    </article>
                  ))}
                </div>
                {!cards.length && <p>No layouts match your search.</p>}
              </>
            )}
          </div>
        </Dialog>
      </Dialog.Root>
    </>
  );
}
