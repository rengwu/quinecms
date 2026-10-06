import type { LayoutSettingsProps } from '../../../core/layout-contract';
import type { Field } from '../../../core/types';
import PanelSection from '../../../editor/PanelSection';
import Fields from '../../../editor/Fields';
import definition from './definition.json';
export default function Settings({
  content,
  settings,
  onChange,
}: LayoutSettingsProps) {
  return (
    <>
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
