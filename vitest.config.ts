import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^.*\/generated\/([^/]+)$/,
        replacement: resolve('tests/fixtures/registry') + '/$1',
      },
    ],
  },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
