import { useFetchMdast } from 'myst-to-react';
import { useEffect } from 'react';
import type { ExecuteScopeAction } from './actions';
import type { IdKeyMap, ExecuteScopeState, IdKeyMapTarget } from './types';
import { useThebeLoader, useThebeConfig, useThebeServer } from 'thebe-react';
import { notebookFromMdast } from './utils';
import type { GenericParent } from 'myst-common';
import { selectAreAllNotebookScopesBuilt, selectAreAllSessionsStarted } from './selectors';

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
  idkmap,
  state,
  dispatch,
}: {
  renderSlug: string;
  notebookSlug: string;
  idkmap: IdKeyMap;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { core } = useThebeLoader();
  const { config } = useThebeConfig();

  const scopeHasNotebook = !!state.renderings[renderSlug]?.scopes[notebookSlug];

  useEffect(() => {
    if (!core || !config || scopeHasNotebook) return;

    console.log(`NotebookBuilder - ${notebookSlug} being added to scope ${renderSlug}`);
    const rendermime = core?.makeRenderMimeRegistry(config?.mathjax);
    const notebook = notebookFromMdast(
      core,
      config,
      renderSlug,
      notebookSlug,
      state.mdast[notebookSlug].root as GenericParent,
      idkmap,
      rendermime,
    );

    // hook up computable targets
    const computables = state.renderings[renderSlug]?.computables;
    computables?.forEach((c) => {
      if (idkmap[c.label]) {
        idkmap[c.outputKey] = idkmap[c.label];
        idkmap[c.embedKey] = idkmap[c.label];
      }
    });

    dispatch({ type: 'ADD_NOTEBOOK', payload: { renderSlug, notebookSlug, rendermime, notebook } });
  }, [core, config, renderSlug, notebookSlug]);

  // TODO find a way to check if the all the notebooks are built and do a single dispatch
  // potentilly use a move the loop down into this component
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
  const { core } = useThebeLoader();
  const { config, server } = useThebeServer();

  const scope = state.renderings[renderSlug]?.scopes[notebookSlug];

  useEffect(() => {
    if (!core || !server || scope.session) return;
    server
      .startNewSession(scope.rendermime, {
        ...config?.kernels,
        name: notebookSlug,
        path: notebookSlug,
      })
      .then((sesh) => {
        if (sesh == null) {
          server?.getKernelSpecs().then((specs) => {
            console.error(`Could not start session for ${renderSlug} ${notebookSlug}`);
            console.log(`Available kernels: ${Object.keys(specs)}`);
          });
          return;
        }
        // TODO maybe clear the build status here???
        dispatch({ type: 'ADD_SESSION', payload: { renderSlug, notebookSlug, session: sesh } });
      });
  }, [core, config, renderSlug, notebookSlug]);

  // TODO avoid multiple dispatch?
  const allSessionsAreStarted = selectAreAllSessionsStarted(state, renderSlug);
  useEffect(() => {
    if (!allSessionsAreStarted) return;
    dispatch({ type: 'SET_RENDERING_READY', payload: { slug: renderSlug } });
  }, [allSessionsAreStarted]);

  return (
    <div>
      starting: {notebookSlug} for {renderSlug}
    </div>
  );
}

export function ServerMonitor({
  showMessages,
  state,
  dispatch,
}: {
  showMessages?: boolean;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { connecting, ready, error } = useThebeServer();

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
