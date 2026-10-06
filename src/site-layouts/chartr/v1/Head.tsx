import type { LayoutProps } from '../../../core/layout-contract';
export default function Head({ settings }: LayoutProps) {
  return (
    <>
      <link rel="icon" href="/chartr/v1/chartr.png" />
      <meta name="description" content={String(settings.description ?? '')} />
      <meta
        name="theme-color"
        content={settings.appearance === 'dark' ? '#191a22' : '#f1f1f1'}
      />
      <link
        rel="preload"
        href="/chartr/v1/fonts/IBMPlexMono-Regular.ttf"
        as="font"
        type="font/ttf"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/chartr/v1/fonts/IBMPlexMono-Medium.ttf"
        as="font"
        type="font/ttf"
        crossOrigin="anonymous"
      />
    </>
  );
}
