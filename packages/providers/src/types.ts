import type React from 'react';
import type { Root } from 'mdast';
import type { SourceFileKind } from 'myst-common';

export type PartialPage = {
  kind: SourceFileKind;
  file: string;
  sha256: string;
  slug: string;
  mdast: Root;
};

export type NodeRenderer<T = any> = (
  node: T & { type: string; key: string; html_id?: string },
  children?: React.ReactNode,
) => React.ReactNode;
