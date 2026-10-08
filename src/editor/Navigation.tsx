import { Button } from '@cloudflare/kumo/components/button';
import { CaretRightIcon } from '@phosphor-icons/react';
import { useEffect, useId, useState } from 'react';
import styles from './editor.module.css';

export type EditorArea =
  | 'pages'
  | 'content'
  | 'collections'
  | 'objects'
  | 'media'
  | 'layout'
  | 'settings';
type NavigationLeaf = { area: EditorArea; label: string };
type NavigationGroup = {
  id: string;
  label: string;
  children: NavigationLeaf[];
};
const items: (NavigationLeaf | NavigationGroup)[] = [
  { area: 'pages', label: 'Pages' },
  { area: 'content', label: 'Content' },
  {
    id: 'schemas',
    label: 'Schemas',
    children: [
      { area: 'collections', label: 'Collections' },
      { area: 'objects', label: 'Objects' },
    ],
  },
  { area: 'media', label: 'Media' },
  { area: 'layout', label: 'Site Layout' },
  { area: 'settings', label: 'Settings' },
];

export default function Navigation({
  active,
  disabled,
  onSelect,
}: {
  active: EditorArea;
  disabled: boolean;
  onSelect(area: EditorArea): void;
}) {
  const id = useId();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const group = items.find(
      (item) =>
        'children' in item &&
        item.children.some((child) => child.area === active),
    );
    if (group && 'children' in group)
      setExpanded((current) => ({ ...current, [group.id]: true }));
  }, [active]);
  const leaf = ({ area, label }: NavigationLeaf) => (
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
  );
  return (
    <nav aria-label="Editor areas" className={styles.navigationLinks}>
      {items.map((item) =>
        'children' in item ? (
          <div key={item.id}>
            <Button
              variant="ghost"
              className={styles.navigationLink}
              aria-expanded={!!expanded[item.id]}
              aria-controls={`${id}-${item.id}`}
              disabled={disabled}
              onClick={() =>
                setExpanded((current) => ({
                  ...current,
                  [item.id]: !current[item.id],
                }))
              }
            >
              {item.label}
              <CaretRightIcon
                className={styles.navigationCaret}
                aria-hidden="true"
              />
            </Button>
            <div
              id={`${id}-${item.id}`}
              role="group"
              aria-label={item.label}
              className={styles.navigationChildren}
              hidden={!expanded[item.id]}
            >
              {item.children.map(leaf)}
            </div>
          </div>
        ) : (
          leaf(item)
        ),
      )}
    </nav>
  );
}
