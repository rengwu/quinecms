import {
  brandAmber,
  logoViewBox,
  markRing,
  markSquare,
  wordmark,
} from '../editor/brand';

// The login page and the admin gallery render this one markup with
// login-screen.css. Submit stays disabled until login.ts installs its handler.
export const loginScreen = `<main id="login-screen" data-mode="dark">
  <form id="admin-login" method="post">
    <h1>
      <svg viewBox="${logoViewBox}" role="img" aria-label="QuineCMS">
        <path fill="currentColor" d="${markRing}" />
        <path fill="${brandAmber}" d="${markSquare}" />
        <path fill="currentColor" d="${wordmark}" />
      </svg>
    </h1>
    <div class="field">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" autocomplete="username" autocapitalize="none" spellcheck="false" required />
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required />
    </div>
    <p id="login-error" role="alert" aria-live="polite"></p>
    <div class="actions">
      <button type="submit" disabled>Unlock editor</button>
    </div>
  </form>
</main>`;
