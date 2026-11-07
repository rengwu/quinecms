import data from '../../../tests/fixtures/registry/definitions.json';
import type { Definition } from '../../../src/core/types';

// Fixture renderers are a single React view, so other frameworks cannot render.
export const definitions = (data as unknown as Definition[]).filter(
  (d) => d.framework === 'react',
);
