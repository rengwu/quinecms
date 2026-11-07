import type { Content, Languages } from '../core/types';
import { countCopies, languageName, removeCopies } from '../core/languages';
import PanelSection from './PanelSection';
import styles from './editor.module.css';
import { Button, Label, Radio, Select, Switch } from './ui';

// Sites can use any BCP 47 code in content/site.json; the portal offers common ones.
const common = [
  'ar',
  'bn',
  'de',
  'en',
  'es',
  'fa',
  'fil',
  'fr',
  'he',
  'hi',
  'id',
  'it',
  'ja',
  'ko',
  'ms',
  'nl',
  'pl',
  'pt',
  'ru',
  'sv',
  'sw',
  'ta',
  'th',
  'tr',
  'uk',
  'ur',
  'vi',
  'zh',
];
const byName = (codes: string[]) =>
  [...new Set(codes)].sort((a, b) =>
    languageName(a).localeCompare(languageName(b)),
  );

/** Saved and published with site content (DEC-205). */
export default function LanguageSettings({
  content,
  onChange,
  confirm,
}: {
  content: Content;
  onChange(content: Content): void;
  confirm(request: {
    title: string;
    body: string;
    actionLabel: string;
    destructive: boolean;
    action(): void;
  }): void;
}) {
  const i18n: Languages = content.site.i18n ?? {
    enabled: false,
    main: 'en',
    languages: [],
    missing: 'fallback',
  };
  const set = (patch: Partial<Languages>) =>
    onChange({
      ...content,
      site: { ...content.site, i18n: { ...i18n, ...patch } },
    });
  const stored = i18n.languages.reduce(
    (total, code) => total + countCopies(content, code),
    0,
  );
  const mainName = languageName(i18n.main);
  return (
    <PanelSection title="Languages">
      <Switch
        label="Publish in multiple languages"
        checked={i18n.enabled}
        onCheckedChange={(enabled) => set({ enabled })}
      />
      {!i18n.enabled && stored > 0 && (
        <p className={styles.muted}>
          {stored} stored language {stored === 1 ? 'copy' : 'copies'} kept
        </p>
      )}
      {i18n.enabled && (
        <>
          <div className={styles.field}>
            <Label htmlFor="main-language">Main language</Label>
            <Select
              id="main-language"
              aria-label="Main language"
              className={styles.full}
              value={i18n.main}
              disabled={stored > 0}
              renderValue={(code) => languageName(String(code))}
              onValueChange={(code) => set({ main: String(code) })}
            >
              {byName([i18n.main, ...common])
                .filter((code) => !i18n.languages.includes(code))
                .map((code) => (
                  <Select.Option key={code} value={code}>
                    {languageName(code)}
                  </Select.Option>
                ))}
            </Select>
            {stored > 0 && (
              <p className={styles.muted}>Fixed once translations exist.</p>
            )}
          </div>
          <div className={styles.field}>
            <Label htmlFor="add-language">Additional languages</Label>
            {i18n.languages.length > 0 && (
              <ul
                className={styles.recordList}
                aria-label="Additional languages"
              >
                {i18n.languages.map((code) => (
                  <li key={code} className={styles.usageRow}>
                    <div>
                      <strong>{languageName(code)}</strong>
                      <span>/{code}</span>
                    </div>
                    <Button
                      variant="secondary-destructive"
                      onClick={() => {
                        const count = countCopies(content, code);
                        const name = languageName(code);
                        confirm({
                          title: `Remove ${name}?`,
                          body: `This deletes ${count} ${name} ${count === 1 ? 'copy' : 'copies'} from the draft. /${code} pages stop being published after the next Publish.`,
                          actionLabel: `Remove ${name}`,
                          destructive: true,
                          action: () =>
                            onChange(
                              removeCopies(
                                {
                                  ...content,
                                  site: {
                                    ...content.site,
                                    i18n: {
                                      ...i18n,
                                      languages: i18n.languages.filter(
                                        (c) => c !== code,
                                      ),
                                    },
                                  },
                                },
                                code,
                              ),
                            ),
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Select
              id="add-language"
              aria-label="Add language"
              className={styles.full}
              value=""
              placeholder="Add language…"
              renderValue={() => 'Add language…'}
              onValueChange={(code) =>
                code && set({ languages: [...i18n.languages, String(code)] })
              }
            >
              {byName(common)
                .filter(
                  (code) =>
                    code !== i18n.main && !i18n.languages.includes(code),
                )
                .map((code) => (
                  <Select.Option key={code} value={code}>
                    {languageName(code)}
                  </Select.Option>
                ))}
            </Select>
          </div>
          <Radio
            legend="When a translation is unavailable"
            value={i18n.missing}
            onValueChange={(missing) =>
              set({ missing: missing as Languages['missing'] })
            }
          >
            <Radio.Item
              value="fallback"
              label={`Show the whole ${mainName} item`}
            />
            <Radio.Item
              value="strict"
              label="Require every language before publishing"
            />
          </Radio>
        </>
      )}
    </PanelSection>
  );
}
