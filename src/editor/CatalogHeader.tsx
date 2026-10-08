import { Button } from '@cloudflare/kumo/components/button';
import { Dialog } from '@cloudflare/kumo/components/dialog';
import { XIcon } from '@phosphor-icons/react';
import styles from './editor.module.css';

export default function CatalogHeader({
  title,
  closeLabel,
  description,
}: {
  title: string;
  closeLabel: string;
  description?: string;
}) {
  return (
    <div className={styles.catalogHeader}>
      <div className={styles.catalogTitleRow}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Close
          render={
            <Button variant="ghost" shape="square" aria-label={closeLabel} />
          }
        >
          <XIcon size={20} />
        </Dialog.Close>
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
