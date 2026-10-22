import type { Content, Doc } from './model';

// Illustrative demonstration content for the spike. These are invented
// products, not verified Kahf claims or imported client content.
export const fixtures = (): Content => ({
  settings: {
    enabled: true,
    main: 'en',
    languages: [
      { code: 'en', name: 'English' },
      { code: 'id', name: 'Indonesian' },
    ],
    policy: 'fallback',
  },
  media: [
    { id: 'm-serum', name: 'rose-serum.jpg', hue: 340 },
    { id: 'm-cleanser', name: 'gel-cleanser.jpg', hue: 190 },
    { id: 'm-cream', name: 'night-cream.jpg', hue: 265 },
    { id: 'm-hero', name: 'botanicals-hero.jpg', hue: 140 },
  ],
  collections: [
    {
      id: 'products',
      name: 'Products',
      prefix: 'products',
      templateId: 'tpl-product',
      fields: [
        { key: 'name', label: 'Name', type: 'text', localize: 'language', required: true },
        { key: 'tagline', label: 'Tagline', type: 'text', localize: 'language' },
        { key: 'description', label: 'Description', type: 'textarea', localize: 'language', required: true },
        { key: 'size', label: 'Size', type: 'select', localize: 'shared', required: true, options: ['30 ml', '50 ml', '100 ml'] },
        { key: 'photo', label: 'Photo', type: 'media', localize: 'shared' },
        {
          key: 'ingredients',
          label: 'Key ingredients',
          type: 'list',
          localize: 'shared',
          rows: [
            { key: 'name', label: 'Name', type: 'text', localize: 'language', required: true },
            { key: 'benefit', label: 'Benefit', type: 'text', localize: 'language' },
            { key: 'percent', label: 'Concentration', type: 'text', localize: 'shared' },
          ],
        },
        { key: 'featured', label: 'Featured ingredient', type: 'reference', localize: 'shared', collectionId: 'ingredients' },
        { key: 'seo', label: 'Search description', type: 'textarea', localize: 'language' },
      ],
    },
    {
      id: 'ingredients',
      name: 'Ingredients',
      fields: [
        { key: 'name', label: 'Name', type: 'text', localize: 'language', required: true },
        { key: 'summary', label: 'Summary', type: 'textarea', localize: 'language', required: true },
        { key: 'origin', label: 'Origin', type: 'text', localize: 'shared' },
      ],
    },
  ],
  pageFields: [
    { key: 'title', label: 'Page title', type: 'text', localize: 'language', required: true },
    { key: 'seo', label: 'Search description', type: 'textarea', localize: 'language' },
  ],
  blockTypes: [
    {
      type: 'hero',
      label: 'Hero',
      fields: [
        { key: 'heading', label: 'Heading', type: 'text', localize: 'language', required: true },
        { key: 'body', label: 'Body', type: 'textarea', localize: 'language' },
        { key: 'image', label: 'Image', type: 'media', localize: 'shared' },
        { key: 'cta', label: 'Button label', type: 'text', localize: 'language' },
        { key: 'target', label: 'Button link', type: 'select', localize: 'shared', options: ['Shop', 'Story', 'Home'] },
      ],
    },
    {
      type: 'featured',
      label: 'Featured products',
      fields: [
        { key: 'heading', label: 'Heading', type: 'text', localize: 'language', required: true },
        {
          key: 'items',
          label: 'Products',
          type: 'list',
          localize: 'shared',
          rows: [{ key: 'product', label: 'Product', type: 'reference', localize: 'shared', collectionId: 'products', required: true }],
        },
      ],
    },
    {
      type: 'text',
      label: 'Text',
      fields: [
        { key: 'heading', label: 'Heading', type: 'text', localize: 'language' },
        { key: 'body', label: 'Body', type: 'textarea', localize: 'language', required: true },
      ],
    },
    {
      type: 'productDetails',
      label: 'Product details',
      fields: [
        { key: 'ingredientsHeading', label: 'Ingredients heading', type: 'text', localize: 'language', required: true },
        { key: 'featuredHeading', label: 'Featured ingredient heading', type: 'text', localize: 'language' },
        { key: 'cta', label: 'Button label', type: 'text', localize: 'language', required: true },
      ],
    },
  ],
  layoutFields: [
    { key: 'brand', label: 'Brand name', type: 'text', localize: 'shared', required: true },
    { key: 'announcement', label: 'Announcement', type: 'text', localize: 'language' },
    {
      key: 'nav',
      label: 'Navigation links',
      type: 'list',
      localize: 'shared',
      rows: [
        { key: 'label', label: 'Label', type: 'text', localize: 'language', required: true },
        { key: 'target', label: 'Destination', type: 'select', localize: 'shared', options: ['Home', 'Shop', 'Story', 'Ingredients'] },
      ],
    },
    { key: 'footer', label: 'Footer note', type: 'textarea', localize: 'language' },
  ],
  docs,
});

const docs: Doc[] = [
  {
    id: 'p-serum',
    kind: 'entry',
    collectionId: 'products',
    path: 'rose-barrier-serum',
    values: {
      name: 'Rose Barrier Serum',
      tagline: 'Calm, cushioned skin by morning',
      description: 'A lightweight serum with rose water and centella that supports a comfortable skin barrier.',
      size: '30 ml',
      photo: { mediaId: 'm-serum', alt: 'Pink glass dropper bottle on a stone ledge' },
      ingredients: [
        { _rowId: 'r1', name: 'Rose water', benefit: 'Soothes and refreshes', percent: '40%' },
        { _rowId: 'r2', name: 'Centella extract', benefit: 'Supports recovery', percent: '2%' },
        { _rowId: 'r3', name: 'Niacinamide', benefit: 'Evens tone', percent: '4%' },
      ],
      featured: 'i-centella',
      seo: 'Rose Barrier Serum with rose water and centella for a comfortable skin barrier.',
    },
    blocks: [],
    copies: {
      id: {
        values: {
          name: 'Serum Pelindung Mawar',
          tagline: 'Kulit tenang dan lembut di pagi hari',
          description: 'Serum ringan dengan air mawar dan centella yang membantu menjaga skin barrier tetap nyaman.',
          photo: { alt: 'Botol pipet kaca merah muda di atas batu' },
          ingredients: {
            r1: { name: 'Air mawar', benefit: 'Menenangkan dan menyegarkan' },
            r2: { name: 'Ekstrak centella', benefit: 'Membantu pemulihan' },
            r3: { name: 'Niacinamide', benefit: 'Meratakan warna kulit' },
          },
          seo: 'Serum Pelindung Mawar dengan air mawar dan centella untuk skin barrier yang nyaman.',
        },
        blocks: {},
      },
    },
  },
  {
    id: 'p-cleanser',
    kind: 'entry',
    collectionId: 'products',
    path: 'daily-gel-cleanser',
    values: {
      name: 'Daily Gel Cleanser',
      tagline: 'Fresh without the squeak',
      description: 'A low-foam gel that removes sunscreen and daily grime without leaving skin tight.',
      size: '100 ml',
      photo: { mediaId: 'm-cleanser', alt: 'Clear gel cleanser tube beside a folded towel' },
      ingredients: [
        { _rowId: 'r1', name: 'Green tea', benefit: 'Antioxidant care', percent: '1%' },
        { _rowId: 'r2', name: 'Glycerin', benefit: 'Keeps skin comfortable', percent: '5%' },
      ],
      featured: 'i-niacinamide',
      seo: 'Daily Gel Cleanser: low-foam cleansing that leaves skin comfortable.',
    },
    blocks: [],
    copies: {},
  },
  {
    id: 'p-cream',
    kind: 'entry',
    collectionId: 'products',
    path: 'night-repair-cream',
    values: {
      name: 'Night Repair Cream',
      tagline: 'Overnight comfort',
      description: 'A rich but breathable cream that replenishes moisture while you sleep.',
      size: '50 ml',
      photo: { mediaId: 'm-cream', alt: 'Violet cream jar with its lid resting beside it' },
      ingredients: [
        { _rowId: 'r1', name: 'Ceramides', benefit: 'Replenish the barrier', percent: '1%' },
        { _rowId: 'r2', name: 'Squalane', benefit: 'Softens without heaviness', percent: '6%' },
      ],
      featured: 'i-rose',
      seo: '',
    },
    blocks: [],
    copies: {
      id: {
        values: {
          name: 'Krim Perbaikan Malam',
          tagline: 'Kenyamanan sepanjang malam',
          ingredients: { r1: { name: 'Ceramide', benefit: 'Memperkuat skin barrier' } },
        },
        blocks: {},
      },
    },
  },
  {
    id: 'i-centella',
    kind: 'entry',
    collectionId: 'ingredients',
    path: 'centella',
    values: { name: 'Centella asiatica', summary: 'A traditional botanical valued for calming stressed skin.', origin: 'Java' },
    blocks: [],
    copies: { id: { values: { name: 'Centella asiatica (pegagan)', summary: 'Tanaman tradisional yang dikenal menenangkan kulit yang stres.' }, blocks: {} } },
  },
  {
    id: 'i-niacinamide',
    kind: 'entry',
    collectionId: 'ingredients',
    path: 'niacinamide',
    values: { name: 'Niacinamide', summary: 'A form of vitamin B3 that helps skin look more even.', origin: 'Lab-made' },
    blocks: [],
    copies: {},
  },
  {
    id: 'i-rose',
    kind: 'entry',
    collectionId: 'ingredients',
    path: 'rose-water',
    values: { name: 'Rose water', summary: 'Distilled petals that refresh and soften.', origin: 'Central Java' },
    blocks: [],
    copies: { id: { values: { name: 'Air mawar', summary: 'Sulingan kelopak mawar yang menyegarkan dan melembutkan.' }, blocks: {} } },
  },
  {
    id: 'page-home',
    kind: 'page',
    path: '/',
    values: { title: 'Home', seo: 'Botani makes gentle skincare from familiar botanicals.' },
    blocks: [
      {
        id: 'b-hero',
        type: 'hero',
        values: {
          heading: 'Gentle care, grown close to home',
          body: 'Everyday skincare built around botanicals you already know.',
          image: { mediaId: 'm-hero', alt: 'Rose petals and centella leaves on linen' },
          cta: 'Shop the range',
          target: 'Shop',
        },
      },
      {
        id: 'b-featured',
        type: 'featured',
        values: {
          heading: 'Bestsellers',
          items: [
            { _rowId: 'f1', product: 'p-serum' },
            { _rowId: 'f2', product: 'p-cleanser' },
            { _rowId: 'f3', product: 'p-cream' },
          ],
        },
      },
      {
        id: 'b-story',
        type: 'text',
        values: { heading: 'Our story', body: 'We started in a small kitchen lab with three ingredients and a lot of patience.' },
      },
    ],
    copies: {
      id: {
        values: { title: 'Beranda', seo: 'Botani membuat perawatan kulit lembut dari bahan alami yang akrab.' },
        blocks: {
          'b-hero': {
            heading: 'Perawatan lembut dari alam terdekat',
            body: 'Perawatan kulit sehari-hari dari bahan alami yang sudah Anda kenal.',
            image: { alt: 'Kelopak mawar dan daun pegagan di atas linen' },
            cta: 'Belanja sekarang',
          },
          'b-featured': { heading: 'Terlaris' },
          'b-story': { heading: 'Cerita kami', body: 'Kami memulai di dapur kecil dengan tiga bahan dan banyak kesabaran.' },
        },
      },
    },
  },
  {
    id: 'tpl-product',
    kind: 'page',
    path: 'Generic · Products',
    values: { title: 'Product page', seo: '' },
    blocks: [
      { id: 'b-details', type: 'productDetails', values: { ingredientsHeading: 'Key ingredients', featuredHeading: 'Featured ingredient', cta: 'Find a stockist' } },
    ],
    copies: {
      id: {
        values: { title: 'Halaman produk' },
        blocks: { 'b-details': { ingredientsHeading: 'Bahan utama', featuredHeading: 'Bahan unggulan', cta: 'Cari toko' } },
      },
    },
  },
  {
    id: 'layout-main',
    kind: 'layout',
    name: 'Main layout',
    path: '',
    values: {
      brand: 'Botani',
      announcement: 'Free shipping on orders over Rp 250.000',
      nav: [
        { _rowId: 'n1', label: 'Shop', target: 'Shop' },
        { _rowId: 'n2', label: 'Ingredients', target: 'Ingredients' },
        { _rowId: 'n3', label: 'Our story', target: 'Story' },
      ],
      footer: 'Made in small batches. Questions? hello@botani.example',
    },
    blocks: [],
    copies: {
      id: {
        values: {
          announcement: 'Gratis ongkir untuk pesanan di atas Rp 250.000',
          nav: { n1: { label: 'Belanja' }, n2: { label: 'Bahan' }, n3: { label: 'Cerita kami' } },
          footer: 'Dibuat dalam jumlah kecil. Ada pertanyaan? hello@botani.example',
        },
        blocks: {},
      },
    },
  },
];

export interface Scenario {
  id: string;
  title: string;
  open: { area: 'content' | 'pages' | 'layout' | 'settings' | 'collections'; doc?: string; field?: string };
  lang?: string;
  try: string;
}
export const scenarios: Scenario[] = [
  { id: 'complete', title: 'Complete English and Indonesian copies', open: { area: 'content', doc: 'p-serum' }, lang: 'id', try: 'Switch languages. Compare shared Size and Featured ingredient with per-language Name and Description. Switch the preview between Draft and Visitor.' },
  { id: 'missing', title: 'Missing Indonesian copy', open: { area: 'content', doc: 'p-cleanser' }, lang: 'id', try: 'The preview shows the whole English item as fallback. Start Add Indonesian copy, then Cancel: nothing is created.' },
  { id: 'incomplete', title: 'Incomplete Indonesian draft', open: { area: 'content', doc: 'p-cream' }, lang: 'id', try: 'Draft preview marks missing values; Visitor shows English. Set Settings → Require every language, then Save draft and Publish.' },
  { id: 'complete-required', title: 'Completing required localized values', open: { area: 'content', doc: 'p-cream' }, lang: 'id', try: 'Fill Description and the Squalane row name. The status turns Eligible automatically; nothing publishes until Publish.' },
  { id: 'edit-main', title: 'Editing English after Indonesian exists', open: { area: 'content', doc: 'p-serum' }, lang: 'en', try: 'Change the English description, then switch to Indonesian. It stays Eligible with no review warning.' },
  { id: 'nested', title: 'Navigation and nested editing', open: { area: 'pages', doc: 'page-home' }, lang: 'id', try: 'Open Hero and edit it; open Featured products → a row; go to Site Layouts → Main layout → a link; return. Edits persist; the top-bar language stays selected.' },
  { id: 'settings', title: 'Site language settings', open: { area: 'settings' }, try: 'Turn languages off/on, change the missing-translation policy, try the locked main language, remove and re-add Indonesian.' },
  { id: 'schema', title: 'Schema localization control', open: { area: 'collections', field: 'size' }, try: 'Change Size to “Separate value per language” and read the effect on existing copies. Photo keeps one image with alt text per language.' },
];
