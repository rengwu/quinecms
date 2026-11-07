import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// Engine-only design tool: real editor modules on test-owned fixtures.
// Not part of the package; it never reads site content or providers.
export default defineConfig({
  root: here('.'),
  envDir: false,
  publicDir: false,
  oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: /^.*\/generated\/definitions$/,
        replacement: here('registry/definitions.ts'),
      },
      {
        find: /^.*\/generated\/([^/]+)$/,
        replacement: here('../../tests/fixtures/registry') + '/$1',
      },
      // Only App.tsx imports this path; frames choose a save state with ?git=.
      { find: /^\.\.\/integrations\/git$/, replacement: here('git.ts') },
    ],
  },
  server: {
    port: 5318,
    fs: { allow: [here('../..')] },
    // As in scripts/dev-server.mjs: recursive FSEvents can miss saves on macOS.
    watch: { useFsEvents: false },
  },
});
