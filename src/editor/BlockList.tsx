import { useId, useRef, useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { DotsSixVerticalIcon } from '@phosphor-icons/react';
import type { Block, Definition } from '../core/types';
import styles from './editor.module.css';

export function reorderBlocks(
  blocks: Block[],
  source: string,
  target: string,
  after: boolean,
) {
  if (
    source === target ||
    !blocks.some((b) => b.id === source) ||
    !blocks.some((b) => b.id === target)
  )
    return blocks;
  const next = blocks.filter((b) => b.id !== source);
  next.splice(
    next.findIndex((b) => b.id === target) + Number(after),
    0,
    blocks.find((b) => b.id === source)!,
  );
  return next;
}

export default function BlockList({
  blocks,
  definitions,
  disabled,
  onSelect,
  onChange,
}: {
  blocks: Block[];
  definitions: Definition[];
  disabled: boolean;
  onSelect(id: string): void;
  onChange(blocks: Block[]): void;
}) {
  const help = useId();
  const source = useRef<{
    id: string;
    x: number;
    y: number;
    active: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const list = useRef<HTMLOListElement>(null);
  const [dragging, setDragging] = useState('');
  const [target, setTarget] = useState<{ id: string; after: boolean } | null>(
    null,
  );
  const [announcement, announce] = useState('');
  function reset() {
    source.current = null;
    setDragging('');
    setTarget(null);
  }
  function move(from: string, to: string, after: boolean) {
    if (disabled) return;
    const next = reorderBlocks(blocks, from, to, after);
    if (next === blocks) return;
    onChange(next);
    announce(
      `Block moved to position ${next.findIndex((b) => b.id === from) + 1} of ${next.length}.`,
    );
  }
  return (
    <>
      <span id={help} className={styles.srOnly}>
        Drag to reorder. With a block focused, use Alt and the up or down arrow
        key to move it.
      </span>
      <ol ref={list} className={styles.blockList} aria-label="Blocks">
        {blocks.map((block, index) => (
          <li
            key={block.id}
            className={styles.block}
            data-dragging={dragging === block.id}
            data-drop={
              target?.id === block.id
                ? target.after
                  ? 'after'
                  : 'before'
                : undefined
            }
            data-block-id={block.id}
          >
            <Button
              className={styles.blockButton}
              variant="outline"
              disabled={disabled}
              aria-describedby={help}
              onPointerDown={(event) => {
                if (disabled || event.button !== 0 || !event.isPrimary) return;
                suppressClick.current = false;
                source.current = {
                  id: block.id,
                  x: event.clientX,
                  y: event.clientY,
                  active: false,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                const start = source.current;
                if (!start || disabled) return;
                if (
                  !start.active &&
                  Math.hypot(event.clientX - start.x, event.clientY - start.y) <
                    6
                )
                  return;
                start.active = true;
                suppressClick.current = true;
                setDragging(start.id);
                const row = document
                  .elementFromPoint(event.clientX, event.clientY)
                  ?.closest<HTMLElement>('[data-block-id]');
                if (!row || !list.current?.contains(row)) {
                  setTarget(null);
                  return;
                }
                const rect = row.getBoundingClientRect();
                setTarget({
                  id: row.dataset.blockId!,
                  after: event.clientY > rect.top + rect.height / 2,
                });
              }}
              onPointerUp={(event) => {
                if (source.current?.active && target)
                  move(source.current.id, target.id, target.after);
                reset();
                if (event.currentTarget.hasPointerCapture(event.pointerId))
                  event.currentTarget.releasePointerCapture(event.pointerId);
              }}
              onPointerCancel={reset}
              onLostPointerCapture={reset}
              onClick={() => {
                if (suppressClick.current) {
                  suppressClick.current = false;
                  return;
                }
                onSelect(block.id);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  reset();
                  return;
                }
                if (
                  !event.altKey ||
                  !['ArrowUp', 'ArrowDown'].includes(event.key)
                )
                  return;
                event.preventDefault();
                const next = index + (event.key === 'ArrowDown' ? 1 : -1);
                if (blocks[next]) move(block.id, blocks[next].id, next > index);
              }}
            >
              <span>
                {definitions.find(
                  (d) => d.type === block.type && d.version === block.version,
                )?.label ?? block.type}{' '}
                <span className={styles.muted}>v{block.version}</span>
              </span>
              <DotsSixVerticalIcon
                aria-hidden
                size={16}
                className={styles.muted}
              />
            </Button>
          </li>
        ))}
      </ol>
      <span role="status" className={styles.srOnly}>
        {announcement}
      </span>
    </>
  );
}
