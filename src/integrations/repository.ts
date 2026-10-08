import { schemaChanges, validate } from '../core/content';
import type { Content, Definition, Snapshot } from '../core/types';

export interface Repository {
  provider?: 'github' | 'gitlab';
  instance?: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface RepositoryStore {
  repository: Repository;
  load(): Promise<Snapshot>;
  save(base: Snapshot, content: Content): Promise<Snapshot>;
  publish(snapshot: Snapshot): Promise<void>;
}

export class Conflict extends Error {
  constructor() {
    super(
      'Someone saved newer changes. Your edits are still here. Export a backup, then reload the draft before applying them again.',
    );
  }
}

export function checkDraft(
  content: Content,
  definitions: Definition[],
  before?: Content,
) {
  const issues = [
    ...validate(content, definitions).filter((i) => i.phase === 'structure'),
    ...(before ? schemaChanges(before, content) : []),
  ];
  if (issues.length)
    throw Error(issues.map((i) => `${i.path}: ${i.message}`).join('\n'));
}

export function checkPublication(
  snapshot: Snapshot,
  definitions: Definition[],
  expectedSources: Record<string, string>,
) {
  const paths = new Set([
    ...Object.keys(expectedSources),
    ...Object.keys(snapshot.sourceFiles),
  ]);
  if ([...paths].some((p) => snapshot.sourceFiles[p] !== expectedSources[p]))
    throw Error(
      'The draft contains a different editor or block implementation. Rebuild the editor from that source before publishing its content.',
    );
  const issues = validate(snapshot.content, definitions);
  if (issues.length) throw Error(issues.map((i) => i.message).join('\n'));
}

export const isSource = (path: string, expected: Record<string, string>) =>
  (path.startsWith('src/') && !path.startsWith('src/generated/')) ||
  path.startsWith('scripts/') ||
  Object.hasOwn(expected, path);
