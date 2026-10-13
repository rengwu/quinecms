import { Input } from '@cloudflare/kumo/components/input';
import { Select } from '@cloudflare/kumo/components/select';
import type { Media } from '../core/types';
import { isRecord } from '../core/schema';
import MediaUpload from './MediaUpload';
import styles from './editor.module.css';

export default function MediaField({
  id,
  label,
  value,
  media,
  onChange,
  readOnly,
}: {
  id: string;
  label: string;
  value: unknown;
  media: Media[];
  onChange(value: { mediaId: string; alt: string } | null): void;
  readOnly: boolean;
}) {
  const reference = isRecord(value) ? value : {};
  const selected = media.find((item) => item.id === reference.mediaId);
  const select = (mediaId: string) =>
    onChange(mediaId ? { mediaId, alt: '' } : null);
  return (
    <>
      <Select
        className={styles.full}
        id={id}
        aria-label={label}
        placeholder="Choose media…"
        renderValue={(id) =>
          media.find((item) => item.id === id)?.name || 'Choose media…'
        }
        value={String(reference.mediaId ?? '')}
        disabled={readOnly}
        onValueChange={(value) => select(value ?? '')}
      >
        <Select.Option value="">Choose media…</Select.Option>
        {media.map((item) => (
          <Select.Option value={item.id} key={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
      <MediaUpload
        fieldLabel={label}
        disabled={readOnly}
        onUploaded={(item) => select(item.id)}
      />
      {selected?.original.mime.startsWith('image/') && (
        <img
          className={styles.mediaThumbnail}
          src={selected.variants[0]?.url ?? selected.original.url}
          alt={selected.name}
          width="96"
          height="72"
        />
      )}
      <Input
        aria-label={`${label} alternative text`}
        placeholder="Alternative text"
        value={String(reference.alt ?? '')}
        disabled={readOnly || !reference.mediaId}
        onChange={(event) =>
          onChange({
            mediaId: String(reference.mediaId),
            alt: event.target.value,
          })
        }
      />
    </>
  );
}
