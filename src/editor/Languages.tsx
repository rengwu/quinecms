import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Badge } from '@cloudflare/kumo/components/badge';
import { Select } from '@cloudflare/kumo/components/select';
import type { Content, Issue } from '../core/types';
import {
  applyView,
  copyIssues,
  dropCopy,
  issueLabel,
  copyState,
  extraLanguages,
  languageName,
  mainLanguage,
  needsCopy,
  recordView,
  startCopy,
  type CopyState,
  type Translatable,
} from '../core/languages';
import { definitions } from '../generated/definitions';
import styles from './editor.module.css';

/** The editing language, kept across portal navigation (DEC-219). */
export const LanguageContext = createContext({
  main: 'en',
  language: 'en',
  enabled: false,
});
export function useLanguage() {
  const { main, language, enabled } = useContext(LanguageContext);
  return { main, language, enabled, secondary: language !== main };
}

export function LanguageSelect({
  content,
  value,
  disabled,
  onChange,
}: {
  content: Content;
  value: string;
  disabled: boolean;
  onChange(language: string): void;
}) {
  const extra = extraLanguages(content.site);
  if (!extra.length) return null;
  return (
    <Select
      className={styles.languageSelect}
      aria-label="Editing language"
      value={value}
      disabled={disabled}
      renderValue={(code) => (
        <>
          <span className={styles.wideOnly}>{languageName(String(code))}</span>
          <span className={styles.narrowOnly}>
            {String(code).toUpperCase()}
          </span>
        </>
      )}
      onValueChange={(code) => onChange(String(code))}
    >
      {[mainLanguage(content.site), ...extra].map((code) => (
        <Select.Option key={code} value={code}>
          {languageName(code)}
        </Select.Option>
      ))}
    </Select>
  );
}

const badge = {
  eligible: ['success', 'Eligible'],
  incomplete: ['warning', 'Incomplete'],
  none: ['outline', 'No copy'],
} as const;
export function CopyBadge({ state }: { state: CopyState }) {
  return <Badge variant={badge[state][0]}>{badge[state][1]}</Badge>;
}

/** Marks values that every language shares (DEC-218). */
export function SharedBadge({ image = false }: { image?: boolean }) {
  return useLanguage().secondary ? (
    <Badge variant="secondary" className={styles.fieldBadge}>
      {image ? 'Shared image' : 'Shared'}
    </Badge>
  ) : null;
}

/** One status line for a secondary-language copy, with no field notes (DEC-225). */
function CopyStatus({
  content,
  state,
  language,
  issues,
}: {
  content: Content;
  state: CopyState;
  language: string;
  issues: Issue[];
}) {
  const required = / is required\.$/;
  const missing = [
    ...new Set(
      issues
        .filter((i) => required.test(i.message))
        .map(
          (i) =>
            issueLabel(content, i.path, definitions) ??
            i.message.replace(required, ''),
        ),
    ),
  ];
  return (
    <div role="status" className={styles.copyStatus}>
      {state === 'none' ? (
        <Badge variant="outline">No {languageName(language)} copy</Badge>
      ) : (
        <CopyBadge state={state} />
      )}
      {state === 'incomplete' && (
        <span>
          {[
            ...(missing.length ? [`Missing ${missing.join(', ')}`] : []),
            ...issues
              .filter((i) => !required.test(i.message))
              .map((i) => i.message),
          ].join(' · ')}
        </span>
      )}
    </div>
  );
}

export const replaceRecord = (
  content: Content,
  record: Translatable,
): Content =>
  'design' in record
    ? {
        ...content,
        site: {
          ...content.site,
          layouts: content.site.layouts?.map((l) =>
            l.id === record.id ? record : l,
          ),
        },
      }
    : 'values' in record
      ? {
          ...content,
          entries: content.entries.map((e) =>
            e.id === record.id ? record : e,
          ),
        }
      : {
          ...content,
          pages: content.pages.map((p) => (p.id === record.id ? record : p)),
        };

export interface CopyEditing<T> {
  /** What the form edits: the record itself in the main language. */
  view?: T;
  change(next: T): void;
  status?: ReactNode;
  /** Present when the record has no copy in the editing language. */
  start?(): void;
  /** Present for an existing copy. */
  remove?(): void;
  /** Present while an uncommitted New copy form is open (DEC-224). */
  creation?: { title: string; record: T; create(): void; cancel(): void };
}

/** Edits a record in the selected language, splitting shared and localized values. */
export function useCopy<T extends Translatable>(
  content: Content,
  language: string,
  record: T | undefined,
  onChange: (next: T) => void,
): CopyEditing<T> {
  const secondary = language !== mainLanguage(content.site);
  const [pending, setPending] = useState<{ record: T; language: string }>();
  const creating =
    !!pending &&
    pending.record.id === record?.id &&
    pending.language === language;
  const current = creating ? pending.record : record;
  const translated =
    !!current && secondary && needsCopy(content, current, definitions);
  const statusContent = useMemo(
    () => (creating ? replaceRecord(content, pending.record) : content),
    [content, creating, pending],
  );
  const issues = useMemo(
    () =>
      translated ? copyIssues(statusContent, language, definitions) : undefined,
    [translated, statusContent, language],
  );
  if (!current || !translated || !issues)
    return { view: record, change: onChange };
  const state = copyState(
    statusContent,
    current,
    language,
    issues,
    definitions,
  )!;
  const status = (
    <CopyStatus
      content={statusContent}
      state={state}
      language={language}
      issues={issues.get(current.id) ?? []}
    />
  );
  if (state === 'none')
    return {
      status,
      change: onChange,
      start: () =>
        setPending({
          record: startCopy(content, current, language, definitions),
          language,
        }),
    };
  return {
    status,
    view: recordView(content, current, language, definitions),
    change: (next) => {
      const applied = applyView(content, current, language, next, definitions);
      if (creating) setPending({ record: applied, language });
      else onChange(applied);
    },
    remove: creating ? undefined : () => onChange(dropCopy(current, language)),
    creation: creating
      ? {
          title: `New ${languageName(language)} copy`,
          record: pending.record,
          create: () => {
            onChange(pending.record);
            setPending(undefined);
          },
          cancel: () => setPending(undefined),
        }
      : undefined,
  };
}
