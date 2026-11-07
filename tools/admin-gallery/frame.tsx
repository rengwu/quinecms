import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import App from '../../src/editor/App';
import { recoveryKey } from '../../src/editor/recovery';
import { readAdminMode } from '../../src/editor/AdminTheme';
import { loginScreen } from '../../src/admin/login-screen';
import '../../src/admin/login-screen.css';
import { content, storage } from './content';
import { screens } from './screens';
import { forceStates } from './force-states';
import { focusWithoutScrolling } from './dom';

const params = new URLSearchParams(location.search);
const [group, key] = (params.get('screen') ?? 'pages.list').split('.');
forceStates();
focusWithoutScrolling();
document.body.dataset.galleryForce = params.get('force') ?? '';

function fail(error: unknown) {
  const alert = document.createElement('p');
  alert.role = 'alert';
  alert.textContent = `Screen unavailable: ${error instanceof Error ? error.message : error}`;
  alert.style.cssText =
    'position:fixed;inset:auto 8px 8px;z-index:9;margin:0;padding:8px 12px;background:#b91c1c;color:#fff;font:13px system-ui';
  document.body.append(alert);
}

async function login(state: string) {
  document.getElementById('root')!.outerHTML = loginScreen;
  document.getElementById('login-screen')!.dataset.mode = readAdminMode();
  if (state === 'loading') return;
  await import('../../src/admin/login');
  if (state === 'ready') return;
  document.querySelector<HTMLInputElement>('#email')!.value =
    'editor@example.com';
  document.querySelector<HTMLInputElement>('#password')!.value = 'password';
  // Holding animation frames keeps the real submit handler in its busy state.
  if (state === 'busy') window.requestAnimationFrame = () => 0;
  document.querySelector<HTMLFormElement>('#admin-login')!.requestSubmit();
}

async function editor() {
  const screen = screens[group][key];
  // Frames share this tab's sessionStorage; start each from the fixture.
  sessionStorage.removeItem(recoveryKey);
  localStorage.removeItem('quinecms:preview-workspace');
  flushSync(() =>
    createRoot(document.getElementById('root')!).render(
      <App
        initial={content}
        config={{
          encryptedAdmin: true,
          git: screen.git
            ? {
                token: 'gallery',
                repository: { owner: 'gallery', repo: 'site', branch: 'draft' },
              }
            : null,
          r2: storage,
        }}
        onLock={() => location.reload()}
      />,
    ),
  );
  await screen.steps?.(document);
}

(group === 'login' ? login(key) : editor()).catch(fail);
