import { createDecipheriv } from 'node:crypto';
import { argon2id } from 'hash-wasm';
import { expect, it } from 'vitest';
import {
  credentials,
  decryptAdmin,
  encryptAdmin,
  parameters,
} from '../src/admin/crypto';

const email = 'admin@example.com';
const password = 'only a test password';
const data = new TextEncoder().encode('private dashboard data');

it('derives from both credentials and produces standard authenticated AES-256-GCM ciphertext', async () => {
  const envelope = await encryptAdmin(data, email, password);
  expect(await decryptAdmin(envelope, ' ADMIN@EXAMPLE.COM ', password)).toEqual(
    data,
  );
  const raw = await argon2id({
    password: credentials(email, password),
    salt: Buffer.from(envelope.salt, 'base64'),
    memorySize: 65536,
    iterations: 3,
    parallelism: 1,
    hashLength: 32,
    outputType: 'binary',
  });
  const ciphertext = Buffer.from(envelope.ciphertext, 'base64');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    raw,
    Buffer.from(envelope.iv, 'base64'),
  );
  decipher.setAAD(
    Buffer.from(
      JSON.stringify({ parameters, salt: envelope.salt, iv: envelope.iv }),
    ),
  );
  decipher.setAuthTag(ciphertext.subarray(-16));
  expect(
    Buffer.concat([
      decipher.update(ciphertext.subarray(0, -16)),
      decipher.final(),
    ]),
  ).toEqual(Buffer.from(data));
  raw.fill(0);
  expect(JSON.stringify(envelope)).not.toContain(email);
  expect(JSON.stringify(envelope)).not.toContain(password);
  expect(JSON.stringify(envelope)).not.toContain('private dashboard data');
}, 15000);

it('rejects either wrong credential, altered ciphertext/nonce/salt, and unsupported parameters', async () => {
  const envelope = await encryptAdmin(data, email, password);
  await expect(
    decryptAdmin(envelope, 'other@example.com', password),
  ).rejects.toThrow();
  await expect(decryptAdmin(envelope, email, password + ' ')).rejects.toThrow();
  for (const field of ['salt', 'iv', 'ciphertext'] as const) {
    const changed = Buffer.from(envelope[field], 'base64');
    changed[0] ^= 1;
    await expect(
      decryptAdmin(
        { ...envelope, [field]: changed.toString('base64') },
        email,
        password,
      ),
    ).rejects.toThrow();
  }
  for (const change of [
    { memoryKiB: 1 },
    { iterations: 1 },
    { version: 2 },
    { compression: 'none' },
  ])
    await expect(
      decryptAdmin(
        { ...envelope, parameters: { ...parameters, ...change } },
        email,
        password,
      ),
    ).rejects.toThrow('Unsupported');
}, 15000);

it('uses fresh salts and nonces on every encryption and refuses absent credentials', async () => {
  const a = await encryptAdmin(data, email, password),
    b = await encryptAdmin(data, email, password);
  expect(a.salt).not.toBe(b.salt);
  expect(a.iv).not.toBe(b.iv);
  expect(a.ciphertext).not.toBe(b.ciphertext);
  expect(() => credentials('', password)).toThrow('ADMIN_EMAIL');
  expect(() => credentials(email, '')).toThrow('ADMIN_PASSWORD');
  expect(credentials(email, 'x:y')).not.toBe(
    credentials('admin@example.com:x', 'y'),
  );
}, 10000);
