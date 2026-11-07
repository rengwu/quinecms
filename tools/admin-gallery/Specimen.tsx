import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { PanelNavigation } from '../../src/editor/PanelNavigation';
import { useAdminTheme } from '../../src/editor/AdminTheme';
import css from './gallery.module.css';

export const interactions = ['None', 'Hover', 'Focus', 'Pressed'];
export const forced: Record<string, string> = {
  Hover: 'hover',
  Focus: 'focus',
  Pressed: 'active',
};
/** Content widths of the admin surfaces a component appears in. */
const widths = { sidebar: 192, drawer: 312, panel: 867 };

export interface Specimen {
  title: string;
  source: string;
  /** Each picker's first choice is the default. */
  pickers?: Record<string, string[]>;
  width?: keyof typeof widths;
  /** Contains fixed-position dialogs and toasts at this height. */
  height?: number;
  wide?: boolean;
  render(choice: Record<string, string>): ReactNode;
}
export interface Section {
  id: string;
  title: string;
  specimens: Specimen[];
}

class Boundary extends Component<{ children: ReactNode }, { error: string }> {
  state = { error: '' };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <p role="alert" data-specimen-error>
        {this.state.error}
      </p>
    ) : (
      this.props.children
    );
  }
}

/** Runs once after the specimen mounts, for states reached by interaction. */
export function Then({ run }: { run(stage: HTMLElement): Promise<void> }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    // Wait for the picker's click to finish, or popups treat it as outside.
    const stage = ref.current!.closest<HTMLElement>('[data-stage]')!;
    const timer = setTimeout(() =>
      run(stage).catch((cause: Error) => setError(cause.message)),
    );
    return () => clearTimeout(timer);
  }, []);
  return error ? (
    <p role="alert" className={css.note}>
      State unavailable: {error}
    </p>
  ) : (
    <span ref={ref} hidden />
  );
}

export function SpecimenCard({ specimen }: { specimen: Specimen }) {
  const { mode } = useAdminTheme();
  const pickers = Object.entries(specimen.pickers ?? {});
  const [choice, setChoice] = useState(() =>
    Object.fromEntries(pickers.map(([name, options]) => [name, options[0]])),
  );
  const width = specimen.width && widths[specimen.width];
  return (
    <article
      className={css.specimen}
      data-wide={specimen.wide || specimen.width === 'panel' || undefined}
      aria-label={specimen.title}
    >
      <header className={css.head}>
        <h3>{specimen.title}</h3>
        <code>{specimen.source}</code>
        {pickers.map(([name, options]) => (
          <div key={name} role="group" aria-label={name} className={css.picker}>
            <span>{name}</span>
            {options.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={choice[name] === option}
                onClick={() => setChoice({ ...choice, [name]: option })}
              >
                {option}
              </button>
            ))}
          </div>
        ))}
      </header>
      <div
        data-stage
        className={`admin-ui ${css.stage}`}
        data-mode={mode}
        data-contained={specimen.height ? true : undefined}
        data-gallery-force={forced[choice.Interaction] ?? ''}
        style={{ height: specimen.height }}
      >
        <div
          style={{
            maxWidth: width,
            display: 'grid',
            position: 'relative',
            minHeight: 80,
          }}
        >
          <Boundary key={JSON.stringify(choice)}>
            <PanelNavigation>{specimen.render(choice)}</PanelNavigation>
          </Boundary>
        </div>
      </div>
    </article>
  );
}
