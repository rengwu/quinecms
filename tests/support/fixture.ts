import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseFiles } from '../../src/core/content';

// Product regression data is independent of a client's editable content/ tree.
export const fixtureDirectory = resolve('tests/fixtures/content');
export function fixtureFiles() {
  const files: Record<string, string> = {};
  function walk(relative = '') {
    for (const entry of readdirSync(join(fixtureDirectory, relative), {
      withFileTypes: true,
    })) {
      const path = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.json'))
        files[`content/${path}`] = readFileSync(
          join(fixtureDirectory, path),
          'utf8',
        );
    }
  }
  walk();
  return files;
}
export const fixture = () => parseFiles(fixtureFiles());
