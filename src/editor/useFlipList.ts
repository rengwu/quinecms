import { useLayoutEffect, useRef, type RefObject } from 'react';

/** Animate only the editor rows, including interruptions midway through a move. */
export function useFlipList(
  list: RefObject<HTMLOListElement | null>,
  order: string,
  held = '',
) {
  const first = useRef(new Map<string, DOMRect>());
  const previous = useRef(new Map<string, DOMRect>());
  const animations = useRef(new Map<HTMLElement, Animation>());
  const focused = useRef<HTMLElement | null>(null);

  function capture(carried?: { id: string; rect: DOMRect }) {
    first.current = new Map(
      Array.from(list.current?.children ?? [], (child) => {
        const row = child as HTMLElement;
        return [row.dataset.blockId!, row.getBoundingClientRect()];
      }),
    );
    if (carried) first.current.set(carried.id, carried.rect);
    focused.current = list.current?.contains(document.activeElement)
      ? (document.activeElement as HTMLElement)
      : null;
  }

  useLayoutEffect(() => {
    const starts = first.current.size ? first.current : previous.current;
    first.current = new Map();
    for (const animation of animations.current.values()) animation.cancel();
    animations.current.clear();

    const rows = Array.from(list.current?.children ?? []) as HTMLElement[];
    // Read every final rectangle before writing animation transforms.
    const ends = new Map(
      rows.map((row) => [row.dataset.blockId!, row.getBoundingClientRect()]),
    );
    previous.current = ends;
    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (!reduced) {
      for (const row of rows) {
        if (row.dataset.blockId === held) continue;
        const from = starts.get(row.dataset.blockId!);
        const to = ends.get(row.dataset.blockId!)!;
        if (!from || !row.animate) continue;
        const x = from.left - to.left,
          y = from.top - to.top;
        if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) continue;
        const animation = row.animate(
          [
            { transform: `translate(${x}px, ${y}px)` },
            { transform: 'translate(0, 0)' },
          ],
          { duration: 150, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        );
        animations.current.set(row, animation);
        animation.onfinish = () => {
          if (animations.current.get(row) === animation)
            animations.current.delete(row);
        };
      }
    }
    if (
      focused.current?.isConnected &&
      document.activeElement !== focused.current
    )
      focused.current.focus({ preventScroll: true });
    focused.current = null;
  }, [list, order, held]);

  useLayoutEffect(
    () => () => {
      for (const animation of animations.current.values()) animation.cancel();
      animations.current.clear();
    },
    [],
  );

  return capture;
}
