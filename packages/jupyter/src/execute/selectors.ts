import { SourceFileKind, type Dependency } from 'myst-spec-ext';
import type { BuildStatus, ExecuteScopeState } from './types.js';

export function selectScopeForPage(state: ExecuteScopeState, pageSlug: string) {
  return state.pages[pageSlug]?.scopes ?? {};
}

export function selectNotebookForPage(
  state: ExecuteScopeState,
  pageSlug: string,
  notebookSlug: string,
) {
  return state.pages[pageSlug]?.scopes[notebookSlug]?.notebook;
}

export function selectIsComputable(state: ExecuteScopeState, slug: string) {
  return state.pages[slug]?.computable ?? false;
}

export function selectAreExecutionScopesReady(state: ExecuteScopeState, slug: string) {
  return state.pages[slug]?.ready;
}

export function selectAreExecutionScopesBuilding(state: ExecuteScopeState, slug: string) {
  return !state.pages[slug]?.ready && !!state.builds[slug];
}

export function selectExecutionScopeStatus(state: ExecuteScopeState, slug: string) {
  return state.pages[slug]?.ready ? 'ready' : state.builds[slug]?.status ?? 'unknown';
}

//
// The following teo functions are ripe for generaizing but also it would be good to
// see if we can memoize them, potentially with reselect.
//

// TODO Memoize?
export function selectDependenciesToFetch(state: ExecuteScopeState) {
  return Object.entries(state.builds)
    .filter(([, { status }]) => status === 'fetching')
    .reduce<
      {
        slug: string;
        url: string;
      }[]
    >(
      (targets, [slug]) => [
        ...targets,
        ...state.pages[slug].dependencies
          .filter((d: Dependency) => !state.mdast[(d.slug ?? d.url) as string])
          .map((d: Dependency) => ({
            slug: (d.slug ?? d.url) as string,
            url: d.url as string,
          })),
      ],
      [],
    );
}

// // TODO Memoize?
function makeSelectScopeEventStatus(statusName: BuildStatus) {
  return (state: ExecuteScopeState) => {
    return Object.entries(state.builds)
      .filter(([, { status }]) => status === statusName)
      .reduce<{ pageSlug: string; notebookSlug: string; location: string | undefined }[]>(
        (all, [slug]) => {
          const targets = [];
          if (state.pages[slug].kind === SourceFileKind.Notebook)
            targets.push({
              pageSlug: slug,
              notebookSlug: slug,
              location: state.pages[slug].location,
            });
          targets.push(
            ...state.pages[slug].dependencies.map((d) => ({
              pageSlug: slug,
              notebookSlug: (d.slug ?? d.url) as string,
              location: d.location,
            })),
          );
          return [...all, ...targets];
        },
        [],
      );
  };
}

export const selectScopeNotebooksToBuild = makeSelectScopeEventStatus('build-notebooks');
export const selectSessionsToStart = makeSelectScopeEventStatus('start-session');

export function selectAreAllDependenciesReady(state: ExecuteScopeState, slug: string) {
  return state.pages[slug]?.dependencies.every(
    (dep) => !!state.mdast[(dep.slug ?? dep.url) as string],
  );
}

export function selectAreAllNotebookScopesBuilt(state: ExecuteScopeState, slug: string) {
  const rendering = state.pages[slug];
  return rendering?.dependencies.every(
    (dep) => !!rendering.scopes[(dep.slug ?? dep.url) as string],
  );
}

export function selectAreAllSessionsStarted(state: ExecuteScopeState, slug: string) {
  const rendering = state.pages[slug];
  // TODO is this working??
  return rendering?.dependencies.every(
    (dep) => !!rendering.scopes[(dep.slug ?? dep.url) as string]?.session,
  );
}
