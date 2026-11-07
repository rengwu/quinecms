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
  oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
  test: { include: ['tests/**/*.test.{ts,tsx}'], environment: 'node' },
});
