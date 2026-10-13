import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import {
  parseFiles,
  recordPath,
  schemaChanges,
  validate,
} from '../src/core/content';
import { readContentFiles } from '../src/core/load';
import { definitions } from '../src/generated/definitions';

const git = (...args: string[]) =>
  execFileSync('git', args, {
    cwd: process.env.QUINECMS_SITE_ROOT ?? process.cwd(),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

function baseline(ref: string) {
  const sha = git(
    'rev-parse',
    '--verify',
    '--end-of-options',
    `${ref}^{commit}`,
  ).trim();
  const files: Record<string, string> = {};
  for (const entry of git('ls-tree', '-rz', sha, '--', 'content/').split(
    '\0',
  )) {
    if (!entry) continue;
    const [metadata, path] = entry.split('\t');
    const [mode, type, blob] = metadata.split(' ');
    if (mode !== '100644' || type !== 'blob' || !recordPath(path))
      throw Error(`Unsupported baseline content file: ${path}`);
    files[path] = git('cat-file', 'blob', blob);
  }
  return parseFiles(files);
}

try {
  const { values } = parseArgs({
    options: {
      draft: { type: 'boolean' },
      base: { type: 'string' },
      help: { type: 'boolean' },
    },
  });
  if (values.help) {
    console.log(`Usage: pnpm validate:content [--draft] [--base <git-ref>]

Checks content/ with the installed block and layout validators.
Default: checks publication readiness. --draft: checks structural validity only.
--base also checks schema changes and deletion impact against a local Git commit.
No content, Git refs or remote services are changed.`);
  } else {
    const content = parseFiles(await readContentFiles());
    const issues = validate(content, definitions).filter(
      (issue) => !values.draft || issue.phase === 'structure',
    );
    if (values.base)
      issues.push(...schemaChanges(baseline(values.base), content));
    for (const issue of issues)
      console.error(`[${issue.phase}] ${issue.path}: ${issue.message}`);
    if (issues.length) process.exitCode = 1;
    else
      console.log(
        `Content is valid for ${values.draft ? 'a draft' : 'publication'}${values.base ? `; changes checked against ${values.base}` : ''}.`,
      );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
