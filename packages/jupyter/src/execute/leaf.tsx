import { useEffect, useRef } from 'react';
import type { ExecuteScopeAction } from './actions';
import type { IdKeyMap, ExecuteScopeState } from './types';
import { useThebeLoader, useThebeConfig, useThebeServer } from 'thebe-react';
import { notebookFromMdast } from './utils';
import type { GenericParent } from 'myst-common';
import { selectAreAllNotebookScopesBuilt, selectAreAllSessionsStarted } from './selectors';
import { useFetchMdast } from 'myst-to-react';

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

  return null;
}

export function NotebookBuilder({
  pageSlug,
  notebookSlug,
  idkmap,
  state,
  dispatch,
}: {
  pageSlug: string;
  notebookSlug: string;
  idkmap: IdKeyMap;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { core } = useThebeLoader();
  const { config } = useThebeConfig();
  const lock = useRef(false); // TODO can be removed if we solve double render from provider

  const scopeHasNotebook = !!state.pages[pageSlug]?.scopes[notebookSlug];

  useEffect(() => {
    if (!core || !config || scopeHasNotebook || lock.current) return;
    lock.current = true;
    console.log(`NotebookBuilder - ${notebookSlug} being added to scope ${pageSlug}`);
    const rendermime = core?.makeRenderMimeRegistry(config?.mathjax);
    const notebook = notebookFromMdast(
      core,
      config,
      pageSlug,
      notebookSlug,
      state.mdast[notebookSlug].root as GenericParent,
      idkmap,
      rendermime,
    );

    // hook up computable targets
    const computables = state.pages[pageSlug]?.computables;
    computables?.forEach((c) => {
      if (idkmap[c.label]) {
        idkmap[c.outputKey] = idkmap[c.label];
        idkmap[c.embedKey] = idkmap[c.label];
      }
    });

    dispatch({
      type: 'ADD_NOTEBOOK',
      payload: { pageSlug, notebookSlug, rendermime, notebook },
    });
  }, [core, config, pageSlug, notebookSlug, scopeHasNotebook, lock]);

  // TODO find a way to check if the all the notebooks are built and do a single dispatch
  // potentilly use a move the loop down into this component
  const allNotebooksAreBuilt = selectAreAllNotebookScopesBuilt(state, pageSlug);
  useEffect(() => {
    if (!allNotebooksAreBuilt) return;
    dispatch({ type: 'BUILD_STATUS', payload: { slug: pageSlug, status: 'wait-for-server' } });
  }, [allNotebooksAreBuilt]);

  return null;
}

export function SessionStarter({
  pageSlug,
  notebookSlug,
  state,
  dispatch,
}: {
  pageSlug: string;
  notebookSlug: string;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { core } = useThebeLoader();
  const { config, server } = useThebeServer();
  const lock = useRef(false); // TODO can be removed if we solve double render from provider

  const scope = state.pages[pageSlug]?.scopes[notebookSlug];

  useEffect(() => {
    if (!core || !server || scope.session || lock.current) return;
    lock.current = true;
    console.log(`starting session for ${pageSlug}-${notebookSlug}`);

    server.listRunningSessions().then((sessions) => {
      console.log('running sessions', sessions);
      const path = `/${pageSlug}-${notebookSlug}.ipynb`;

      const existing = sessions.find((s) => s.path === path);

      if (existing) {
        console.debug(`session already exists for ${pageSlug}-${notebookSlug}`, existing);
        server.connectToExistingSession(existing, scope.rendermime).then((sesh) => {
          if (sesh == null) {
            console.error(`Could not connect to session for ${pageSlug} ${notebookSlug}`);
            return;
          }
          console.debug(`reconnected to session for ${pageSlug}/${notebookSlug}`, sesh);
          console.debug('restarting session', sesh);
          sesh.kernel?.restart().then(() => {
            const notebook = state.pages[pageSlug]?.scopes[notebookSlug].notebook;
            notebook.attachSession(sesh);
            dispatch({ type: 'ADD_SESSION', payload: { pageSlug, notebookSlug, session: sesh } });
          });
        });
      } else {
        server
          .startNewSession(scope.rendermime, {
            ...config?.kernels,
            name: `${pageSlug}-${notebookSlug}.ipynb`,
            path,
          })
          .then((sesh) => {
            if (sesh == null) {
              server?.getKernelSpecs().then((specs) => {
                console.error(`Could not start session for ${pageSlug} ${notebookSlug}`);
                console.debug(`Available kernels: ${Object.keys(specs)}`);
              });
              return;
            }
            console.debug(`session started for ${pageSlug}/${notebookSlug}`, sesh);
            const notebook = state.pages[pageSlug]?.scopes[notebookSlug].notebook;
            notebook.attachSession(sesh);
            dispatch({ type: 'ADD_SESSION', payload: { pageSlug, notebookSlug, session: sesh } });
          });
      }
    });
  }, [core, config, pageSlug, notebookSlug, lock]);

  // TODO avoid multiple dispatch?
  const allSessionsAreStarted = selectAreAllSessionsStarted(state, pageSlug);
  useEffect(() => {
    if (!allSessionsAreStarted) return;
    dispatch({
      type: 'SET_RENDERING_READY',
      payload: { slug: pageSlug },
    });
  }, [allSessionsAreStarted]);

  return null;
}

export function ServerMonitor({
  state,
  dispatch,
}: {
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { core, load, loading } = useThebeLoader();
  const { ready, error } = useThebeServer();

  useEffect(() => {
    if (core || loading) return;
    load();
  }, [core, load, loading]);

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
    // TODO
    // dispatch({ type: 'SERVER_ERROR', payload: error });
  }, [error]);

  return null;
}
