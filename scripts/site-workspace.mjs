import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  rm,
  symlink,
  realpath,
  stat,
} from 'node:fs/promises';
import { resolve, dirname, relative, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import semver from 'semver';

export const engineRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
);
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const exists = async (path) => !!(await stat(path).catch(() => null));
export async function writeChanged(path, value) {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value);
  if ((await readFile(path).catch(() => null))?.equals(bytes)) return;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
}

// Only regular source files enter an assembled build. This also gives the editor
// the same Git blob hashes that GitHub/GitLab report for a site's build inputs.
export async function filesUnder(root, prefix = '') {
  const files = {};
  for (const item of await readdir(resolve(root, prefix), {
    withFileTypes: true,
  })) {
    const name = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.isSymbolicLink())
      throw Error(`Source symlinks are not supported: ${name}`);
    if (item.isDirectory()) Object.assign(files, await filesUnder(root, name));
    else if (item.isFile()) files[name] = await readFile(resolve(root, name));
  }
  return files;
}
async function copyTree(from, to) {
  const files = await filesUnder(from);
  for (const [name, bytes] of Object.entries(files))
    await writeChanged(resolve(to, name), bytes);
  if (await exists(to)) {
    for (const name of Object.keys(await filesUnder(to)))
      if (!Object.hasOwn(files, name)) await rm(resolve(to, name));
  }
}
function within(root, value) {
  if (
    typeof value !== 'string' ||
    !value ||
    resolve(root, value) === root ||
    !resolve(root, value).startsWith(root + sep)
  )
    throw Error(
      `Extension paths must stay inside their source directory: ${value}`,
    );
  return resolve(root, value);
}
async function packageRoot(require, name) {
  // Some packages export neither their root nor package.json (e.g. Lexical's
  // subpath-only React package). Resolve their installation, not an entry point.
  for (const directory of require.resolve.paths(name) ?? []) {
    const candidate = join(directory, name);
    if (
      (await exists(join(candidate, 'package.json'))) &&
      (await json(join(candidate, 'package.json'))).name === name
    )
      return realpath(candidate);
  }
  try {
    return dirname(require.resolve(`${name}/package.json`));
  } catch {
    let path = dirname(require.resolve(name));
    while (path !== dirname(path)) {
      if (
        (await exists(join(path, 'package.json'))) &&
        (await json(join(path, 'package.json'))).name === name
      )
        return path;
      path = dirname(path);
    }
    throw Error(`Cannot resolve installed dependency ${name}`);
  }
}

export async function prepareSite(siteRoot, { development = false } = {}) {
  siteRoot = await realpath(siteRoot);
  const sitePackage = await json(join(siteRoot, 'package.json'));
  const enginePackage = await json(join(engineRoot, 'package.json'));
  const config = await json(join(siteRoot, 'quinecms.config.json'));
  if (
    !config ||
    !Array.isArray(config.libraries) ||
    !config.initialLayout ||
    typeof config.initialLayout.id !== 'string' ||
    !Number.isInteger(config.initialLayout.version)
  )
    throw Error(
      'Configure libraries and initialLayout { id, version } in quinecms.config.json.',
    );
  if (
    config.extensions &&
    !['src', 'extensions'].includes(config.extensions.split('/')[0])
  )
    throw Error('Site extensions must live under src/ or extensions/.');
  if (new Set(config.libraries).size !== config.libraries.length)
    throw Error('Duplicate library subscription.');
  const workspace = join(siteRoot, '.quinecms', 'workspace');
  await mkdir(workspace, { recursive: true });
  // The installed engine remains read-only. All disposable output is site-local.
  for (const directory of [
    'admin',
    'core',
    'editor',
    'integrations',
    'layouts',
    'pages',
  ])
    await copyTree(
      join(engineRoot, 'src', directory),
      join(workspace, 'src', directory),
    );
  await writeChanged(
    join(workspace, 'src/env.d.ts'),
    await readFile(join(engineRoot, 'src/env.d.ts')),
  );
  for (const name of [
    'generate-blocks.mjs',
    'generate-layouts.mjs',
    'admin-build.ts',
    'build-assets.mjs',
    'kumo-styles.mjs',
    'validate-content.ts',
    'check-build.mjs',
  ])
    await writeChanged(
      join(workspace, 'scripts', name),
      await readFile(join(engineRoot, 'scripts', name)),
    );
  await writeChanged(
    join(workspace, 'astro.config.mjs'),
    await readFile(join(engineRoot, 'astro.config.mjs')),
  );
  await writeChanged(
    join(workspace, 'package.json'),
    JSON.stringify(enginePackage, null, 2),
  );

  const siteRequire = createRequire(join(siteRoot, 'package.json'));
  const engineRequire = createRequire(join(engineRoot, 'package.json'));
  const dependencies = new Map(
    Object.keys(enginePackage.dependencies).map((name) => [
      name,
      engineRequire,
    ]),
  );
  for (const name of Object.keys(sitePackage.dependencies ?? {})) {
    if (name !== 'quinecms' && !dependencies.has(name))
      dependencies.set(name, siteRequire);
  }
  const engineRevision = sitePackage.dependencies?.quinecms;
  if (
    !development &&
    !(
      typeof engineRevision === 'string' &&
      (semver.valid(engineRevision) || /#[0-9a-f]{40}$/.test(engineRevision))
    )
  )
    throw Error(
      'Pin quinecms to an exact version or full Git commit before a production build.',
    );
  if (
    !development &&
    (await packageRoot(siteRequire, 'quinecms')) !==
      (await realpath(engineRoot))
  )
    throw Error('Build using the site’s installed QuineCMS: pnpm build.');
  if (semver.valid(engineRevision) && engineRevision !== enginePackage.version)
    throw Error(
      `Expected QuineCMS ${engineRevision}; installed ${enginePackage.version}.`,
    );
  // A single version of each direct dependency is shared by all renderers.
  // Surface conflicts instead of silently changing a library's implementation.
  const libraries = [];
  for (const name of config.libraries) {
    if (
      typeof name !== 'string' ||
      !Object.hasOwn(sitePackage.dependencies ?? {}, name)
    )
      throw Error(
        `Library ${name} must be a dependency in the site's package.json.`,
      );
    const revision = sitePackage.dependencies[name];
    if (
      !development &&
      !semver.valid(revision) &&
      !/#[0-9a-f]{40}$/.test(revision)
    )
      throw Error(
        `Pin ${name} to an exact version or full Git commit before a production build.`,
      );
    const root = await packageRoot(siteRequire, name);
    const pkg = await json(join(root, 'package.json'));
    if (semver.valid(revision) && revision !== pkg.version)
      throw Error(`Expected ${name} ${revision}; installed ${pkg.version}.`);
    libraries.push({ name, root });
    const libraryRequire = createRequire(join(root, 'package.json'));
    for (const dep of Object.keys(pkg.dependencies ?? {})) {
      if (dep === 'quinecms')
        throw Error(
          `${name} must declare QuineCMS as a peer, not bundle another engine.`,
        );
      const candidate = await json(
        join(await packageRoot(libraryRequire, dep), 'package.json'),
      );
      if (dependencies.has(dep)) {
        const shared = await json(
          join(await packageRoot(dependencies.get(dep), dep), 'package.json'),
        );
        if (shared.version !== candidate.version)
          throw Error(
            `Dependency conflict for ${dep}: ${shared.version} and ${candidate.version}.`,
          );
      } else dependencies.set(dep, libraryRequire);
    }
    for (const [dep, range] of Object.entries(pkg.peerDependencies ?? {})) {
      const installed =
        dep === 'quinecms'
          ? enginePackage
          : dependencies.has(dep)
            ? await json(
                join(
                  await packageRoot(dependencies.get(dep), dep),
                  'package.json',
                ),
              )
            : null;
      if (!installed || !semver.satisfies(installed.version, range))
        throw Error(
          `${name} requires peer ${dep} ${range}. Declare a compatible dependency in the site.`,
        );
    }
  }
  // Explicit site dependencies cannot replace the engine's runtime versions.
  for (const name of Object.keys(sitePackage.dependencies ?? {})) {
    if (name === 'quinecms' || !Object.hasOwn(enginePackage.dependencies, name))
      continue;
    const candidate = await json(
      join(await packageRoot(siteRequire, name), 'package.json'),
    );
    const shared = await json(
      join(await packageRoot(engineRequire, name), 'package.json'),
    );
    if (candidate.version !== shared.version)
      throw Error(
        `Dependency conflict for ${name}: ${shared.version} and ${candidate.version}.`,
      );
  }
  const nodeModules = join(workspace, 'node_modules');
  await mkdir(nodeModules, { recursive: true });
  for (const [name, require] of dependencies) {
    const target = await packageRoot(require, name);
    const link = join(nodeModules, name);
    await mkdir(dirname(link), { recursive: true });
    if ((await realpath(link).catch(() => '')) !== (await realpath(target))) {
      await rm(link, { force: true, recursive: true });
      await symlink(target, link, 'dir');
    }
  }
  // Remove links for uninstalled dependencies so a warm workspace behaves like
  // a clean build rather than accidentally resolving an old library.
  for (const entry of await readdir(nodeModules, { withFileTypes: true })) {
    const names =
      entry.name.startsWith('@') && entry.isDirectory()
        ? (await readdir(join(nodeModules, entry.name))).map(
            (name) => `${entry.name}/${name}`,
          )
        : [entry.name];
    for (const name of names)
      if (!dependencies.has(name))
        await rm(join(nodeModules, name), { force: true, recursive: true });
  }
  const imports = {};
  for (const [name, path] of Object.entries(enginePackage.exports ?? {})) {
    if (name === './package.json') continue;
    imports[`quinecms/${name.slice(2)}`] = [path];
  }
  await writeChanged(
    join(workspace, 'tsconfig.json'),
    JSON.stringify(
      {
        extends: 'astro/tsconfigs/strict',
        compilerOptions: {
          jsx: 'react-jsx',
          jsxImportSource: 'react',
          types: ['node'],
          baseUrl: '.',
          paths: imports,
        },
        include: ['.astro/types.d.ts', 'src/**/*'],
        exclude: ['dist', 'node_modules'],
      },
      null,
      2,
    ),
  );

  const blocks = [],
    layouts = [],
    customFields = [],
    assets = new Map();
  const resolvedDependencies = {};
  for (const [name, require] of dependencies)
    resolvedDependencies[name] = (
      await json(join(await packageRoot(require, name), 'package.json'))
    ).version;
  const registeredIds = new Set();
  const currentExtensions = new Set();
  async function extension(root, manifest, directory) {
    if (
      !/^[a-z][a-z0-9-]*$/.test(manifest.id) ||
      registeredIds.has(manifest.id)
    )
      throw Error(`Invalid or duplicate library identity: ${manifest.id}`);
    registeredIds.add(manifest.id);
    if (
      manifest.engine &&
      !semver.satisfies(enginePackage.version, manifest.engine)
    )
      throw Error(
        `${manifest.id} requires QuineCMS ${manifest.engine}; installed ${enginePackage.version}.`,
      );
    if (!Array.isArray(manifest.blocks) || !Array.isArray(manifest.layouts))
      throw Error(`Invalid extension manifest: ${manifest.id}`);
    const target = join(workspace, 'src/extensions', directory);
    if (currentExtensions.has(directory))
      throw Error(`Conflicting extension directory: ${directory}`);
    currentExtensions.add(directory);
    // Libraries own their complete source tree, including shared renderers/helpers.
    if (await exists(join(root, 'src')))
      await copyTree(join(root, 'src'), join(target, 'src'));
    for (const [names, entries] of [
      [blocks, manifest.blocks],
      [layouts, manifest.layouts],
    ]) {
      for (const entry of entries) {
        within(root, entry);
        if (!entry.startsWith('src/'))
          throw Error(`Extension implementation must be under src/: ${entry}`);
        names.push(relative(workspace, within(target, entry)));
      }
    }
    for (const field of manifest.customFields ?? []) {
      if (
        !/^[a-z][\w-]*$/.test(field.id) ||
        field.id === 'markdown' ||
        customFields.some((entry) => entry.id === field.id)
      )
        throw Error(`Invalid or duplicate custom field: ${field.id}`);
      const sources = {};
      for (const key of ['validator', 'component']) {
        within(root, field[key]);
        if (!field[key].startsWith('src/'))
          throw Error('Custom field modules must be under src/.');
        await readFile(within(root, field[key]));
        sources[key] =
          '../' + relative(join(workspace, 'src'), within(target, field[key]));
      }
      customFields.push({ id: field.id, ...sources });
    }
    if (manifest.public) {
      for (const [name, bytes] of Object.entries(
        await filesUnder(within(root, manifest.public)),
      )) {
        if (assets.has(name)) throw Error(`Duplicate public asset: ${name}`);
        assets.set(name, bytes);
      }
    }
  }
  for (const { name, root } of libraries)
    await extension(
      root,
      await json(join(root, 'quinecms.library.json')),
      name.replaceAll('/', '__').replaceAll('@', ''),
    );
  if (config.extensions) {
    const root = within(siteRoot, config.extensions);
    await extension(
      root,
      await json(join(root, 'quinecms.library.json')),
      'site',
    );
  }
  const extensionsRoot = join(workspace, 'src/extensions');
  await mkdir(extensionsRoot, { recursive: true });
  for (const entry of await readdir(extensionsRoot))
    if (!currentExtensions.has(entry))
      await rm(join(extensionsRoot, entry), { recursive: true });
  if (await exists(join(siteRoot, 'public'))) {
    for (const [name, bytes] of Object.entries(
      await filesUnder(join(siteRoot, 'public')),
    )) {
      if (assets.has(name))
        throw Error(`Site asset conflicts with library asset: ${name}`);
      assets.set(name, bytes);
    }
  }
  await mkdir(join(workspace, 'public'), { recursive: true });
  for (const name of assets.keys())
    if (/^(admin|_astro|assets)(\/|$)/.test(name))
      throw Error(`Reserved public asset path: ${name}`);
  for (const [name, bytes] of assets)
    await writeChanged(join(workspace, 'public', name), bytes);
  for (const name of Object.keys(await filesUnder(join(workspace, 'public'))))
    if (!assets.has(name)) await rm(join(workspace, 'public', name));
  await copyTree(join(siteRoot, 'content'), join(workspace, 'content'));
  await writeChanged(
    join(workspace, 'blocks.config.mjs'),
    `export default ${JSON.stringify(blocks)};\n`,
  );
  await writeChanged(
    join(workspace, 'layouts.config.mjs'),
    `export default ${JSON.stringify(layouts)};\n`,
  );
  await writeChanged(
    join(workspace, 'src/generated/site-config.ts'),
    `export const initialLayout = ${JSON.stringify(config.initialLayout)};\n`,
  );
  await writeChanged(
    join(workspace, 'src/generated/custom-fields.ts'),
    customFields
      .map(
        (field, index) =>
          `import validator${index} from ${JSON.stringify(field.validator)};`,
      )
      .join('\n') +
      `\nexport const customValidators: Record<string, (value: unknown) => boolean> = {${customFields.map((field, index) => `${JSON.stringify(field.id)}: validator${index}`).join(',')}};\n`,
  );
  await writeChanged(
    join(workspace, 'src/generated/custom-widgets.ts'),
    `export const customWidgets = {${customFields.map((field) => `${JSON.stringify(field.id)}: () => import(${JSON.stringify(field.component)})`).join(',')}};\n`,
  );
  await writeChanged(
    join(workspace, 'resolved-dependencies.json'),
    JSON.stringify(resolvedDependencies),
  );
  await writeChanged(
    join(workspace, 'package.json'),
    JSON.stringify(
      { ...enginePackage, dependencies: resolvedDependencies },
      null,
      2,
    ),
  );
  let initialInstalled = false;
  for (const path of layouts) {
    const definition = await json(join(workspace, path, 'definition.json'));
    if (
      definition.id === config.initialLayout.id &&
      definition.version === config.initialLayout.version
    )
      initialInstalled = true;
  }
  if (!initialInstalled)
    throw Error(
      `Initial layout ${config.initialLayout.id}@${config.initialLayout.version} is not installed.`,
    );
  // Hash only site-owned build inputs. Engine/library implementations are identified
  // by the committed dependency pins and lockfile, never expected in the site tree.
  const inputs = {};
  for (const name of ['package.json', 'pnpm-lock.yaml', 'quinecms.config.json'])
    inputs[name] = await readFile(join(siteRoot, name));
  for (const directory of ['src', 'extensions', 'public', 'scripts']) {
    if (await exists(join(siteRoot, directory)))
      for (const [name, bytes] of Object.entries(
        await filesUnder(join(siteRoot, directory)),
      ))
        inputs[`${directory}/${name}`] = bytes;
  }
  if (
    config.extensions &&
    !['src', 'extensions'].includes(config.extensions.split('/')[0])
  )
    throw Error('Site extensions must live under src/ or extensions/.');
  if (await exists(join(siteRoot, 'pnpm-workspace.yaml')))
    inputs['pnpm-workspace.yaml'] = await readFile(
      join(siteRoot, 'pnpm-workspace.yaml'),
    );
  const sources = Object.fromEntries(
    Object.entries(inputs).map(([name, bytes]) => [
      name,
      createHash('sha1')
        .update(`blob ${bytes.length}\0`)
        .update(bytes)
        .digest('hex'),
    ]),
  );
  await writeChanged(
    join(workspace, 'build-inputs.json'),
    JSON.stringify(sources),
  );
  return { workspace, config, siteRoot };
}
