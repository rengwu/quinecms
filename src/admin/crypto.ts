import { argon2id } from 'hash-wasm';

// Fixed, versioned parameters prevent an untrusted envelope from selecting a
// weaker KDF or requesting unbounded memory before its authentication is checked.
export const parameters = Object.freeze({
  version: 1,
  kdf: 'argon2id',
  argonVersion: 19,
  memoryKiB: 65536,
  iterations: 3,
  parallelism: 1,
  cipher: 'AES-256-GCM',
  compression: 'gzip',
});
export interface Envelope {
  parameters: typeof parameters;
  salt: string;
  iv: string;
  ciphertext: string;
}
const encoder = new TextEncoder();

export function credentials(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || !password)
    throw Error(
      'Set ADMIN_EMAIL and ADMIN_PASSWORD before building the admin.',
    );
  // Structured encoding avoids ambiguous email/password concatenations.
  return JSON.stringify(['quinecms:admin', 1, normalized, password]);
}

function base64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
function bytes(value: string) {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}
function authenticatedHeader(salt: string, iv: string) {
  return encoder.encode(JSON.stringify({ parameters, salt, iv }));
}
async function derive(email: string, password: string, salt: Uint8Array) {
  const input = encoder.encode(credentials(email, password));
  let raw: Uint8Array | undefined;
  try {
    raw = await argon2id({
      password: input,
      salt,
      parallelism: parameters.parallelism,
      iterations: parameters.iterations,
      memorySize: parameters.memoryKiB,
      hashLength: 32,
      outputType: 'binary',
    });
    return await crypto.subtle.importKey(
      'raw',
      new Uint8Array(raw),
      'AES-GCM',
      false,
      ['encrypt', 'decrypt'],
    );
  } finally {
    input.fill(0);
    raw?.fill(0);
  }
}
export async function encryptAdmin(
  data: Uint8Array,
  email: string,
  password: string,
): Promise<Envelope> {
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt64 = base64(salt),
    iv64 = base64(iv);
  const key = await derive(email, password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
      additionalData: authenticatedHeader(salt64, iv64),
    },
    key,
    new Uint8Array(data),
  );
  return {
    parameters,
    salt: salt64,
    iv: iv64,
    ciphertext: base64(new Uint8Array(ciphertext)),
  };
}
export async function decryptAdmin(
  value: unknown,
  email: string,
  password: string,
): Promise<Uint8Array> {
  const envelope = value as Envelope;
  if (
    !envelope ||
    JSON.stringify(envelope.parameters) !== JSON.stringify(parameters) ||
    typeof envelope.salt !== 'string' ||
    typeof envelope.iv !== 'string' ||
    typeof envelope.ciphertext !== 'string'
  )
    throw Error('Unsupported encrypted admin format.');
  const salt = bytes(envelope.salt),
    iv = bytes(envelope.iv),
    ciphertext = bytes(envelope.ciphertext);
  if (salt.length !== 32 || iv.length !== 12 || ciphertext.length < 16)
    throw Error('Invalid encrypted admin.');
  const key = await derive(email, password, salt);
  return new Uint8Array(
    await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
        additionalData: authenticatedHeader(envelope.salt, envelope.iv),
      },
      key,
      ciphertext,
    ),
  );
}
