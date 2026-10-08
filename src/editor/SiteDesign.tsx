import { Input } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import { Select } from '@cloudflare/kumo/components/select';
import type { Values } from '../core/types';
import {
  DEFAULT_BODY_FONT_SIZE,
  DEFAULT_BODY_LINE_HEIGHT,
  SITE_FONTS,
  validSiteFont,
} from '../core/site-style';
import PanelSection from './PanelSection';
import styles from './editor.module.css';

export default function SiteDesign({
  globals,
  onChange,
  defaults,
  section = 'geometry',
}: {
  globals: Values;
  onChange: (globals: Values) => void;
  defaults: { contentMaxWidth: number; pageGutter: number };
  section?: 'typography' | 'geometry';
}) {
  function numberField(
    key: string,
    label: string,
    fallback: number,
    unit = '',
    min = 0.1,
    step = 0.1,
  ) {
    return (
      <div className={styles.field} key={key}>
        <Label htmlFor={`site-${key}`}>
          {label}
          {unit && ` (${unit})`}
        </Label>
        <Input
          id={`site-${key}`}
          aria-label={label}
          type="number"
          min={min}
          step={step}
          placeholder={String(fallback)}
          value={String(globals[key] ?? '')}
          onChange={(event) =>
            onChange({
              ...globals,
              [key]:
                event.target.value === '' ? null : Number(event.target.value),
            })
          }
        />
      </div>
    );
  }
  return (
    <>
      {section === 'typography' && (
        <PanelSection title="Typography">
          {(['bodyFont', 'headingFont'] as const).map((key) => {
            const label = key === 'bodyFont' ? 'Body font' : 'Heading font';
            return (
              <div className={styles.field} key={key}>
                <Label htmlFor={`site-${key}`}>{label}</Label>
                <Select
                  className={styles.full}
                  id={`site-${key}`}
                  aria-label={label}
                  renderValue={(value) =>
                    SITE_FONTS.find((font) => font.id === value)?.label ??
                    'System sans'
                  }
                  value={
                    validSiteFont(globals[key])
                      ? String(globals[key])
                      : 'system'
                  }
                  onValueChange={(value) =>
                    onChange({ ...globals, [key]: value ?? 'system' })
                  }
                >
                  {SITE_FONTS.map((font) => (
                    <Select.Option key={font.id} value={font.id}>
                      {font.label}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            );
          })}
          {numberField(
            'bodyFontSize',
            'Body font size',
            DEFAULT_BODY_FONT_SIZE,
            'px',
          )}
          {numberField(
            'bodyLineHeight',
            'Body line height',
            DEFAULT_BODY_LINE_HEIGHT,
          )}
        </PanelSection>
      )}
      {section === 'geometry' && (
        <PanelSection title="Content spacing">
          {numberField(
            'contentMaxWidth',
            'Content max-width',
            defaults.contentMaxWidth,
            'px',
            1,
            1,
          )}
          {numberField(
            'pageGutter',
            'Page gutter',
            defaults.pageGutter,
            'px',
            0,
            1,
          )}
        </PanelSection>
      )}
    </>
  );
}
