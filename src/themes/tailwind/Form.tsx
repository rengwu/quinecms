import { safeFormEndpoint } from '../../core/content';
import { useId } from 'react';
import { href, text, type LayoutProps } from './shared';
export default function Form({
  props: p,
  context: c,
  contact = false,
}: Omit<LayoutProps, 'variant'> & { contact?: boolean }) {
  const id = useId();
  const endpoint = href(p.endpoint);
  const ready = safeFormEndpoint(endpoint);
  return (
    <form
      className="tw-form"
      action={c.preview ? undefined : endpoint}
      method="post"
      onSubmit={c.preview ? (e) => e.preventDefault() : undefined}
    >
      {contact && (
        <label htmlFor={id + '-name'}>
          Name
          <input id={id + '-name'} name="name" autoComplete="name" required />
        </label>
      )}
      <label htmlFor={id + '-email'}>
        Email
        <input
          id={id + '-email'}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </label>
      {contact && (
        <label htmlFor={id + '-message'}>
          Message
          <textarea id={id + '-message'} name="message" rows={5} required />
        </label>
      )}
      <button
        className="tw-button"
        type="submit"
        disabled={!ready || c.preview}
      >
        {text(p.submitLabel) || 'Submit'}
      </button>
      {p.privacy && (
        <p className="tw-fine">
          {text(p.privacy)}{' '}
          {href(p.privacyURL) && (
            <a href={href(p.privacyURL)}>Privacy policy</a>
          )}
        </p>
      )}
      {c.preview && (
        <p className="tw-fine">Preview · submissions are disabled</p>
      )}
    </form>
  );
}
