import { useFetchMdast } from 'myst-to-react';
import { useEffect } from 'react';
import type { ExecuteScopeAction } from './actions';
import type { IdKeyMap, ExecuteScopeState } from './types';
import { useThebeLoader, useThebeConfig } from 'thebe-react';
import { notebookFromMdast } from './utils';
import type { GenericParent } from 'myst-common';
import { selectAreAllNotebookScopesBuilt } from './selectors';

export function MdastFetcher({
  slug,
  url,
  dispatch,
}: {
  slug: string;
  url: string;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { data, error } = useFetchMdast({ remote: true, dataUrl: `${url}.json` });

  useEffect(() => {
    if (!data) return;
    dispatch({ type: 'ADD_MDAST', payload: { slug, mdast: data.mdast } });
  }, [data]);

  if (error) {
    return (
      <div>
        error: {slug}
        {error.message}
      </div>
    );
  }

  return <div>fetching: {`${slug}.json`}</div>;
}

export function NotebookBuilder({
  renderSlug,
  notebookSlug,
  idkMap,
  state,
  dispatch,
}: {
  renderSlug: string;
  notebookSlug: string;
  idkMap: IdKeyMap;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { core } = useThebeLoader();
  const { config } = useThebeConfig();

  const scopeHasNotebook = state.renderings[renderSlug]?.scopes[notebookSlug];

  useEffect(() => {
    if (!core || !config || scopeHasNotebook) return;

    console.log(`NotebookBuilder - ${notebookSlug} is not in scope`);
    const rendermime = core?.makeRenderMimeRegistry(config?.mathjax);
    const notebook = notebookFromMdast(
      core,
      config,
      `${renderSlug}-${notebookSlug}`,
      state.mdast[notebookSlug].root as GenericParent,
      idkMap,
      rendermime,
    );

    console.log(`NotebookBuilder - ${notebookSlug} is built`, {
      renderSlug,
      notebookSlug,
      rendermime,
      notebook,
    });

    dispatch({ type: 'ADD_NOTEBOOK', payload: { renderSlug, notebookSlug, rendermime, notebook } });
  }, [core, config, renderSlug, notebookSlug]);

  const allNotebooksAreBuilt = selectAreAllNotebookScopesBuilt(state, renderSlug);
  useEffect(() => {
    if (!allNotebooksAreBuilt) return;
    dispatch({ type: 'BUILD_STATUS', payload: { slug: renderSlug, status: 'wait-for-server' } });
  }, [allNotebooksAreBuilt]);

  return (
    <div>
      building: {notebookSlug} for {renderSlug}
    </div>
  );
}
