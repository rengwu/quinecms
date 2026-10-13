import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import { Label } from '@cloudflare/kumo/components/label';
import { Link } from '@cloudflare/kumo/components/link';
import {
  parseR2Account,
  testStorageConnection,
  validateStorageConfig,
  type StorageConfig,
} from '../integrations/media';
import styles from './editor.module.css';
import setup from './storage.module.css';

export default function StorageSettings({
  config,
  onSave,
  onCancel,
}: {
  config: StorageConfig;
  onSave(config: StorageConfig): void;
  onCancel(): void;
}) {
  const [draft, setDraft] = useState(config);
  const [widths, setWidths] = useState(config.variantWidths.join(', '));
  const [error, setError] = useState('');
  const [test, setTest] = useState<'idle' | 'testing' | 'passed'>('idle');
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const cors = JSON.stringify(
    [
      {
        AllowedOrigins: [window.location.origin],
        AllowedMethods: ['GET', 'HEAD', 'PUT', 'DELETE'],
        AllowedHeaders: ['*'],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3600,
      },
    ],
    null,
    2,
  );

  function setAccount(value: string) {
    try {
      setDraft({ ...draft, ...parseR2Account(value) });
    } catch {
      setDraft({ ...draft, accountId: value });
    }
  }

  function settings() {
    return validateStorageConfig({
      ...draft,
      variantWidths: widths.trim() ? widths.split(',').map(Number) : [],
    });
  }

  return (
    <form
      className={setup.form}
      noValidate
      onChange={() => {
        setTest('idle');
        setError('');
      }}
      onSubmit={(event) => {
        event.preventDefault();
        if (test === 'testing') return;
        try {
          onSave(settings());
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'Could not save storage settings.',
          );
        }
      }}
    >
      <fieldset className={setup.fields} disabled={test === 'testing'}>
        <div className={styles.field}>
          <Label htmlFor="r2-account">Account ID or S3 API URL</Label>
          <Input
            id="r2-account"
            aria-label="Account ID or S3 API URL"
            autoComplete="off"
            spellCheck={false}
            value={draft.accountId}
            onChange={(e) => setAccount(e.target.value)}
            aria-describedby="r2-account-help"
            placeholder="Paste from Cloudflare → bucket Settings"
          />
          <p id="r2-account-help" className={styles.muted}>
            Pasting the S3 API URL fills the account ID and bucket, if included.
          </p>
        </div>
        <div className={styles.field}>
          <Label htmlFor="r2-bucket">Bucket</Label>
          <Input
            id="r2-bucket"
            aria-label="Bucket"
            autoComplete="off"
            spellCheck={false}
            value={draft.bucket}
            onChange={(e) => setDraft({ ...draft, bucket: e.target.value })}
            placeholder="my-site-media"
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="r2-public">Public media URL</Label>
          <Input
            id="r2-public"
            aria-label="Public media URL"
            type="url"
            autoComplete="off"
            spellCheck={false}
            value={draft.publicURL}
            onChange={(e) => setDraft({ ...draft, publicURL: e.target.value })}
            aria-describedby="r2-public-help"
            placeholder="https://pub-….r2.dev"
          />
          <p id="r2-public-help" className={styles.muted}>
            In bucket Settings, enable Public Development URL for testing, or
            connect a custom domain for production.
          </p>
        </div>
        <div className={setup.credentials}>
          <div className={styles.field}>
            <Label htmlFor="r2-access">Access key ID</Label>
            <Input
              id="r2-access"
              aria-label="Access key ID"
              autoComplete="off"
              spellCheck={false}
              value={draft.accessKeyId}
              onChange={(e) =>
                setDraft({ ...draft, accessKeyId: e.target.value })
              }
              aria-describedby="r2-credentials-help"
            />
          </div>
          <div className={styles.field}>
            <Label htmlFor="r2-secret">Secret access key</Label>
            <Input
              id="r2-secret"
              aria-label="Secret access key"
              type="password"
              autoComplete="off"
              value={draft.secretAccessKey}
              onChange={(e) =>
                setDraft({ ...draft, secretAccessKey: e.target.value })
              }
              aria-describedby="r2-credentials-help"
            />
          </div>
          <p id="r2-credentials-help" className={styles.muted}>
            <Link
              href="https://developers.cloudflare.com/r2/api/tokens/"
              target="_blank"
              rel="noreferrer"
            >
              Create an R2 API token
            </Link>{' '}
            with Object Read &amp; Write for this bucket. Paste its two S3
            credentials above.
          </p>
        </div>
        <div className={styles.field}>
          <div>
            <Button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(cors);
                  setCopied(true);
                  setCopyFailed(false);
                } catch {
                  setCopyFailed(true);
                  setCopied(false);
                }
              }}
            >
              Copy CORS policy
            </Button>
          </div>
          <p className={styles.muted}>
            Paste into bucket Settings → CORS Policy to allow uploads from{' '}
            <span className={setup.origin}>{window.location.origin}</span>. Keep
            any origins you already use.
          </p>
          <span role="status" className={styles.muted}>
            {copied ? 'CORS policy copied.' : ''}
          </span>
          {copyFailed && (
            <div className={styles.field}>
              <Label htmlFor="r2-cors">Copy this CORS policy manually</Label>
              <textarea id="r2-cors" readOnly value={cors} rows={8} />
            </div>
          )}
        </div>
        <details className={setup.advanced}>
          <summary>Advanced</summary>
          <div className={setup.form}>
            <div className={styles.field}>
              <Label htmlFor="r2-limit">Upload limit (MB)</Label>
              <Input
                id="r2-limit"
                aria-label="Upload limit (MB)"
                type="number"
                min="1"
                value={draft.maxMB}
                onChange={(e) =>
                  setDraft({ ...draft, maxMB: Number(e.target.value) })
                }
              />
            </div>
            <div className={styles.field}>
              <Label htmlFor="r2-widths">Image widths</Label>
              <Input
                id="r2-widths"
                aria-label="Image widths"
                value={widths}
                onChange={(e) => setWidths(e.target.value)}
                aria-describedby="r2-widths-help"
              />
              <p id="r2-widths-help" className={styles.muted}>
                Comma-separated pixels, 64–4096. Leave blank to upload originals
                only.
              </p>
            </div>
            <div className={styles.field}>
              <Label htmlFor="r2-quality">Image quality</Label>
              <Input
                id="r2-quality"
                aria-label="Image quality"
                type="number"
                min="0.1"
                max="1"
                step="0.05"
                value={draft.quality}
                onChange={(e) =>
                  setDraft({ ...draft, quality: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </details>
      </fieldset>
      <p className={styles.muted}>
        Testing uploads, reads and deletes a tiny file. Settings stay in this
        tab.
      </p>
      {error && <p role="alert">{error}</p>}
      <p role="status" className={styles.muted}>
        {test === 'testing'
          ? 'Testing connection…'
          : test === 'passed'
            ? 'Connection works. Upload, public read and cleanup succeeded.'
            : ''}
      </p>
      <div className={styles.dialogActions}>
        <Button
          type="button"
          className={setup.testButton}
          disabled={test === 'testing'}
          onClick={async () => {
            setError('');
            setTest('testing');
            try {
              await testStorageConnection(settings());
              setTest('passed');
            } catch (error) {
              setTest('idle');
              setError(
                error instanceof Error
                  ? error.message
                  : 'Could not test the connection.',
              );
            }
          }}
        >
          Test connection
        </Button>
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={test === 'testing'}>
          Save settings
        </Button>
      </div>
    </form>
  );
}
