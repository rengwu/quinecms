export {};

const form = document.querySelector<HTMLFormElement>('#admin-login')!;
const email = form.querySelector<HTMLInputElement>('[name="email"]')!;
const password = form.querySelector<HTMLInputElement>('[name="password"]')!;
const button = form.querySelector<HTMLButtonElement>('button')!;
const error = document.querySelector<HTMLElement>('#login-error')!;
const login = document.querySelector<HTMLElement>('#login-screen')!;
const host = document.querySelector<HTMLElement>('#editor-root')!;
try {
  login.dataset.mode =
    localStorage.getItem('lean:admin-theme') === 'light' ? 'light' : 'dark';
} catch {}
// Old convenience-gate flags never authorize decryption.
try {
  sessionStorage.removeItem('lean:gate');
} catch {}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (button.disabled) return;
  error.textContent = '';
  if (
    !globalThis.crypto?.subtle ||
    typeof WebAssembly === 'undefined' ||
    typeof DecompressionStream === 'undefined'
  ) {
    error.textContent =
      'Use a current browser over HTTPS (or localhost) to unlock the editor.';
    return;
  }
  button.disabled = true;
  button.textContent = 'Unlocking…';
  form.setAttribute('aria-busy', 'true');
  let url = '',
    style: HTMLStyleElement | undefined;
  let stage: 'load' | 'decrypt' | 'mount' = 'load';
  try {
    // Let the browser paint the busy state before the memory-intensive KDF.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    // Install the submit handler before loading crypto. A missing/stale module
    // should produce a retryable error, not leave Unlock permanently disabled.
    const { decryptAdmin } = await import('./crypto');
    stage = 'decrypt';
    const envelope = JSON.parse(
      document.querySelector('#admin-payload')!.textContent!,
    );
    const decrypted = await decryptAdmin(envelope, email.value, password.value);
    let payload;
    try {
      const stream = new Blob([new Uint8Array(decrypted)])
        .stream()
        .pipeThrough(new DecompressionStream('gzip'));
      payload = JSON.parse(await new Response(stream).text());
    } finally {
      decrypted.fill(0);
    }
    password.value = '';
    stage = 'mount';
    style = document.createElement('style');
    style.textContent = payload.css;
    document.head.append(style);
    url = URL.createObjectURL(
      new Blob([payload.code], { type: 'text/javascript' }),
    );
    const editor = await import(/* @vite-ignore */ url);
    let unmount: (() => void) | undefined;
    unmount = editor.mount(host, payload.props, () => {
      unmount?.();
      style?.remove();
      // A new document discards decrypted modules and all in-memory state.
      location.reload();
    });
    login.hidden = true;
    host.hidden = false;
    document.querySelector('#admin-payload')?.remove();
  } catch (cause) {
    style?.remove();
    if (stage === 'mount')
      console.error('Encrypted editor startup failed.', cause);
    password.value = '';
    error.textContent =
      stage === 'load'
        ? 'The sign-in module could not load. Reload this page and try again.'
        : stage === 'decrypt'
          ? 'Could not unlock. Check your email and password, then try again.'
          : 'The editor could not start. Reload this page and try again.';
    password.focus();
  } finally {
    if (url) URL.revokeObjectURL(url);
    button.disabled = false;
    button.textContent = 'Unlock editor';
    form.removeAttribute('aria-busy');
  }
});
// Keep native submission disabled until the local-only handler is installed.
// A blocked/missing script must not submit credentials in a URL or to the host.
button.disabled = false;
