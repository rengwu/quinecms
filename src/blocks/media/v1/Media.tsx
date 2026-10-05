import type { ViewProps } from '../../../core/types';
import { contentMaxWidth } from '../../../core/site-style';
import styles from './media.module.css';
export default function Media({ props, context }: ViewProps) {
  const ref = props.file;
  const media =
    ref && typeof ref === 'object' && !Array.isArray(ref)
      ? context.media.find((m) => m.id === ref.mediaId)
      : undefined;
  const alt =
    ref && typeof ref === 'object' && !Array.isArray(ref)
      ? String(ref.alt ?? '')
      : '';
  return (
    <figure className={styles.media}>
      {!media ? (
        <p>Select a media file.</p>
      ) : media.original.mime.startsWith('image/') ? (
        <img
          src={media.original.url}
          srcSet={
            media.variants
              .filter((v) => v.width)
              .map((v) => `${v.url} ${v.width}w`)
              .concat(
                media.original.width
                  ? [`${media.original.url} ${media.original.width}w`]
                  : [],
              )
              .join(', ') || undefined
          }
          sizes={`(max-width: ${contentMaxWidth(context.globals)}px) 100vw, ${contentMaxWidth(context.globals)}px`}
          width={media.original.width}
          height={media.original.height}
          alt={alt}
          loading="lazy"
        />
      ) : media.original.mime.startsWith('video/') ? (
        <video controls src={media.original.url} preload="metadata" />
      ) : media.original.mime.startsWith('audio/') ? (
        <audio controls src={media.original.url} preload="metadata" />
      ) : (
        <a href={media.original.url}>{media.name}</a>
      )}
      {props.caption && <figcaption>{String(props.caption)}</figcaption>}
    </figure>
  );
}
