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
export type CellId = string; // the id of a cell in a notebook, by convention it is the block.key
export type IdKeyMapTarget = { renderSlug: string; notebookSlug: string; cellId: CellId };
export type IdKeyMap = Record<IdOrKey, IdKeyMapTarget>;

export interface ExecuteScopeState {
  mdast: {
    [slug: string]: {
      root: Root;
    };
  };
  renderings: {
    [renderSlug: string]: {
      slug: string;
      kind: SourceFileKind;
      computable: boolean;
      dependencies: Dependency[];
      computables: Computable[];
      ready: boolean;
      scopes: {
        [notebookSlug: string]: ExecutionScope;
      };
    };
  };
  builds: {
    [notebookSlug: string]: {
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
  embedKey: string;
  outputKey: string;
  label: string;
  source: Dependency;
}
