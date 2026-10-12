import { useEffect, useId, useRef } from 'react';

/** A static, image-derived halftone. Draw only on load/resize, never every frame.
 * CSS supplies the image fallback when canvas, CORS or decoding is unavailable. */
export default function Halftone({
  src,
  green = false,
}: {
  src?: string;
  green?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const filterId = useId();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    // A removed or failed replacement must reveal the current image fallback,
    // not leave the previous media selection painted over it.
    canvas.style.opacity = '0';
    if (!src) return;
    const bitmap = new Image();
    bitmap.crossOrigin = 'anonymous';
    let disposed = false;
    let frame = 0;
    function draw() {
      if (disposed || !bitmap.naturalWidth || !canvas) return;
      const width = Math.max(1, Math.round(canvas.clientWidth));
      const height = Math.max(1, Math.round(canvas.clientHeight));
      const step = green ? 4 : 5;
      const cols = Math.ceil(width / step),
        lines = Math.ceil(height / step);
      const sample = document.createElement('canvas');
      sample.width = cols;
      sample.height = lines;
      const source = sample.getContext('2d', { willReadFrequently: true });
      const target = canvas.getContext('2d');
      if (!source || !target) return;
      const scale = Math.max(
        cols / bitmap.naturalWidth,
        lines / bitmap.naturalHeight,
      );
      source.drawImage(
        bitmap,
        (cols - bitmap.naturalWidth * scale) / 2,
        (lines - bitmap.naturalHeight * scale) / 2,
        bitmap.naturalWidth * scale,
        bitmap.naturalHeight * scale,
      );
      try {
        const pixels = source.getImageData(0, 0, cols, lines).data;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        target.scale(ratio, ratio);
        target.fillStyle = green ? '#0a1509' : '#1a1709';
        target.fillRect(0, 0, width, height);
        target.fillStyle = green ? '#525652' : '#4c4343';
        for (let y = 0; y < lines; y++)
          for (let x = 0; x < cols; x++) {
            const offset = (y * cols + x) * 4;
            const light =
              (pixels[offset] * 0.21 +
                pixels[offset + 1] * 0.72 +
                pixels[offset + 2] * 0.07) /
              255;
            const radius = step * Math.min(0.43, Math.max(0.03, light * 0.58));
            target.beginPath();
            target.arc(
              x * step + (y % 2 ? step / 2 : 0),
              y * step,
              radius,
              0,
              Math.PI * 2,
            );
            target.fill();
          }
        canvas.style.opacity = '1';
      } catch {
        canvas.style.opacity = '0';
      }
    }
    const resize = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    });
    resize.observe(canvas);
    bitmap.onload = draw;
    bitmap.src = src;
    return () => {
      disposed = true;
      bitmap.onload = null;
      resize.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [src, green]);
  return (
    <div
      className={`quine-texture${green ? ' quine-texture-green' : ''}`}
      aria-hidden="true"
    >
      {src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="quine-texture-fallback"
        />
      )}
      <canvas ref={ref} />
      <svg className="quine-grain" width="100%" height="100%">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".85"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#${filterId})`}
          opacity=".22"
        />
      </svg>
    </div>
  );
}
