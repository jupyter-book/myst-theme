import type React from 'react';
import type { Root } from 'mdast';

// TODO is there a case for a shared types package?
export enum KINDS {
  Article = 'Article',
  Notebook = 'Notebook',
}

export type PartialPage = {
  kind: KINDS;
  file: string;
  sha256: string;
  slug: string;
  mdast: Root;
};

export type NodeRenderer<T = any> = (
  node: T & { type: string; key: string; html_id?: string },
  children?: React.ReactNode,
) => React.ReactNode;
