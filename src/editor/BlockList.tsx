import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@cloudflare/kumo/components/button';
import { DotsSixVerticalIcon } from '@phosphor-icons/react';
import type { Block, Definition } from '../core/types';
import { useFlipList } from './useFlipList';
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
  label = 'Blocks',
  showVersion = true,
}: {
  label?: string;
  showVersion?: boolean;
  blocks: Block[];
  definitions: Pick<Definition, 'type' | 'version' | 'label'>[];
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
    blocks: Block[];
    pointerId: number;
    pointerY: number;
    grabY: number;
    rect: DOMRect;
    mode: string;
  } | null>(null);
  const suppressClick = useRef(false);
  const list = useRef<HTMLOListElement>(null);
  const carried = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState('');
  const [draft, setDraft] = useState<Block[] | null>(null);
  const displayed = draft ?? blocks;
  const capture = useFlipList(
    list,
    JSON.stringify(displayed.map((b) => b.id)),
    dragging,
  );
  const [announcement, announce] = useState('');
  function reset() {
    const held = source.current;
    capture(
      held
        ? {
            id: held.id,
            rect: new DOMRect(
              held.rect.left,
              held.pointerY - held.grabY,
              held.rect.width,
              held.rect.height,
            ),
          }
        : undefined,
    );
    source.current = null;
    setDragging('');
    setDraft(null);
  }
  useLayoutEffect(() => {
    if (source.current && (disabled || source.current.blocks !== blocks))
      reset();
  }, [blocks, disabled]);
  function sameOrder(a: Block[], b: Block[]) {
    return a.length === b.length && a.every((block, i) => block.id === b[i].id);
  }
  function preview(next: Block[]) {
    if (sameOrder(displayed, next)) return;
    capture();
    setDraft(next);
  }
  function commit(next: Block[], from: string) {
    if (disabled || sameOrder(blocks, next)) return;
    capture();
    onChange(next);
    announce(
      `Block moved to position ${next.findIndex((b) => b.id === from) + 1} of ${next.length}.`,
    );
  }
  function move(from: string, to: string, after: boolean) {
    if (disabled) return;
    const next = reorderBlocks(blocks, from, to, after);
    if (next === blocks) return;
    commit(next, from);
  }
  function orderAt(y: number) {
    const container = list.current;
    const from = source.current?.id;
    if (!container || !from) return null;
    const moving = blocks.find((block) => block.id === from);
    if (!moving) return null;
    const rows = (Array.from(container.children) as HTMLElement[]).filter(
      (row) => row.dataset.blockId !== from,
    );
    const top = container.getBoundingClientRect().top;
    // Use layout offsets, not FLIP-transformed rectangles, to avoid chasing
    // moving rows. Gutters and the dragged row's own slot remain valid.
    const before = rows.find(
      (row) => y < top + row.offsetTop + row.offsetHeight / 2,
    );
    const next = displayed.filter((block) => block.id !== from);
    const index = before
      ? next.findIndex((block) => block.id === before.dataset.blockId)
      : next.length;
    next.splice(index, 0, moving);
    return next;
  }
  const scrollUpdate = useRef(() => {});
  scrollUpdate.current = () => {
    const held = source.current;
    if (held?.active) preview(orderAt(held.pointerY) ?? displayed);
  };
  useLayoutEffect(() => {
    if (!dragging) return;
    let scroller = list.current?.parentElement ?? null;
    while (
      scroller &&
      !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)
    )
      scroller = scroller.parentElement;
    scroller ??= document.scrollingElement as HTMLElement | null;
    let frame = 0,
      previous = 0;
    const tick = (now: number) => {
      const held = source.current;
      if (!held) return;
      const elapsed = previous
        ? Math.min((now - previous) / (1000 / 60), 3)
        : 1;
      previous = now;
      if (held.active && scroller) {
        const viewport =
          scroller === document.scrollingElement
            ? { top: 0, bottom: window.innerHeight, height: window.innerHeight }
            : scroller.getBoundingClientRect();
        const edge = Math.min(32, viewport.height / 3);
        const distance =
          held.pointerY < viewport.top + edge
            ? held.pointerY - (viewport.top + edge)
            : Math.max(0, held.pointerY - (viewport.bottom - edge));
        const speed =
          Math.sign(distance) * Math.min(Math.abs(distance) ** 1.2 / 100, 3);
        const before = scroller.scrollTop;
        scroller.scrollTop = Math.max(
          0,
          Math.min(
            scroller.scrollHeight - scroller.clientHeight,
            before + speed * elapsed,
          ),
        );
        if (scroller.scrollTop !== before) scrollUpdate.current();
      }
      frame = requestAnimationFrame(tick);
    };
    const onScroll = () => scrollUpdate.current();
    window.addEventListener('scroll', onScroll, true);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [dragging]);
  function rowContent(block: Block) {
    return (
      <>
        <span>
          {definitions.find(
            (d) => d.type === block.type && d.version === block.version,
          )?.label ?? block.type}{' '}
          {showVersion && (
            <span className={styles.muted}>v{block.version}</span>
          )}
        </span>
        <DotsSixVerticalIcon aria-hidden size={16} className={styles.muted} />
      </>
    );
  }
  const held = source.current;
  const heldBlock = displayed.find((block) => block.id === dragging);
  return (
    <>
      <span id={help} className={styles.srOnly}>
        Drag to reorder. With a block focused, use Alt and the up or down arrow
        key to move it.
      </span>
      <ol
        ref={list}
        className={styles.blockList}
        aria-label={label}
        onPointerMove={(event) => {
          const start = source.current;
          if (!start || disabled || start.pointerId !== event.pointerId) return;
          start.pointerY = event.clientY;
          if (carried.current)
            carried.current.style.transform = `translateY(${start.pointerY - start.grabY}px)`;
          if (
            !start.active &&
            Math.hypot(event.clientX - start.x, event.clientY - start.y) < 6
          )
            return;
          if (!start.active) {
            // Transfer capture before moving keyed rows. Keeping ordinary
            // clicks captured by the button preserves their click target.
            event.currentTarget.setPointerCapture(event.pointerId);
            start.active = true;
          }
          suppressClick.current = true;
          preview(orderAt(event.clientY) ?? displayed);
        }}
        onPointerUp={(event) => {
          if (source.current && source.current.pointerId !== event.pointerId)
            return;
          if (source.current?.active) {
            source.current.pointerY = event.clientY;
            const next = orderAt(event.clientY);
            if (next) commit(next, source.current.id);
          }
          reset();
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={reset}
        onLostPointerCapture={(event) => {
          if (event.target === event.currentTarget) reset();
        }}
      >
        {displayed.map((block, index) => (
          <li
            key={block.id}
            className={styles.block}
            data-dragging={dragging === block.id}
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
                const rect =
                  event.currentTarget.parentElement!.getBoundingClientRect();
                capture();
                source.current = {
                  id: block.id,
                  x: event.clientX,
                  y: event.clientY,
                  active: false,
                  blocks,
                  pointerId: event.pointerId,
                  pointerY: event.clientY,
                  grabY: event.clientY - rect.top,
                  rect,
                  mode:
                    event.currentTarget
                      .closest('[data-mode]')
                      ?.getAttribute('data-mode') ?? 'dark',
                };
                setDragging(block.id);
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
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
                  source.current?.active ||
                  !event.altKey ||
                  !['ArrowUp', 'ArrowDown'].includes(event.key)
                )
                  return;
                event.preventDefault();
                const next = index + (event.key === 'ArrowDown' ? 1 : -1);
                if (blocks[next]) move(block.id, blocks[next].id, next > index);
              }}
            >
              {rowContent(block)}
            </Button>
          </li>
        ))}
      </ol>
      {held &&
        heldBlock &&
        createPortal(
          <div
            ref={carried}
            className={`kumo-ui ${styles.dragOverlay}`}
            data-mode={held.mode}
            data-sort-overlay={held.id}
            aria-hidden="true"
            inert
            style={{
              left: held.rect.left,
              width: held.rect.width,
              height: held.rect.height,
              transform: `translateY(${held.pointerY - held.grabY}px)`,
            }}
          >
            <Button
              className={styles.blockButton}
              variant="outline"
              tabIndex={-1}
            >
              {rowContent(heldBlock)}
            </Button>
          </div>,
          document.body,
        )}
      <span role="status" className={styles.srOnly}>
        {announcement}
      </span>
    </>
  );
}
