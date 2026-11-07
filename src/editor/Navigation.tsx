import {
  CaretRightIcon,
  FilesIcon,
  ImagesIcon,
  GearIcon,
  SquaresFourIcon,
  DatabaseIcon,
  BracketsCurlyIcon,
  TreeStructureIcon,
} from '@phosphor-icons/react';
import { useEffect, useId, useState, type PointerEvent } from 'react';
import type { Collection } from '../core/types';
import styles from './editor.module.css';
import { Button } from './ui';

export type EditorArea =
  | 'pages'
  | 'content'
  | 'collections'
  | 'objects'
  | 'media'
  | 'layout'
  | 'settings';
export default function Navigation({
  active,
  disabled,
  onSelect,
  collections = [],
  selectedCollection,
  onCollection,
}: {
  active: EditorArea;
  disabled: boolean;
  onSelect(area: EditorArea): void;
  collections?: Collection[];
  selectedCollection?: string;
  onCollection?(id: string): void;
}) {
  const id = useId();
  const [expanded, setExpanded] = useState(active === 'content');
  useEffect(() => {
    if (active === 'content') setExpanded(true);
  }, [active]);
  function leaf(area: EditorArea, label: string, icon: React.ReactNode) {
    return (
      <Button
        variant="ghost"
        icon={icon}
        className={styles.navigationLink}
        aria-label={area === 'collections' ? 'Collection schemas' : undefined}
        aria-current={active === area ? 'page' : undefined}
        disabled={disabled}
        onClick={() => onSelect(area)}
      >
        {label}
      </Button>
    );
  }
  return (
    <nav aria-label="Editor areas" className={styles.navigationLinks}>
      <span className={styles.navigationGroup}>Content</span>
      {leaf('pages', 'Pages', <FilesIcon />)}
      <Button
        variant="ghost"
        icon={<DatabaseIcon />}
        className={styles.navigationLink}
        aria-expanded={expanded}
        aria-controls={id}
        disabled={disabled}
        onClick={() => {
          setExpanded(!expanded);
          if (!collections.length) onSelect('content');
        }}
      >
        Collections
        <CaretRightIcon className={styles.navigationCaret} />
      </Button>
      <div id={id} className={styles.navigationChildren} hidden={!expanded}>
        {collections.map((collection) => (
          <Button
            key={collection.id}
            variant="ghost"
            className={styles.navigationLink}
            disabled={disabled}
            aria-current={
              active === 'content' && collection.id === selectedCollection
                ? 'page'
                : undefined
            }
            onClick={() => onCollection?.(collection.id)}
          >
            <span
              className={styles.navigationLabel}
              title={collection.name || 'Untitled collection'}
            >
              {collection.name || 'Untitled collection'}
            </span>
          </Button>
        ))}
        {!collections.length && (
          <span className={styles.muted}>No collections</span>
        )}
      </div>
      {leaf('media', 'Media', <ImagesIcon />)}
      <span className={styles.navigationGroup}>Design</span>
      {leaf('layout', 'Layouts', <SquaresFourIcon />)}
      <span className={styles.navigationGroup}>Schemas</span>
      {leaf('collections', 'Collections', <TreeStructureIcon />)}
      {leaf('objects', 'Objects', <BracketsCurlyIcon />)}
      <div className={styles.navigationBottom}>
        {leaf('settings', 'Settings', <GearIcon />)}
      </div>
    </nav>
  );
}

export const sidebarLimits = { min: 160, max: 360 };
export function readSidebarWidth() {
  try {
    const value = Number(localStorage.getItem('quinecms:sidebar-width'));
    return value
      ? Math.max(sidebarLimits.min, Math.min(sidebarLimits.max, value))
      : 224;
  } catch {
    return 224;
  }
}
export function SidebarResizeHandle({
  width,
  onChange,
}: {
  width: number;
  onChange(width: number): void;
}) {
  function change(value: number) {
    onChange(Math.max(sidebarLimits.min, Math.min(sidebarLimits.max, value)));
  }
  function drag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    const target = event.currentTarget,
      x = event.clientX;
    // Focus allows arrow keys right after a drag; data-pointer keeps that
    // pointer-originated focus from showing a focus indicator.
    target.dataset.pointer = 'true';
    target.focus();
    target.setPointerCapture(event.pointerId);
    const move = (e: globalThis.PointerEvent) => change(width + e.clientX - x);
    const end = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', end);
      target.removeEventListener('pointercancel', end);
      target.removeEventListener('lostpointercapture', end);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
    target.addEventListener('lostpointercapture', end);
  }
  return (
    <div
      className={styles.sidebarResize}
      role="separator"
      tabIndex={0}
      aria-label="Resize navigation"
      aria-orientation="vertical"
      aria-valuemin={sidebarLimits.min}
      aria-valuemax={sidebarLimits.max}
      aria-valuenow={width}
      onPointerDown={drag}
      onBlur={(e) => delete e.currentTarget.dataset.pointer}
      onKeyDown={(e) => {
        delete e.currentTarget.dataset.pointer;
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          change(
            e.key === 'Home'
              ? sidebarLimits.min
              : e.key === 'End'
                ? sidebarLimits.max
                : width + (e.key === 'ArrowLeft' ? -8 : 8),
          );
        }
      }}
    />
  );
}
