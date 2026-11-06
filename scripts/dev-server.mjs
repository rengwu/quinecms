import { dev } from 'astro';
import { resolve } from 'node:path';
import { siteDevWatcher } from './dev-watch.mjs';
const args = process.argv.slice(2);
const server = { host: '127.0.0.1' };
for (let i = 0; i < args.length; i++) {
  const [flag, inline] = args[i].split('=');
  if (!['--host', '--port'].includes(flag))
    throw Error('QuineCMS dev accepts --host <address> and --port <number>.');
  const value = inline ?? args[++i];
  if (!value) throw Error(`Missing value for ${flag}.`);
  if (flag === '--host') server.host = value;
  else {
    server.port = Number(value);
    if (
      !Number.isInteger(server.port) ||
      server.port < 0 ||
      server.port > 65535
    )
      throw Error('Invalid dev port.');
  }
}
// Own the server lifecycle alongside the site-input watcher. The Astro CLI may
// daemonize in some environments, which would otherwise leave that watcher behind.
const watcher = siteDevWatcher(process.env.QUINECMS_SITE_ROOT);
const running = await dev({
  root: process.cwd(),
  server,
  integrations: [watcher.integration],
  vite: {
    server: {
      watch: {
        // Use native per-file events on macOS too; recursive FSEvents can miss saves.
        useFsEvents: false,
        // The site integration applies this generated batch once it is complete.
        ignored: [
          resolve('src/generated').replaceAll('\\', '/') + '/**/*.astro',
          resolve(process.env.QUINECMS_SITE_ROOT, 'dist'),
        ],
      },
    },
  },
});
console.log(`QuineCMS dev: http://${server.host}:${running.address.port}`);
let stopping = false;
const stop = async () => {
  if (stopping) return;
  stopping = true;
  await watcher.close();
  await running.stop();
  process.exit(0);
};
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
