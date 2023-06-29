import type { Root } from 'mdast';
import type { SourceFileKind, Dependency } from 'myst-common';
import type { IRenderMimeRegistry, ThebeNotebook, ThebeSession } from 'thebe-core';

export type BuildStatus =
  | 'pending'
  | 'fetching'
  | 'build-notebooks'
  | 'wait-for-server'
  | 'start-session'
  | 'error';

export type IdOrKey = string; // any node key (block, codeCel, output)
export type RenderingSlug = string; // the slug of the page being rendered
export type NotebookSlug = string; // the slug of the notebook
export type CellId = string; // the id of a cell in a notebook, by convention it is the block.key
export type IdKeyMap = Record<IdOrKey, { slug: NotebookSlug; cellId: CellId }>;

export interface ExecuteScopeState {
  mdast: {
    [slug: RenderingSlug]: {
      root: Root;
    };
  };
  renderings: {
    [slug: RenderingSlug]: {
      slug: RenderingSlug;
      kind: SourceFileKind;
      computable: boolean;
      dependencies: Dependency[];
      computables: Computable[];
      ready: boolean;
      scopes: {
        [slug: NotebookSlug]: ExecutionScope;
      };
    };
  };
  builds: {
    [slug: string]: {
      status: BuildStatus;
    };
  };
}

export interface ExecutionScope {
  rendermime: IRenderMimeRegistry;
  notebook: ThebeNotebook;
  session?: ThebeSession;
}

export interface Computable {
  key: string;
  label: string;
  source: Dependency;
}
