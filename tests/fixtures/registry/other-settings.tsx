import type { LayoutSettingsProps } from '../../../src/core/layout-contract';
import type { Field } from '../../../src/core/types';
import PanelSection from '../../../src/editor/PanelSection';
import Fields from '../../../src/editor/Fields';
import SiteDesign from '../../../src/editor/SiteDesign';
import definition from './chartr.json';
export default function Settings({
  content,
  settings,
  onChange,
}: LayoutSettingsProps) {
  return (
    <>
      <SiteDesign
        globals={settings}
        defaults={definition.defaults}
        onChange={onChange}
      />
      {[
        [
          'Identity and appearance',
          [
            'title',
            'description',
            'brand',
            'homeURL',
            'appearance',
            'allowToggle',
          ],
        ],
        [
          'Header',
          [
            'navigation',
            'sourceLabel',
            'sourceURL',
            'downloadLabel',
            'downloadURL',
          ],
        ],
        ['Footer', ['footerLinks', 'copyright']],
      ].map(([title, keys]) => (
        <PanelSection key={title as string} title={title as string}>
          <Fields
            fields={(definition.fields as Field[]).filter((f) =>
              (keys as string[]).includes(f.key),
            )}
            values={settings}
            media={content.media}
            collections={content.collections}
            onChange={onChange}
          />
        </PanelSection>
      ))}
    </>
  );
}
