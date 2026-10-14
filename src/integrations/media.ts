import type { Media, MediaFile } from '../core/types';
import { id } from '../core/content';
export interface StorageConfig {
  accountId: string;
  bucket: string;
  publicURL: string;
  accessKeyId: string;
  secretAccessKey: string;
  maxMB: number;
  variantWidths: number[];
  quality: number;
}

export function parseR2Account(value: string): {
  accountId: string;
  bucket?: string;
} {
  value = value.trim();
  if (/^[a-f0-9]{32}$/i.test(value)) return { accountId: value };
  try {
    const url = new URL(value);
    const match = url.hostname.match(
      /^([a-f0-9]{32})\.r2\.cloudflarestorage\.com$/i,
    );
    const path = url.pathname.match(/^\/([^/]+)?\/?$/);
    if (
      match &&
      path &&
      url.protocol === 'https:' &&
      !url.port &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    )
      return { accountId: match[1], ...(path[1] ? { bucket: path[1] } : {}) };
  } catch {}
  throw Error(
    'Enter your 32-character account ID or the standard R2 S3 API URL from bucket Settings.',
  );
}

/** Shared by build-time configuration and uploads; does not contact storage. */
export function validateStorageConfig(input: StorageConfig): StorageConfig {
  const account = parseR2Account(input.accountId);
  const config = {
    ...input,
    accountId: account.accountId,
    bucket: (account.bucket ?? input.bucket).trim(),
    publicURL: input.publicURL.trim().replace(/\/+$/, ''),
    accessKeyId: input.accessKeyId.trim(),
    secretAccessKey: input.secretAccessKey.trim(),
  };
  if (!config.bucket) throw Error('Enter your R2 bucket name.');
  let publicURL: URL;
  try {
    publicURL = new URL(config.publicURL);
  } catch {
    throw Error(
      'Enter an HTTPS public media URL, such as https://pub-example.r2.dev.',
    );
  }
  if (
    publicURL.protocol !== 'https:' ||
    publicURL.username ||
    publicURL.password ||
    publicURL.search ||
    publicURL.hash
  )
    throw Error(
      'Use an HTTPS public media URL without credentials, a query or a fragment.',
    );
  if (publicURL.hostname.endsWith('.r2.cloudflarestorage.com'))
    throw Error(
      'Use your bucket’s Public Development URL or custom domain here. The S3 API URL is only for uploads.',
    );
  if (!config.accessKeyId || !config.secretAccessKey)
    throw Error(
      'Enter the Access Key ID and Secret Access Key from an R2 API token with Object Read & Write permission.',
    );
  if (!Number.isFinite(config.maxMB) || config.maxMB <= 0)
    throw Error('R2_MAX_MB must be greater than 0.');
  if (
    !config.variantWidths.every(
      (w) => Number.isInteger(w) && w >= 64 && w <= 4096,
    ) ||
    !(config.quality >= 0.1 && config.quality <= 1)
  )
    throw Error(
      'R2_IMAGE_WIDTHS must contain integer widths between 64 and 4096; R2_IMAGE_QUALITY must be between 0.1 and 1.',
    );
  return config;
}

function r2ClientOptions(config: StorageConfig) {
  return {
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED' as const,
  };
}

export async function upload(
  file: File,
  config: StorageConfig,
  onProgress: (message: string) => void,
): Promise<Media> {
  config = validateStorageConfig(config);
  if (file.size > config.maxMB * 1024 * 1024)
    throw Error(`Choose a file smaller than ${config.maxMB} MB.`);
  // Executable document types are not media; SVG is excluded from the initial upload path.
  if (
    !/^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm)|audio\/(mpeg|ogg|wav)|application\/pdf)$/.test(
      file.type,
    )
  )
    throw Error(
      'Choose a JPEG, PNG, WebP, GIF, AVIF, MP4, WebM, audio, or PDF file.',
    );
  const { S3Client, PutObjectCommand, DeleteObjectCommand } =
    await import('@aws-sdk/client-s3');
  const client = new S3Client(r2ClientOptions(config));
  const mediaId = id('media');
  const prefix = mediaId + '/';
  const uploaded: string[] = [];
  async function put(
    blob: Blob,
    name: string,
    width?: number,
    height?: number,
  ): Promise<MediaFile> {
    const key = prefix + name;
    onProgress(`Uploading ${name}…`);
    uploaded.push(key);
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: new Uint8Array(await blob.arrayBuffer()),
        ContentType: blob.type,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return {
      key,
      url: config.publicURL.replace(/\/$/, '') + '/' + key,
      mime: blob.type,
      bytes: blob.size,
      ...(width ? { width, height } : {}),
    };
  }
  try {
    let bitmap: ImageBitmap | undefined;
    const variants: MediaFile[] = [];
    // Animated/unknown images retain their original file without flattening frames.
    if (await resizableImage(file))
      try {
        bitmap = await createImageBitmap(file);
        if (bitmap.width * bitmap.height > 40_000_000) {
          bitmap.close();
          bitmap = undefined;
        }
      } catch {}
    const original = await put(
      file,
      'original.' +
        {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
          'image/gif': 'gif',
          'image/avif': 'avif',
          'video/mp4': 'mp4',
          'video/webm': 'webm',
          'audio/mpeg': 'mp3',
          'audio/ogg': 'ogg',
          'audio/wav': 'wav',
          'application/pdf': 'pdf',
        }[file.type],
      bitmap?.width,
      bitmap?.height,
    );
    if (bitmap) {
      try {
        for (const width of [...new Set(config.variantWidths)].sort(
          (a, b) => a - b,
        )) {
          if (width >= bitmap.width) continue;
          const height = Math.round((bitmap.height * width) / bitmap.width);
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
          const blob = await new Promise<Blob | null>((r) =>
            canvas.toBlob(r, 'image/webp', config.quality),
          );
          if (blob?.type === 'image/webp')
            variants.push(await put(blob, `${width}.webp`, width, height));
        }
      } finally {
        bitmap.close();
      }
    }
    return {
      formatVersion: 1,
      id: mediaId,
      name: file.name,
      original,
      variants,
    };
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((Key) =>
        client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key })),
      ),
    );
    throw error;
  } finally {
    client.destroy();
  }
}

export async function resizableImage(file: File): Promise<boolean> {
  if (file.type === 'image/jpeg') return true;
  if (!['image/png', 'image/webp', 'image/avif'].includes(file.type))
    return false;
  const bytes = new Uint8Array(await file.arrayBuffer()),
    view = new DataView(bytes.buffer);
  const word = (offset: number) =>
    String.fromCharCode(...bytes.slice(offset, offset + 4));
  if (file.type === 'image/png') {
    if (bytes.length < 8 || word(1) !== 'PNG\r') return false;
    for (let offset = 8; offset + 12 <= bytes.length;) {
      const length = view.getUint32(offset),
        kind = word(offset + 4);
      if (kind === 'acTL') return false;
      if (kind === 'IEND') return true;
      offset += 12 + length;
    }
    return false;
  }
  if (file.type === 'image/webp')
    return (
      word(0) === 'RIFF' &&
      word(8) === 'WEBP' &&
      (word(12) !== 'VP8X' || !(bytes[20] & 2))
    );
  if (file.type === 'image/avif') {
    if (word(4) !== 'ftyp') return false;
    const end = Math.min(view.getUint32(0), bytes.length);
    for (let i = 8; i + 4 <= end; i += 4) if (word(i) === 'avis') return false;
    return true;
  }
  return false;
}
