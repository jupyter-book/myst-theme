import type { GenericParent } from 'myst-common';
import type { SourceFileKind, Dependency } from 'myst-spec-ext';
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
export type IdKeyMapTarget = { pageSlug: string; notebookSlug: string; cellId: CellId };
export type IdKeyMap = Record<IdOrKey, IdKeyMapTarget>;

export interface ExecuteScopeState {
  mdast: {
    [slug: string]: {
      root: GenericParent;
    };
  };
  pages: {
    [pageSlug: string]: {
      slug: string;
      kind: SourceFileKind;
      computable: boolean;
      location: string;
      dependencies: Dependency[];
      computables: Computable[];
      ready: boolean;
      scopes: {
        [notebookSlug: string]: ExecutionScope;
      };
    };
  };
  builds: {
    [pageSlug: string]: {
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
