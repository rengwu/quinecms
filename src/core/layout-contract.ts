import type { ReactNode } from 'react';
import type { Block, Content, Field, Values } from './types';

/** Layout authors own the surrounding UI and any JSON settings. */
export interface LayoutProps {
  settings: Values;
  content: Content;
  children?: ReactNode;
  preview?: boolean;
  onNavigate?(url: string, documentId?: string): void;
}
export interface LayoutSettingsProps {
  settings: Values;
  content: Content;
  onChange(settings: Values): void;
}
export interface LayoutValidation {
  fields(fields: Field[], values: Values, path: string): void;
  blocks(
    blocks: Block[],
    path: string,
    kind: 'static' | 'generic',
    placement?: 'page' | 'footer',
  ): void;
  add(path: string, message: string, phase?: 'structure' | 'publish'): void;
}
export interface LayoutPolicy {
  title?(settings: Values): string;
  globals?(settings: Values): Values;
  validate?(settings: Values, content: Content, api: LayoutValidation): void;
}
