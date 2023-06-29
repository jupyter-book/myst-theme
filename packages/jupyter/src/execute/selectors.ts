import { SourceFileKind, type Dependency } from 'myst-common';
import type { BuildStatus, ExecuteScopeState } from './types';

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
        ...state.renderings[slug].dependencies
          .filter((d: Dependency) => !state.mdast[d.slug ?? d.url])
          .map((d: Dependency) => ({
            slug: d.slug ?? d.url,
            url: d.url,
          })),
      ],
      [],
    );
}

// // TODO Memoize?
function makeSelectScopeEventStatus(statusName: BuildStatus) {
  return (state: ExecuteScopeState): { renderSlug: string; notebookSlug: string }[] => {
    return Object.entries(state.builds)
      .filter(([, { status }]) => status === statusName)
      .reduce<{ renderSlug: string; notebookSlug: string }[]>((all, [slug]) => {
        const targets = [];
        if (state.renderings[slug].kind === SourceFileKind.Notebook)
          targets.push({ renderSlug: slug, notebookSlug: slug });
        targets.push(
          ...state.renderings[slug].dependencies.map((d) => ({
            renderSlug: slug,
            notebookSlug: d.slug ?? d.url,
          })),
        );
        return [...all, ...targets];
      }, []);
  };
}

export const selectScopeNotebooksToBuild = makeSelectScopeEventStatus('build-notebooks');
export const selectSessionsToStart = makeSelectScopeEventStatus('start-session');

// // TODO Memoize?
// export function selectScopeNotebooksToBuild(
//   state: ExecuteScopeState,
// ): { renderSlug: string; notebookSlug: string }[] {
//   return Object.entries(state.builds)
//     .filter(([, { status }]) => status === 'build-notebooks')
//     .reduce<{ renderSlug: string; notebookSlug: string }[]>((all, [slug]) => {
//       const targets = [];
//       if (state.renderings[slug].kind === SourceFileKind.Notebook)
//         targets.push({ renderSlug: slug, notebookSlug: slug });
//       targets.push(
//         ...state.renderings[slug].dependencies.map((d) => ({
//           renderSlug: slug,
//           notebookSlug: d.slug ?? d.url,
//         })),
//       );
//       return [...all, ...targets];
//     }, []);
// }

// // TODO Memoize?
// export function selectSsessionsToStart(
//   state: ExecuteScopeState,
// ): { renderSlug: string; notebookSlug: string }[] {
//   return Object.entries(state.builds)
//     .filter(([, { status }]) => status === 'start-session')
//     .reduce<{ renderSlug: string; notebookSlug: string }[]>((all, [slug]) => {
//       const targets = [];
//       if (state.renderings[slug].kind === SourceFileKind.Notebook)
//         targets.push({ renderSlug: slug, notebookSlug: slug });
//       targets.push(
//         ...state.renderings[slug].dependencies.map((d) => ({
//           renderSlug: slug,
//           notebookSlug: d.slug ?? d.url,
//         })),
//       );
//       return [...all, ...targets];
//     }, []);
// }

export function selectAreAllDependenciesReady(state: ExecuteScopeState, slug: string) {
  return state.renderings[slug]?.dependencies.every((dep) => !!state.mdast[dep.slug ?? dep.url]);
}

export function selectAreAllNotebookScopesBuilt(state: ExecuteScopeState, slug: string) {
  const rendering = state.renderings[slug];
  return rendering?.dependencies.every((dep) => rendering.scopes[dep.slug ?? dep.url]);
}
