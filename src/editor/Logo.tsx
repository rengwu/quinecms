import {
  brandAmber,
  logoViewBox,
  markRing,
  markSquare,
  wordmark,
} from './brand';

// Ink follows the surrounding text colour, so one logo serves both admin modes.
export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={logoViewBox}
      role="img"
      aria-label="QuineCMS"
    >
      <path fill="currentColor" d={markRing} />
      <path fill={brandAmber} d={markSquare} />
      <path fill="currentColor" d={wordmark} />
    </svg>
  );
}
