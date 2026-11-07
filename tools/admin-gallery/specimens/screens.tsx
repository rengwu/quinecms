import { useLayoutEffect, useRef, useState } from 'react';
import { useAdminTheme } from '../../../src/editor/AdminTheme';
import { screens } from '../screens';
import { forced, interactions, type Section, type Specimen } from '../Specimen';
import css from '../gallery.module.css';

const sizes = { Desktop: [1280, 800], Narrow: [390, 760] } as const;

/** A real editor document at a real viewport size, scaled to the card. */
function Frame({
  query,
  title,
  width,
}: {
  query: string;
  title: string;
  width: keyof typeof sizes;
}) {
  const { mode } = useAdminTheme();
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [w, h] = sizes[width];
  useLayoutEffect(() => {
    const element = box.current!;
    const update = () => setScale(Math.min(1, element.clientWidth / w));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [w]);
  return (
    <div ref={box} className={css.frame} style={{ height: h * scale }}>
      <iframe
        // The editor reads its theme once, on load.
        key={mode + query}
        src={`frame.html?${query}`}
        title={title}
        width={w}
        height={h}
        loading="lazy"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}

const titles: Record<string, string> = {
  pages: 'Pages',
  content: 'Content',
  preview: 'Preview workspace',
  schemas: 'Schemas',
  areas: 'Media, layouts and settings',
  topbar: 'Top bar and save states',
};

const editor: Specimen[] = Object.entries(screens).map(([group, options]) => ({
  title: titles[group],
  source: 'src/editor/App.tsx',
  wide: true,
  pickers: {
    Screen: Object.values(options).map((o) => o.label),
    Width: Object.keys(sizes),
  },
  render: ({ Screen, Width }) => {
    const [key, screen] = Object.entries(options).find(
      ([, o]) => o.label === Screen,
    )!;
    const query = new URLSearchParams({
      screen: `${group}.${key}`,
      ...(screen.git ? { git: screen.git } : {}),
    });
    return (
      <Frame
        query={String(query)}
        title={Screen}
        width={screen.narrow ? 'Narrow' : (Width as keyof typeof sizes)}
      />
    );
  },
}));

const login: Specimen = {
  title: 'Login',
  source: 'src/admin/login-screen.ts',
  wide: true,
  pickers: {
    State: ['Ready', 'Loading', 'Error', 'Unlocking'],
    Width: Object.keys(sizes),
    Interaction: interactions,
  },
  render: ({ State, Width, Interaction }) => {
    const state = {
      Ready: 'ready',
      Loading: 'loading',
      Error: 'error',
      Unlocking: 'busy',
    }[State];
    const query = new URLSearchParams({
      screen: `login.${state}`,
      force: forced[Interaction] ?? '',
    });
    return (
      <Frame
        query={String(query)}
        title="Login"
        width={Width as keyof typeof sizes}
      />
    );
  },
};

const section: Section = {
  id: 'screens',
  title: 'Screens',
  specimens: [...editor, login],
};
export default section;
