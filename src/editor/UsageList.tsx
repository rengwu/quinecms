import { useId } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import type { Content } from '../core/types';
import type { Usage } from '../core/schema';
import { describeUsage, type UsageTarget } from './usage';
import styles from './editor.module.css';

export default function UsageList({
  content,
  uses,
  description,
  onOpen,
  disabled = false,
}: {
  content: Content;
  uses: Usage[];
  description: string;
  onOpen(target: UsageTarget): void;
  disabled?: boolean;
}) {
  const headingId = useId();
  if (!uses.length) return null;
  return (
    <section className={styles.usage} aria-labelledby={headingId}>
      <h3 id={headingId}>
        Used in {uses.length} {uses.length === 1 ? 'place' : 'places'}
      </h3>
      <p>{description}</p>
      <ul className={styles.recordList}>
        {uses.map((use, i) => {
          const source = describeUsage(content, use);
          return (
            <li
              key={`${use.ownerId}:${use.path}:${i}`}
              className={styles.usageRow}
            >
              <div>
                <strong>{source.title}</strong>
                <span>{source.location}</span>
              </div>
              {source.target && (
                <Button
                  size="sm"
                  disabled={disabled}
                  aria-label={`Open ${source.title}: ${source.location}`}
                  onClick={() => onOpen(source.target!)}
                >
                  Open
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
