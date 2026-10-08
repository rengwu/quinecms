import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Dialog } from '@cloudflare/kumo/components/dialog';
import { Input } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import { Select } from '@cloudflare/kumo/components/select';
import type { LayoutSettingsProps } from '../../../core/layout-contract';
import type { Block, Values } from '../../../core/types';
import { newBlock } from '../../../core/content';
import { headerFields, headerValues } from '../../../core/header';
import { definitions } from '../../../generated/definitions';
import Fields from '../../../editor/Fields';
import PanelSection from '../../../editor/PanelSection';
import SiteDesign from '../../../editor/SiteDesign';
import BlockCatalog from '../../../editor/BlockCatalog';
import CatalogHeader from '../../../editor/CatalogHeader';
import BlockCreation from '../../../editor/BlockCreation';
import styles from '../../../editor/editor.module.css';
import { starterContent } from './policy';
import layoutDefinition from './definition.json';

export default function Settings({
  settings,
  content,
  onChange,
}: LayoutSettingsProps) {
  const [picking, setPicking] = useState(false);
  const [pendingFooter, setPendingFooter] = useState<Block | null>(null);
  const view = starterContent(content, settings);
  const footer = view.site.footer;
  const definition = definitions.find(
    (d) => d.type === footer?.type && d.version === footer.version,
  );
  if (pendingFooter)
    return (
      <BlockCreation
        block={pendingFooter}
        content={content}
        footer
        level
        onChange={setPendingFooter}
        onCancel={() => setPendingFooter(null)}
        onCreate={() => {
          onChange({ ...settings, footer: pendingFooter as unknown as Values });
          setPendingFooter(null);
        }}
      />
    );
  return (
    <>
      <PanelSection title="Site identity">
        <div className={styles.field}>
          <Label htmlFor="site-title">Site title</Label>
          <Input
            id="site-title"
            aria-label="Site title"
            value={String(settings.title ?? '')}
            onChange={(e) => onChange({ ...settings, title: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="layout-theme">Theme</Label>
          <Select
            id="layout-theme"
            aria-label="Theme"
            value={String(settings.theme ?? 'light')}
            onValueChange={(value) =>
              onChange({ ...settings, theme: value ?? 'light' })
            }
          >
            <Select.Option value="light">light</Select.Option>
            <Select.Option value="dark">dark</Select.Option>
          </Select>
        </div>
      </PanelSection>
      <SiteDesign
        section="typography"
        globals={settings}
        defaults={layoutDefinition.defaults}
        onChange={onChange}
      />
      <SiteDesign
        globals={settings}
        defaults={layoutDefinition.defaults}
        onChange={onChange}
      />
      <PanelSection title="Header">
        <Fields
          fields={headerFields}
          values={headerValues(view)}
          media={content.media}
          collections={content.collections}
          onChange={(header) => onChange({ ...settings, header })}
        />
      </PanelSection>
      <PanelSection
        title="Footer"
        action={
          <Button onClick={() => setPicking(true)}>
            {footer ? 'Change footer' : 'Choose footer'}
          </Button>
        }
      >
        {footer ? (
          <>
            <p>{definition?.label ?? 'Unavailable footer'}</p>
            <Fields
              fields={definition?.fields ?? []}
              values={footer.props}
              media={content.media}
              collections={content.collections}
              onChange={(props) =>
                onChange({
                  ...settings,
                  footer: { ...footer, props } as unknown as Values,
                })
              }
            />
            <Button
              variant="secondary-destructive"
              onClick={() => {
                const next = { ...settings };
                delete next.footer;
                onChange(next);
              }}
            >
              Remove footer
            </Button>
          </>
        ) : (
          <p className={styles.muted}>
            The site title is shown until you choose a footer.
          </p>
        )}
      </PanelSection>
      <Dialog.Root open={picking} onOpenChange={setPicking}>
        <Dialog size="lg" className={`${styles.popup} ${styles.catalogPopup}`}>
          <CatalogHeader
            title="Choose a footer"
            closeLabel="Close footer library"
          />
          <BlockCatalog
            definitions={definitions.filter((d) =>
              /^tw-footer-[123]$/.test(d.type),
            )}
            content={content}
            kind="static"
            placement="footer"
            onAdd={(d) => {
              setPendingFooter(newBlock(d));
              setPicking(false);
            }}
          />
        </Dialog>
      </Dialog.Root>
    </>
  );
}
