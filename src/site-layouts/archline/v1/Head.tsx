import type { LayoutProps } from '../../../core/layout-contract';
export default function Head({ settings }: LayoutProps) {
  return (
    <>
      <meta name="description" content={String(settings.description ?? '')} />
      <meta name="theme-color" content="#fffefa" />
      <link rel="icon" type="image/svg+xml" href="/archline/v1/favicon.svg" />
      <link
        rel="preload"
        href="/archline/v1/fonts/inter-display-regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/archline/v1/fonts/inter-display-medium.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}
