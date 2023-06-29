import type { Dependency, SourceFileKind } from 'myst-common';
import type { Root } from 'mdast';
import type { BuildStatus } from './reducer';

export interface Computable {
  key: string;
  label: string;
  source: Dependency;
}

export function isNavigatePayload(payload: unknown): payload is NavigatePayload {
  const maybePayload = payload as NavigatePayload;
  return (
    typeof maybePayload.slug === 'string' &&
    typeof maybePayload.mdast === 'object' &&
    Array.isArray(maybePayload.dependencies) &&
    Array.isArray(maybePayload.computables)
  );
}

interface NavigatePayload {
  kind: SourceFileKind;
  slug: string;
  mdast: Root;
  dependencies: Dependency[];
  computables: Computable[];
}

export function isSlugPayload(payload: unknown): payload is SlugPayload {
  return typeof (payload as SlugPayload).slug === 'string';
}

interface SlugPayload {
  slug: string;
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
  mdast: Root;
}

export interface ExecuteScopeAction {
  type:
    | 'NAVIGATE'
    | 'ENABLE_SCOPE'
    | 'REQUEST_BUILD'
    | 'BUILD_STATUS'
    | 'CLEAR_BUILD'
    | 'ADD_MDAST';
  payload:
    | NavigatePayload
    | SlugPayload
    | BuildStatusPayload
    | EnableScopePayload
    | AddMdastPayload;
}
