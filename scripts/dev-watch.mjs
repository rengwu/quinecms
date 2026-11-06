import { relative, resolve, sep } from 'node:path';
import { readFile } from 'node:fs/promises';
import { generateSite } from './site-generation.mjs';

// Use Vite's cross-platform watcher and reload transport for site-owned inputs.
// Only site-owned inputs trigger generation; workspace writes cannot feed back.
export function siteDevWatcher(siteRoot) {
  let server,
    timer,
    pending,
    again = false,
    stopped = false;
  const routeFile = resolve(
    siteRoot,
    '.quinecms/workspace/src/generated/routes.json',
  );

  async function rebuild() {
    if (stopped) return;
    if (pending) {
      again = true;
      return;
    }
    pending = (async () => {
      try {
        const before = await readFile(routeFile, 'utf8');
        await generateSite(siteRoot, { development: true });
        if (!stopped) {
          // A route-table change uses Astro's addWatchFile configuration refresh.
          // It reloads the browser once the new routes are installed.
          if (before === (await readFile(routeFile, 'utf8'))) {
            // Generated files are a batch, not independent HMR inputs. Invalidate
            // their consumers after generation, including Astro's server runners.
            for (const environment of Object.values(server.environments)) {
              environment.moduleGraph.invalidateAll();
              environment.hot.send({ type: 'full-reload', path: '*' });
            }
          }
          console.log('QuineCMS: site updated.');
        }
      } catch (error) {
        console.error(error.message);
        if (!stopped)
          server.ws.send({
            type: 'error',
            err: { message: error.message, stack: error.stack ?? '' },
          });
      }
    })();
    await pending;
    pending = undefined;
    if (again) {
      again = false;
      void rebuild();
    }
  }

  function changed(_event, file) {
    const name = relative(siteRoot, file).split(sep).join('/');
    if (
      !/^(content|src|extensions|public|scripts)(\/|$)|^quinecms\.config\.json$/.test(
        name,
      )
    )
      return;
    clearTimeout(timer);
    timer = setTimeout(rebuild, 120);
  }

  return {
    integration: {
      name: 'quinecms:site-inputs',
      hooks: {
        'astro:server:setup': ({ server: next }) => {
          // Astro may recreate Vite when the generated route table changes.
          server?.watcher.off('all', changed);
          server = next;
          server.watcher.on('all', changed);
          // Watch the parent too, so optional directories created after startup
          // (such as public/) are discovered. Vite ignores dependency/Git trees.
          server.watcher.add(siteRoot);
        },
      },
    },
    async close() {
      stopped = true;
      clearTimeout(timer);
      server?.watcher.off('all', changed);
      await pending;
    },
  };
}
