import { createContext, useContext, useRef, useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import type { Media } from '../core/types';
import styles from './editor.module.css';

export const MediaUploadContext = createContext<{
  busy: boolean;
  available: boolean;
  upload(
    file: File,
    onProgress: (message: string) => void,
    onUploaded?: (media: Media) => void,
  ): Promise<void>;
} | null>(null);

/** The library and media fields share the same upload and feedback controls. */
export default function MediaUpload({
  label = 'Upload',
  fieldLabel,
  disabled = false,
  onUploaded,
}: {
  label?: string;
  fieldLabel?: string;
  disabled?: boolean;
  onUploaded?(media: Media): void;
}) {
  const uploads = useContext(MediaUploadContext);
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  if (!uploads?.available) return null;
  return (
    <div className={styles.mediaUpload}>
      <Button
        variant={fieldLabel ? 'secondary' : 'primary'}
        aria-label={fieldLabel ? `Upload for ${fieldLabel}` : label}
        disabled={disabled || uploads.busy}
        onClick={() => {
          setError('');
          setStatus('');
          input.current?.click();
        }}
      >
        {label}
      </Button>
      <input
        ref={input}
        hidden
        type="file"
        aria-label={fieldLabel ? `File for ${fieldLabel}` : 'File to upload'}
        disabled={disabled || uploads.busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          setError('');
          setStatus('Uploading…');
          void uploads.upload(file, setStatus, onUploaded).then(
            () => setStatus('Uploaded. Save the draft to keep this change.'),
            (error) => {
              setStatus('');
              setError(
                error instanceof Error
                  ? error.message
                  : 'Upload failed. Try again.',
              );
            },
          );
        }}
      />
      {status && <small role="status">{status}</small>}
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
