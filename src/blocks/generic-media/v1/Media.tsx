import type { ViewProps } from '../../../core/types';
import Media from '../../media/v1/Media';
import styles from '../../media/v1/media.module.css';
export default function GenericMedia({ props, context }: ViewProps) {
  const caption = context.bindingPlaceholders?.caption ?? props.caption;
  if (context.bindingPlaceholders?.file)
    return (
      <figure className={styles.media}>
        <p>{context.bindingPlaceholders.file}</p>
        {caption && <figcaption>{String(caption)}</figcaption>}
      </figure>
    );
  if (!props.file)
    return caption ? (
      <figure className={styles.media}>
        <figcaption>{String(caption)}</figcaption>
      </figure>
    ) : (
      <span hidden />
    );
  return (
    <Media props={{ ...props, caption: caption ?? '' }} context={context} />
  );
}
