import type { ExecuteScopeState } from './reducer';

export function selectIsComputable(slug: string, state: ExecuteScopeState) {
  return state.renderings[slug]?.computable ?? false;
}

export function selectAreExecutionScopesReady(slug: string, state: ExecuteScopeState) {
  return state.renderings[slug]?.ready;
}

export function selectAreExecutionScopesBuilding(slug: string, state: ExecuteScopeState) {
  return !state.renderings[slug]?.ready && !!state.builds[slug];
}

export function selectExecutionScopeStatus(slug: string, state: ExecuteScopeState) {
  return state.renderings[slug]?.ready ? 'ready' : state.builds[slug]?.status ?? 'unknown';
}
