import { useFetchMdast } from 'myst-to-react';
import { useEffect } from 'react';
import type { ExecuteScopeAction } from './actions';
import type { IdKeyMap, ExecuteScopeState } from './types';
import { useThebeLoader, useThebeConfig, useThebeServer } from 'thebe-react';
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

  // TODO move to BuildMonitor to avoid race condition with server
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

export function SessionStarter({
  renderSlug,
  notebookSlug,
  state,
  dispatch,
}: {
  renderSlug: string;
  notebookSlug: string;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  return (
    <div>
      starting: {notebookSlug} for {renderSlug}
    </div>
  );
}

export function BuildMonitor({
  state,
  dispatch,
}: {
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { ready } = useThebeServer();

  // When server is ready, move any waiting builds onto the start session step
  useEffect(() => {
    if (ready) {
      // TODO optimize to do a single dispatch
      Object.entries(state.builds).forEach(([slug, { status }]) => {
        if (status === 'wait-for-server') {
          dispatch({ type: 'BUILD_STATUS', payload: { slug, status: 'start-session' } });
        }
      });
    }
  }, [ready, state]);

  return null;
}

export function ServerMonitor({ showMessages }: { showMessages?: boolean }) {
  const { connecting, ready, error } = useThebeServer();

  useEffect(() => {
    if (!error) return;
  }, [error]);

  if (error) {
    return (
      <div className="fixed text-red-600 border rounded shadow-lg bottom-3 right-3 animate-bounce">
        <h2>Server Connection Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (showMessages) {
    if (connecting) {
      return (
        <div className="fixed bottom-3 right-3">
          <div className="h-[30px] w-[30px] bg-orange-600 rounded-full shadow-lg border animate-bounce border-red-300" />
        </div>
      );
    }

    if (ready) {
      return (
        <div className="fixed bottom-3 right-3">
          <div className="animate-bounce h-[30px] w-[30px] bg-green-600 rounded-full shadow-lg border border-green-300" />
        </div>
      );
    }
  }

  return null;
}
