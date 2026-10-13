import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Table } from '@cloudflare/kumo/components/table';
import { Switch } from '@cloudflare/kumo/components/switch';
import { Input } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import { Dialog } from '@cloudflare/kumo/components/dialog';
import { PlusIcon } from '@phosphor-icons/react';
import type { Content, LayoutDefinition, SiteLayout } from '../core/types';
import { id, contextFor } from '../core/content';
import {
  siteLayouts,
  layoutKey,
  layoutDefinitions,
  layoutPages,
  layoutRemovalReason,
  setLayoutActive,
  removeLayout,
  replaceLayout,
  contentForLayout,
} from '../core/layouts';
import { incomingUsage } from '../core/schema';
import type { UsageTarget } from './usage';
import { useAdminTheme } from './AdminTheme';
import { PanelNavigation } from './PanelNavigation';
import FormScreen from './FormScreen';
import LayoutCatalog from './LayoutCatalog';
import LayoutSettings from './LayoutSettings';
import LayoutSurface, { PageBlocks } from './LayoutSurface';
import UsageList from './UsageList';
import styles from './editor.module.css';

export default function SiteLayouts({
  content,
  selected,
  size,
  busy,
  onSelect,
  onChange,
  onOpen,
}: {
  content: Content;
  selected: string;
  size: string;
  busy: boolean;
  onSelect(id: string): void;
  onChange(content: Content): void;
  onOpen(target: UsageTarget): void;
}) {
  const { mode } = useAdminTheme();
  const [pending, setPending] = useState<SiteLayout>();
  const [catalog, setCatalog] = useState(false);
  const [confirm, setConfirm] = useState<LayoutDefinition | 'delete'>();
  const [error, setError] = useState('');
  const [previewId, setPreviewId] = useState('');
  const layouts = siteLayouts(content.site);
  const layout =
    pending?.id === selected
      ? pending
      : layouts.find((layout) => layout.id === selected);
  const creating = !!layout && layout === pending;
  const uses = layout ? layoutPages(content, layout.id) : [];
  const page =
    content.pages.find((page) => page.id === previewId) ??
    uses[0] ??
    content.pages.find((page) => page.path === '/') ??
    content.pages[0];
  const reason =
    layout && !creating ? layoutRemovalReason(content, layout.id) : undefined;
  const back = () => {
    setPending(undefined);
    onSelect('');
    setError('');
  };
  function change(next: SiteLayout) {
    if (creating) setPending(next);
    else onChange(replaceLayout(content, next));
  }
  function choose(definition: LayoutDefinition) {
    setCatalog(false);
    if (layout) {
      if (layoutKey(layout.design) !== layoutKey(definition))
        setConfirm(definition);
    } else {
      const next: SiteLayout = {
        id: id('layout'),
        name: definition.label,
        active: true,
        design: {
          id: definition.id,
          version: definition.version,
          settings: structuredClone(definition.defaults),
        },
      };
      setPending(next);
      onSelect(next.id);
      setError('');
    }
  }
  const view = layout ? contentForLayout(content, layout.design) : content;
  return (
    <>
      {!layout ? (
        <main
          className={`kumo-ui ${styles.home}`}
          data-mode={mode}
          aria-label="Site Layouts"
        >
          <div className={styles.pageOverview}>
            <div className={styles.sectionHeader}>
              <h1>Site Layouts</h1>
              <Button
                variant="primary"
                icon={<PlusIcon />}
                disabled={busy}
                onClick={() => setCatalog(true)}
              >
                Add layout
              </Button>
            </div>
            <p className={styles.muted}>
              Layouts in use cannot be turned off or deleted. At least one
              layout must stay active.
            </p>
            <div className={styles.pageTable}>
              <Table aria-label="Site Layouts">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Layout name</Table.Head>
                    <Table.Head>Design</Table.Head>
                    <Table.Head>Pages</Table.Head>
                    <Table.Head>Active</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {layouts.map((layout) => {
                    const design = layoutDefinitions.find(
                      (d) => layoutKey(d) === layoutKey(layout.design),
                    );
                    const count = layoutPages(content, layout.id).length;
                    const guard = layout.active
                      ? layoutRemovalReason(content, layout.id)
                      : undefined;
                    return (
                      <Table.Row
                        key={layout.id}
                        onClick={() => {
                          if (busy) return;
                          setPending(undefined);
                          onSelect(layout.id);
                          setError('');
                        }}
                      >
                        <Table.Cell>
                          <button
                            className={styles.pageTitle}
                            disabled={busy}
                            onClick={(event) => {
                              event.stopPropagation();
                              setPending(undefined);
                              onSelect(layout.id);
                              setError('');
                            }}
                          >
                            {layout.name || 'Untitled layout'}
                          </button>
                        </Table.Cell>
                        <Table.Cell>
                          {design?.label ?? layout.design.id} · v
                          {layout.design.version}
                        </Table.Cell>
                        <Table.Cell>{count}</Table.Cell>
                        <Table.Cell
                          onClick={(event) => event.stopPropagation()}
                        >
                          <span title={guard}>
                            <Switch
                              aria-label={`Active: ${layout.name}`}
                              checked={layout.active}
                              disabled={busy || !!guard}
                              onCheckedChange={(active) => {
                                try {
                                  onChange(
                                    setLayoutActive(content, layout.id, active),
                                  );
                                } catch (error) {
                                  setError(String(error));
                                }
                              }}
                            />
                          </span>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
            {error && <p role="alert">{error}</p>}
          </div>
        </main>
      ) : (
        <>
          <aside
            className={`kumo-ui ${styles.drawer}`}
            data-mode={mode}
            aria-label="Site builder"
          >
            <fieldset disabled={busy} className={styles.panelBody}>
              <PanelNavigation key={`${layout.id}:${layoutKey(layout.design)}`}>
                <FormScreen
                  title={
                    creating ? 'New layout' : layout.name || 'Untitled layout'
                  }
                  onBack={back}
                  creation={
                    creating
                      ? {
                          label: 'Create layout',
                          onCreate: () => {
                            if (!layout.name.trim()) {
                              setError('Enter a layout name.');
                              return;
                            }
                            onChange({
                              ...content,
                              site: {
                                ...content.site,
                                layouts: [
                                  ...layouts,
                                  { ...layout, name: layout.name.trim() },
                                ],
                              },
                            });
                            setPending(undefined);
                            setError('');
                          },
                        }
                      : undefined
                  }
                >
                  <div className={styles.field}>
                    <Label htmlFor="layout-name">Layout name</Label>
                    <Input
                      id="layout-name"
                      aria-label="Layout name"
                      value={layout.name}
                      onChange={(event) =>
                        change({ ...layout, name: event.target.value })
                      }
                    />
                  </div>
                  {error && <p role="alert">{error}</p>}
                  <LayoutSettings
                    content={content}
                    selection={layout.design}
                    previewPage={page}
                    onPreviewPage={setPreviewId}
                    onChange={(design) => change({ ...layout, design })}
                    onDesign={() => setCatalog(true)}
                    onVersion={choose}
                  />
                  {!creating && (
                    <>
                      <UsageList
                        content={content}
                        uses={incomingUsage(content).get(layout.id) ?? []}
                        description="These pages share this layout. Reassign them before turning it off or deleting it."
                        onOpen={onOpen}
                        disabled={busy}
                      />
                      {reason && <p className={styles.muted}>{reason}</p>}
                      <div className={styles.actionFooter}>
                        <Button
                          variant="secondary-destructive"
                          disabled={!!reason}
                          onClick={() => setConfirm('delete')}
                        >
                          Delete layout
                        </Button>
                      </div>
                    </>
                  )}
                </FormScreen>
              </PanelNavigation>
            </fieldset>
          </aside>
          <main
            className={styles.preview}
            data-size={size}
            aria-label="Live preview"
          >
            <LayoutSurface
              key={layout.id}
              content={view}
              onNavigate={(url, documentId) => {
                if (busy) return;
                const target =
                  documentId ??
                  Object.entries(contextFor(view, 'navigation').links).find(
                    ([, path]) => path === url,
                  )?.[0];
                if (target)
                  onOpen({
                    area: content.entries.some((entry) => entry.id === target)
                      ? 'content'
                      : 'pages',
                    id: target,
                  });
              }}
            >
              <PageBlocks
                content={view}
                page={page}
                className={styles.previewBlock}
              />
              {!page?.blocks.length && (
                <div className={styles.empty}>Layout preview</div>
              )}
            </LayoutSurface>
          </main>
        </>
      )}
      <Dialog.Root
        open={catalog || !!confirm}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setCatalog(false);
            setConfirm(undefined);
          }
        }}
      >
        <Dialog
          size="lg"
          className={`${styles.popup} ${catalog ? styles.catalogPopup : ''}`}
        >
          {catalog ? (
            <LayoutCatalog
              title={layout ? 'Change design' : 'Add layout'}
              content={content}
              page={page}
              onSelect={choose}
            />
          ) : confirm && layout ? (
            <>
              <Dialog.Title>
                {confirm === 'delete'
                  ? 'Delete this layout?'
                  : 'Reset layout settings?'}
              </Dialog.Title>
              <Dialog.Description>
                {confirm === 'delete'
                  ? `Delete “${layout.name}”? This change is local until you save the draft.`
                  : `Changing “${layout.name}” to ${confirm.label} v${confirm.version} replaces its settings with the design defaults. This affects ${uses.length} ${uses.length === 1 ? 'page' : 'pages'}. Page blocks stay unchanged.`}
              </Dialog.Description>
              <div className={styles.dialogActions}>
                <Button disabled={busy} onClick={() => setConfirm(undefined)}>
                  Cancel
                </Button>
                <Button
                  disabled={busy}
                  variant={confirm === 'delete' ? 'destructive' : 'primary'}
                  onClick={() => {
                    if (confirm === 'delete') {
                      try {
                        onChange(removeLayout(content, layout.id));
                        back();
                      } catch (error) {
                        setError(
                          error instanceof Error
                            ? error.message
                            : String(error),
                        );
                      }
                    } else
                      change({
                        ...layout,
                        design: {
                          id: confirm.id,
                          version: confirm.version,
                          settings: structuredClone(confirm.defaults),
                        },
                      });
                    setConfirm(undefined);
                  }}
                >
                  {confirm === 'delete'
                    ? 'Delete layout'
                    : 'Reset and change design'}
                </Button>
              </div>
            </>
          ) : null}
        </Dialog>
      </Dialog.Root>
    </>
  );
}
