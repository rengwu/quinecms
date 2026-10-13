import { dev } from 'astro';
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
const running = await dev({ root: process.cwd(), server });
console.log(`QuineCMS dev: http://${server.host}:${running.address.port}`);
let stopping = false;
const stop = async () => {
  if (stopping) return;
  stopping = true;
  await running.stop();
  process.exit(0);
};
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
