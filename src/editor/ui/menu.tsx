import { useEffect, useRef, type ReactNode } from 'react';
import { DotsThreeIcon } from '@phosphor-icons/react';
import { cx } from './controls';
import buttonCss from './ui.module.css';

export interface MenuItem {
  label: string;
  onSelect(): void;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
}

/** A ⋯ menu of plain buttons. A disclosure keeps the actions in the document
 * for assistive technology and tests; outside presses and Escape close it. */
export function Menu({
  label,
  items,
  hint,
  className,
}: {
  label: string;
  items: MenuItem[];
  /** Explains why some actions are unavailable. */
  hint?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: Event) => {
      const menu = ref.current;
      if (!menu?.open) return;
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return;
        event.preventDefault();
        event.stopPropagation();
        menu.open = false;
        menu.querySelector('summary')?.focus();
      } else if (!menu.contains(event.target as Node)) menu.open = false;
    };
    document.addEventListener('pointerdown', close, true);
    document.addEventListener('keydown', close, true);
    return () => {
      document.removeEventListener('pointerdown', close, true);
      document.removeEventListener('keydown', close, true);
    };
  }, []);
  if (!items.length) return null;
  return (
    <details ref={ref} className={cx(buttonCss.menu, className)}>
      <summary
        aria-label={label}
        className={buttonCss.button}
        data-variant="ghost"
        data-shape="square"
      >
        <DotsThreeIcon weight="bold" />
      </summary>
      <div className={buttonCss.menuPopup}>
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={buttonCss.menuItem}
            data-destructive={item.destructive || undefined}
            disabled={item.disabled}
            onClick={() => {
              if (ref.current) ref.current.open = false;
              item.onSelect();
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        {hint && <p className={buttonCss.menuHint}>{hint}</p>}
      </div>
    </details>
  );
}
