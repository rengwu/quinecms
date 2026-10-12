import type { LayoutProps } from '../../../core/layout-contract';
export default function Head({ settings }: LayoutProps) {
  return (
    <>
      <meta name="description" content={String(settings.description ?? '')} />
      <meta name="theme-color" content="#e6e0dd" />
      <link rel="icon" type="image/svg+xml" href="/quine/v1/favicon.svg" />
      <link
        rel="preload"
        href="/quine/v1/fonts/quintessential.ttf"
        as="font"
        type="font/ttf"
        crossOrigin="anonymous"
      />
    </>
  );
}
