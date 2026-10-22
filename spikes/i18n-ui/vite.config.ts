import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Disposable i18n UI spike. It imports existing editor components read-only and
// never touches site content, providers or the engine package.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
  server: {
    port: 5317,
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] },
  },
});
