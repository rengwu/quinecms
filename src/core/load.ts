import fs from 'node:fs/promises';
import path from 'node:path';
import { parseFiles, validate } from './content';
import { migrateSite } from './layout-state';
import { definitions } from '../generated/definitions';
export async function readContentFiles() {
  const files: Record<string, string> = {};
  async function walk(dir: string) {
    for (const d of await fs.readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, d.name);
      if (d.isSymbolicLink()) throw new Error('Content cannot be symlinked');
      if (d.isDirectory()) await walk(p);
      else if (d.name.endsWith('.json'))
        files[p.split(path.sep).join('/')] = await fs.readFile(p, 'utf8');
    }
  }
  await walk('content');
  return files;
}
export async function loadContent() {
  const content = parseFiles(await readContentFiles());
  const issues = validate(content, definitions);
  if (issues.length)
    throw new Error(issues.map((i) => i.path + ': ' + i.message).join('\n'));
  return migrateSite(content);
}
