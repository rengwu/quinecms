import { useBackDepth } from './browser-back';
import { XIcon } from '@phosphor-icons/react';
import styles from './editor.module.css';
import { Button, Dialog } from './ui';

export default function CatalogHeader({
  title,
  closeLabel,
  description,
}: {
  title: string;
  closeLabel: string;
  description?: string;
}) {
  const backDepth = useBackDepth() + 1;
  return (
    <div className={styles.catalogHeader}>
      <div className={styles.catalogTitleRow}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Close
          render={
            <Button
              data-editor-back={backDepth}
              variant="ghost"
              shape="square"
              aria-label={closeLabel}
            />
          }
        >
          <XIcon size={20} />
        </Dialog.Close>
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
