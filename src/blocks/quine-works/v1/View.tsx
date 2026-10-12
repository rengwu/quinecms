import { useEffect, useId, useState } from 'react';
import type { ViewProps } from '../../../core/types';
import {
  anchor,
  href,
  image,
  rows,
  text,
} from '../../../themes/quine/v1/content';
import '../../../themes/quine/v1/styles.css';

function Scramble({ label, active }: { label: string; active: boolean }) {
  const [display, setDisplay] = useState(label);
  useEffect(() => {
    if (!active || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(label);
      return;
    }
    const started = performance.now();
    let frame = 0;
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
    const draw = (now: number) => {
      const progress = Math.min(1, (now - started) / 320);
      setDisplay(
        [...label]
          .map((letter, index) =>
            index < progress * label.length || letter === ' '
              ? letter
              : alphabet[Math.floor(Math.random() * alphabet.length)],
          )
          .join(''),
      );
      if (progress < 1) frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [label, active]);
  return <span aria-hidden="true">{display}</span>;
}

export default function Works({ props, context }: ViewProps) {
  const projects = rows(props.projects);
  const [selected, select] = useState('');
  const [hovered, hover] = useState('');
  const id = useId();
  const rowId = (index: number) =>
    text(projects[index]?._rowId) || String(index);
  const selectedIndex = Math.max(
    0,
    projects.findIndex((_, index) => rowId(index) === selected),
  );
  const project = projects[selectedIndex];
  const asset = project ? image(project.image, context) : undefined;
  return (
    <section
      className="quine-scope quine-section quine-works"
      id={anchor(props.anchor)}
    >
      <div className="quine-frame">
        <p className="quine-caption">{text(props.eyebrow)}</p>
        <h2 className="quine-heading">{text(props.heading)}</h2>
        {projects.length ? (
          <div className="quine-gallery">
            <div
              className="quine-project-list"
              role="tablist"
              aria-label="Projects"
              aria-orientation="vertical"
            >
              {projects.map((row, index) => {
                const label = `${index + 1}. ${text(row.title)}${row.year ? ` - ${text(row.year)}` : ''}`;
                const key = rowId(index);
                return (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    id={`${id}-tab-${index}`}
                    aria-controls={`${id}-panel`}
                    aria-selected={index === selectedIndex}
                    aria-label={label}
                    tabIndex={index === selectedIndex ? 0 : -1}
                    onClick={() => select(key)}
                    onMouseEnter={() => hover(key)}
                    onMouseLeave={() => hover('')}
                    onFocus={() => hover(key)}
                    onBlur={() => hover('')}
                    onKeyDown={(event) => {
                      const next =
                        event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? projects.length - 1
                            : ['ArrowDown', 'ArrowRight'].includes(event.key)
                              ? (index + 1) % projects.length
                              : ['ArrowUp', 'ArrowLeft'].includes(event.key)
                                ? (index - 1 + projects.length) %
                                  projects.length
                                : undefined;
                      if (next === undefined) return;
                      event.preventDefault();
                      select(rowId(next));
                      event.currentTarget.parentElement
                        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                        [next]?.focus();
                    }}
                  >
                    <Scramble label={label} active={hovered === key} />
                  </button>
                );
              })}
            </div>
            <div
              className="quine-project-preview"
              id={`${id}-panel`}
              role="tabpanel"
              aria-labelledby={`${id}-tab-${selectedIndex}`}
            >
              {asset ? (
                <img
                  key={asset.url}
                  src={asset.url}
                  alt={asset.alt || text(project.title)}
                  width={asset.width}
                  height={asset.height}
                  loading="lazy"
                />
              ) : (
                <div className="quine-image-empty">
                  {context.preview
                    ? 'Choose a project image in Projects.'
                    : text(project.title)}
                </div>
              )}
              {href(project.url) && (
                <a
                  className="quine-action"
                  href={href(project.url)}
                  aria-label={`${text(props.visitLabel) || 'Visit'} ${text(project.title)}`}
                >
                  {text(props.visitLabel) || 'Visit'}
                </a>
              )}
            </div>
          </div>
        ) : context.preview ? (
          <p className="quine-body">
            Add projects to this block to build the gallery.
          </p>
        ) : null}
      </div>
    </section>
  );
}
