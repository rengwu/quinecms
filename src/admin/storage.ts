import {
  validateStorageConfig,
  type StorageConfig,
} from '../integrations/media';

/** Build-time settings, serialized only inside the encrypted admin payload. */
export function storageFromEnv(
  env: Record<string, string | undefined>,
): StorageConfig | null {
  const required = [
    'R2_ACCOUNT_ID',
    'R2_BUCKET',
    'R2_PUBLIC_URL',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
  ] as const;
  if (required.every((key) => !env[key]?.trim())) return null;
  const missing = required.filter((key) => !env[key]?.trim());
  if (missing.length)
    throw Error(
      `R2 uploads require ${missing.join(', ')}. Leave all five connection values blank to disable uploads.`,
    );

  try {
    return validateStorageConfig({
      accountId: env.R2_ACCOUNT_ID!,
      bucket: env.R2_BUCKET!,
      publicURL: env.R2_PUBLIC_URL!,
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      maxMB: Number(env.R2_MAX_MB?.trim() || '30'),
      variantWidths: (env.R2_IMAGE_WIDTHS ?? '480,960,1600').trim()
        ? (env.R2_IMAGE_WIDTHS ?? '480,960,1600').split(',').map(Number)
        : [],
      quality: Number(env.R2_IMAGE_QUALITY?.trim() || '0.8'),
    });
  } catch (error) {
    throw Error(
      `Invalid R2 configuration: ${error instanceof Error ? error.message : 'Check the R2 environment variables.'}`,
    );
  }
}
