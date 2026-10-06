export type Json =
  null | boolean | number | string | Json[] | { [key: string]: Json };
export type Values = Record<string, Json>;
export interface Block {
  id: string;
  type: string;
  version: number;
  props: Values;
  bindings?: Record<string, string>;
}
export interface Envelope {
  formatVersion: 1;
  id: string;
}
export interface Page extends Envelope {
  kind: 'static' | 'generic';
  path?: string;
  title: string;
  blocks: Block[];
}
export interface Entry extends Envelope {
  collectionId: string;
  slug: string;
  values: Values;
}
export type Field = {
  key: string;
  label: string;
  required?: boolean;
  default?: Json;
  widget?: string;
  format?: 'form-endpoint';
  collectionField?: { collectionKey: string; types: string[] };
} & (
  | { type: 'text'; multiline?: boolean }
  | { type: 'url' }
  | { type: 'list'; fields: Field[]; min?: number; max?: number }
  | { type: 'number'; min?: number; max?: number }
  | { type: 'richtext' }
  | { type: 'collection' }
  | { type: 'date' }
  | { type: 'toggle' }
  | { type: 'select'; options: { value: string; label: string }[] }
  | { type: 'media' }
  | { type: 'custom'; widget: string; validator: string }
);
export interface Collection extends Envelope {
  name: string;
  path: string;
  fields: Field[];
  titleField: string;
  genericPageId?: string;
}
export type Link =
  | { kind: 'page' | 'entry'; id: string; fragment?: string }
  | { kind: 'external'; url: string };
export interface MediaFile {
  key: string;
  url: string;
  mime: string;
  bytes: number;
  width?: number;
  height?: number;
}
export interface Media extends Envelope {
  name: string;
  original: MediaFile;
  variants: MediaFile[];
}
export interface Site extends Envelope {
  globals: Values;
  layout?: LayoutSelection;
  /** Legacy Site Options, read losslessly into the starter layout. */
  title?: string;
  navigation?: { id: string; label: string; to: Link }[];
  header?: Values;
  footer?: Block;
}
export interface LayoutSelection {
  id: string;
  version: number;
  settings: Values;
}
export interface LayoutDefinition {
  id: string;
  version: number;
  label: string;
  description: string;
  deprecated?: boolean;
  activation: 'never' | 'load';
  defaults: Values;
  fields: Field[];
  component: string;
  settingsComponent: string;
  policy: string;
  headComponent?: string;
}
export interface Content {
  site: Site;
  pages: Page[];
  collections: Collection[];
  entries: Entry[];
  media: Media[];
}
export type Activation = 'never' | 'visible' | 'idle' | 'load';
export interface Definition {
  type: string;
  version: number;
  label: string;
  deprecated?: boolean;
  kind?: 'static' | 'generic';
  framework: 'react' | 'svelte' | 'vue' | 'vanilla';
  activation: Activation;
  fields: Field[];
  defaults: Values;
  dependencies: Record<string, string>;
  component: string;
  theme?: string;
  tags?: string[];
  description?: string;
  placement?: 'page' | 'footer';
}
export interface Context {
  instanceId: string;
  globals: Values;
  media: Media[];
  links: Record<string, string>;
  bindingPlaceholders?: Record<string, string>;
  preview?: boolean;
  collections?: {
    id: string;
    name: string;
    entries: { id: string; title: string; url?: string; values?: Values }[];
  }[];
}
export interface ViewProps {
  props: Values;
  context: Context;
}
export interface Handle {
  update(props: Values, context: Context): void;
  destroy(): void;
}
export interface Issue {
  path: string;
  message: string;
  phase: 'structure' | 'publish';
}
export interface Snapshot {
  sha: string;
  treeSha: string;
  sourceFiles: Record<string, string>;
  content: Content;
  files: Record<string, string>;
  blobs: Record<string, string>;
}
