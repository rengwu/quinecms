import { useLayoutEffect, useRef, useState } from 'react';
import {
  DotsThreeIcon,
  SidebarSimpleIcon,
  ArrowsOutSimpleIcon,
  FilesIcon,
  ImagesIcon,
  GearIcon,
  SquaresFourIcon,
  DatabaseIcon,
  BracketsCurlyIcon,
  CaretLeftIcon,
  CaretUpDownIcon,
  CheckIcon,
  CaretRightIcon,
  DesktopIcon,
  DeviceMobileIcon,
  DotsSixVerticalIcon,
  PlusIcon,
  XIcon,
  UploadSimpleIcon,
  TreeStructureIcon,
  ImageIcon,
  LinkSimpleIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  ParagraphIcon,
  TextBIcon,
  TextHThreeIcon,
  TextHTwoIcon,
  TextItalicIcon,
  YoutubeLogoIcon,
} from '@phosphor-icons/react';
import { useAdminTheme } from '../../../src/editor/AdminTheme';
import type { Section } from '../Specimen';
import css from '../gallery.module.css';

const sheets = import.meta.glob('../../../src/editor/**/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const source = Object.values(sheets).join('\n');
const unique = (pattern: RegExp, text = source) => [
  ...new Set([...text.matchAll(pattern)].map((m) => m[1])),
];
const tokens = unique(/var\((--[\w-]+)/g).filter((name) =>
  /--ui-(?:canvas|surface|raised|hover|field|line|fg|muted|faint|accent|on-accent|focus|danger|success|warning|link)/.test(
    name,
  ),
);
const sizes = unique(/font(?:-size)?:[^;]*?(\d+)px/g)
  .map(Number)
  .sort((a, b) => a - b);
const radii = unique(/border-radius:\s*(\d+px)/g);
const space = [...source.matchAll(/(--editor-space-\d+):\s*(\d+px)/g)];
const hex = unique(/(#[0-9a-f]{3,8})\b/gi);

function Swatch({ color, label }: { color: string; label: string }) {
  const { mode } = useAdminTheme();
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState('');
  useLayoutEffect(() => {
    const element = ref.current!;
    const name = color.match(/^var\((--[\w-]+)\)$/)?.[1];
    setValue(
      name && !getComputedStyle(element).getPropertyValue(name)
        ? 'Undefined'
        : getComputedStyle(element).backgroundColor,
    );
  }, [mode, color]);
  return (
    <div className={css.swatch}>
      <span ref={ref} style={{ background: color }} />
      <span>
        <code>{label}</code>
        <code>{value}</code>
      </span>
    </div>
  );
}

const glyphs = [
  ['←', 'Back'],
  ['↑ ↓', 'Reference order'],
  ['→', 'Object field rows'],
  ['¶ • 1.', 'Rich text blocks'],
  ['B I', 'Rich text marks'],
];

const section: Section = {
  id: 'foundations',
  title: 'Foundations',
  specimens: [
    {
      title: 'Colour tokens',
      source: 'src/editor/*.css',
      wide: true,
      render: () => (
        <div className={css.swatches}>
          {tokens.map((name) => (
            <Swatch key={name} color={`var(${name})`} label={name} />
          ))}
        </div>
      ),
    },
    {
      title: 'Hard-coded colours',
      source: 'src/editor/*.css',
      wide: true,
      render: () => (
        <div className={css.swatches}>
          {hex.map((value) => (
            <Swatch key={value} color={value} label={value} />
          ))}
        </div>
      ),
    },
    {
      title: 'Type sizes',
      source: 'src/editor/*.css',
      pickers: { Weight: ['400', '600'] },
      render: ({ Weight }) => (
        <div style={{ display: 'grid', gap: 8 }}>
          {sizes.map((size) => (
            <div
              key={size}
              style={{ fontSize: size, fontWeight: Number(Weight) }}
            >
              {size}px Unsaved changes
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Spacing and radii',
      source: 'src/editor/editor.module.css',
      render: () => (
        <div style={{ display: 'grid', gap: 12 }}>
          {space.map(([, name, value]) => (
            <div key={name} className={css.swatch}>
              <span style={{ width: value, background: 'var(--ui-line)' }} />
              <code>
                {name} {value}
              </code>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12 }}>
            {radii.map((radius) => (
              <div key={radius} className={css.swatch}>
                <span
                  style={{
                    borderRadius: radius,
                    background: 'var(--ui-raised)',
                  }}
                />
                <code>{radius}</code>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Icons and glyphs',
      source: '@phosphor-icons/react',
      render: () => (
        <div style={{ display: 'grid', gap: 12 }}>
          <div
            style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 20 }}
          >
            {[
              CaretUpDownIcon,
              CheckIcon,
              DotsThreeIcon,
              SidebarSimpleIcon,
              ArrowsOutSimpleIcon,
              FilesIcon,
              ImagesIcon,
              GearIcon,
              SquaresFourIcon,
              DatabaseIcon,
              TreeStructureIcon,
              BracketsCurlyIcon,
              UploadSimpleIcon,
              TextBIcon,
              TextItalicIcon,
              TextHTwoIcon,
              TextHThreeIcon,
              ParagraphIcon,
              ListBulletsIcon,
              ListNumbersIcon,
              LinkSimpleIcon,
              ImageIcon,
              YoutubeLogoIcon,
            ].map((Icon, index) => (
              <Icon key={index} />
            ))}
            <PlusIcon aria-label="Plus" />
            <XIcon aria-label="Close" />
            <CaretLeftIcon aria-label="Caret left" />
            <CaretRightIcon aria-label="Caret right" />
            <DotsSixVerticalIcon aria-label="Drag handle" />
            <DesktopIcon aria-label="Desktop" />
            <DeviceMobileIcon aria-label="Mobile" />
          </div>
          {glyphs.map(([glyph, use]) => (
            <div key={use}>
              <code>{glyph}</code> {use}
            </div>
          ))}
        </div>
      ),
    },
  ],
};
export default section;
