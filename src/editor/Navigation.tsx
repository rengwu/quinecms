import { Button } from '@cloudflare/kumo/components/button';
import styles from './editor.module.css';

export default function Navigation({
  active,
  disabled,
  onSelect,
}: {
  active: string;
  disabled: boolean;
  onSelect(area: string): void;
}) {
  return (
    <nav aria-label="Editor areas" className={styles.navigationLinks}>
      {[
        ['pages', 'Pages'],
        ['content', 'Content'],
        ['schemas', 'Collection schemas'],
        ['media', 'Media'],
        ['layout', 'Site Layout'],
        ['settings', 'Settings'],
      ].map(([area, label]) => (
        <Button
          key={area}
          variant="ghost"
          className={styles.navigationLink}
          aria-current={active === area ? 'page' : undefined}
          disabled={disabled}
          onClick={() => onSelect(area)}
        >
          {label}
        </Button>
      ))}
    </nav>
  );
}
