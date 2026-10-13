import type { LayoutProps } from '../../../core/layout-contract';
export default function Head({ settings }: LayoutProps) {
  return (
    <>
      <meta name="description" content={String(settings.description ?? '')} />
      <meta name="theme-color" content="#ffffff" />
      <link rel="icon" type="image/svg+xml" href="/intr/v1/favicon.svg" />
      <link
        rel="preload"
        href="/intr/v1/fonts/inter-display-regular.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    </>
  );
}
