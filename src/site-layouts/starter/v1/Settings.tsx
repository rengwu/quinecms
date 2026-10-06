import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Dialog } from '@cloudflare/kumo/components/dialog';
import { Input } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import { Select } from '@cloudflare/kumo/components/select';
import { XIcon } from '@phosphor-icons/react';
import type { LayoutSettingsProps } from '../../../core/layout-contract';
import type { Values } from '../../../core/types';
import { newBlock } from '../../../core/content';
import { headerFields, headerValues } from '../../../core/header';
import { definitions } from '../../../generated/definitions';
import Fields from '../../../editor/Fields';
import PanelSection from '../../../editor/PanelSection';
import SiteDesign from '../../../editor/SiteDesign';
import BlockCatalog from '../../../editor/BlockCatalog';
import styles from '../../../editor/editor.module.css';
import { starterContent } from './policy';

export default function Settings({
  settings,
  content,
  onChange,
}: LayoutSettingsProps) {
  const [picking, setPicking] = useState(false);
  const view = starterContent(content, settings);
  const footer = view.site.footer;
  const definition = definitions.find(
    (d) => d.type === footer?.type && d.version === footer.version,
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
      <SiteDesign section="typography" globals={settings} onChange={onChange} />
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
          <Dialog.Title className={styles.srOnly}>Choose a footer</Dialog.Title>
          <Dialog.Close
            render={
              <Button
                variant="ghost"
                shape="square"
                className={styles.catalogClose}
                aria-label="Close footer library"
              />
            }
          >
            <XIcon size={20} />
          </Dialog.Close>
          <BlockCatalog
            definitions={definitions.filter((d) =>
              /^tw-footer-[123]$/.test(d.type),
            )}
            content={content}
            kind="static"
            placement="footer"
            onAdd={(d) => {
              onChange({
                ...settings,
                footer: newBlock(d) as unknown as Values,
              });
              setPicking(false);
            }}
          />
        </Dialog>
      </Dialog.Root>
    </>
  );
}
