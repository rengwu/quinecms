import type { CSSProperties, ReactNode } from 'react';
import { href } from './content';
import './styles.css';

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      className="quine-arrow"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} />
    </svg>
  );
}
export function Action({
  url,
  children,
  outline = false,
  arrow = false,
}: {
  url: unknown;
  children: ReactNode;
  outline?: boolean;
  arrow?: boolean;
}) {
  return (
    <a
      className={`quine-action${outline ? ' quine-action-outline' : ''}`}
      href={href(url)}
    >
      {children}
      {arrow && <Arrow />}
    </a>
  );
}
export function Wordmark({
  value,
  animated = false,
}: {
  value: string;
  animated?: boolean;
}) {
  return (
    <div
      className={`quine-wordmark${animated ? ' quine-wordmark-animated' : ''}`}
      role="img"
      aria-label={value}
    >
      {value
        .split(/\s+/)
        .filter(Boolean)
        .map((word, wordIndex) => (
          <span className="quine-word" aria-hidden="true" key={wordIndex}>
            {wordIndex > 0 && <span className="quine-word-space"> </span>}
            {[...word].map((letter, index) => (
              <span
                key={index}
                style={
                  {
                    '--letter-delay': `${(wordIndex * 5 + index) * 65}ms`,
                  } as CSSProperties
                }
              >
                {letter}
              </span>
            ))}
          </span>
        ))}
    </div>
  );
}
