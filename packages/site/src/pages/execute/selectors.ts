import type { ExecuteScopeState } from './reducer';

export function selectIsComputable(state: ExecuteScopeState, slug: string) {
  return state.renderings[slug]?.computable ?? false;
}

export function selectAreExecutionScopesReady(state: ExecuteScopeState, slug: string) {
  return state.renderings[slug]?.ready;
}

export function selectAreExecutionScopesBuilding(state: ExecuteScopeState, slug: string) {
  return !state.renderings[slug]?.ready && !!state.builds[slug];
}

export function selectExecutionScopeStatus(state: ExecuteScopeState, slug: string) {
  return state.renderings[slug]?.ready ? 'ready' : state.builds[slug]?.status ?? 'unknown';
}

// TODO Memoize
export function selectDependenciesToFetch(state: ExecuteScopeState) {
  return Object.entries(state.builds).reduce<
    {
      slug: string;
      url: string;
    }[]
  >(
    (targets, [slug]) => [
      ...targets,
      ...state.renderings[slug].dependencies
        .filter((d) => !state.mdast[d.slug ?? d.url])
        .map((d) => ({
          slug: d.slug ?? d.url,
          url: d.url,
        })),
    ],
    [],
  );
}

export function selectAreAllDependenciesReady(state: ExecuteScopeState, slug: string) {
  return state.renderings[slug]?.dependencies.every((dep) => !!state.mdast[dep.slug ?? dep.url]);
}
