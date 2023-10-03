import type { SourceFileKind, Dependency } from 'myst-spec-ext';
import type { BuildStatus, Computable } from './types.js';
import type { IRenderMimeRegistry, ThebeNotebook, ThebeSession } from 'thebe-core';
import type { GenericParent } from 'myst-common';

export function isNavigatePayload(payload: unknown): payload is NavigatePayload {
  const maybePayload = payload as NavigatePayload;
  return (
    typeof maybePayload.slug === 'string' &&
    typeof maybePayload.location === 'string' &&
    typeof maybePayload.mdast === 'object' &&
    Array.isArray(maybePayload.dependencies) &&
    Array.isArray(maybePayload.computables)
  );
}

interface NavigatePayload {
  kind: SourceFileKind;
  slug: string;
  location: string;
  mdast: GenericParent;
  dependencies: Dependency[];
  computables: Computable[];
}

export function isSlugPayload(payload: unknown): payload is SlugPayload {
  return typeof (payload as SlugPayload).slug === 'string';
}

interface SlugPayload {
  slug: string;
}

export function isDoubleSlugPayload(payload: unknown): payload is DoubleSlugPayload {
  const maybePayload = payload as DoubleSlugPayload;
  return typeof maybePayload.pageSlug === 'string' && typeof maybePayload.notebookSlug === 'string';
}

interface DoubleSlugPayload {
  pageSlug: string;
  notebookSlug: string;
}

export function isBuildStatusPayload(payload: unknown): payload is BuildStatusPayload {
  return typeof (payload as BuildStatusPayload).status === 'string' && isSlugPayload(payload);
}

interface BuildStatusPayload {
  slug: string;
  status: BuildStatus;
}

export function isEnableScopePayload(payload: unknown): payload is EnableScopePayload {
  const maybePayload = payload as EnableScopePayload;
  return (
    typeof maybePayload.renderingSlug === 'string' && typeof maybePayload.scopeSlug === 'string'
  );
}

interface EnableScopePayload {
  renderingSlug: string;
  scopeSlug: string;
}

export function isAddMdastPayload(payload: unknown): payload is AddMdastPayload {
  const maybePayload = payload as AddMdastPayload;
  return typeof maybePayload.slug === 'string' && typeof maybePayload.mdast === 'object';
}

interface AddMdastPayload {
  slug: string;
  mdast: GenericParent;
}

export function isAddNotebookPayload(payload: unknown): payload is AddNotebookPayload {
  const maybePayload = payload as AddNotebookPayload;
  return (
    typeof maybePayload.pageSlug === 'string' &&
    typeof maybePayload.notebookSlug === 'string' &&
    typeof maybePayload.notebook === 'object' &&
    typeof maybePayload.rendermime === 'object'
  );
}

interface AddNotebookPayload {
  pageSlug: string;
  notebookSlug: string;
  notebook: ThebeNotebook;
  rendermime: IRenderMimeRegistry;
}

export function isAddSessionPayload(payload: unknown): payload is AddSessionPayload {
  const maybePayload = payload as AddSessionPayload;
  return (
    typeof maybePayload.pageSlug === 'string' &&
    typeof maybePayload.notebookSlug === 'string' &&
    typeof maybePayload.session === 'object'
  );
}

interface AddSessionPayload {
  pageSlug: string;
  notebookSlug: string;
  session: ThebeSession;
}

export interface ExecuteScopeAction {
  type:
    | 'NAVIGATE'
    | 'REQUEST_BUILD'
    | 'BUILD_STATUS'
    | 'CLEAR_BUILD'
    | 'ADD_MDAST'
    | 'ADD_NOTEBOOK'
    | 'ADD_SESSION'
    | 'SET_FIRST_EXECUTION'
    | 'SET_RENDERING_READY';
  payload:
    | NavigatePayload
    | SlugPayload
    | DoubleSlugPayload
    | BuildStatusPayload
    | AddMdastPayload
    | AddNotebookPayload
    | AddSessionPayload;
}
