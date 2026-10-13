import { schemaChanges, validate } from '../core/content';
import type { Content, Definition, Snapshot } from '../core/types';

export interface Repository {
  provider?: 'github' | 'gitlab';
  instance?: string;
  owner: string;
  repo: string;
  branch: string;
  publishBranch?: string;
}

export const publishBranch = (repository: Repository) =>
  repository.publishBranch ?? 'main';

export function checkBranches(repository: Repository) {
  const target = publishBranch(repository);
  if (!repository.branch.trim() || !target.trim())
    throw Error('Enter both a draft branch and a publish branch.');
  if (repository.branch.trim() === target.trim())
    throw Error('Use a separate draft branch.');
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

export function checkSources(
  snapshot: Snapshot,
  expectedSources: Record<string, string>,
) {
  const paths = new Set([
    ...Object.keys(expectedSources),
    ...Object.keys(snapshot.sourceFiles),
  ]);
  if ([...paths].some((p) => snapshot.sourceFiles[p] !== expectedSources[p]))
    throw Error(
      'The draft uses different engine, library or site code. Your edits are preserved. Open a matching editor before saving or publishing.',
    );
}

export function checkPublication(
  snapshot: Snapshot,
  definitions: Definition[],
  expectedSources: Record<string, string>,
) {
  checkSources(snapshot, expectedSources);
  const issues = validate(snapshot.content, definitions);
  if (issues.length) throw Error(issues.map((i) => i.message).join('\n'));
}

export const isSource = (path: string, expected: Record<string, string>) =>
  path.startsWith('src/') ||
  path.startsWith('scripts/') ||
  path.startsWith('extensions/') ||
  path.startsWith('public/') ||
  [
    'package.json',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
    'quinecms.config.json',
  ].includes(path) ||
  Object.hasOwn(expected, path);
