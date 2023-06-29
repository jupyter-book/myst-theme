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
  const lock = useRef(false); // TODO can be removed if we solve double render from provider

  const scopeHasNotebook = !!state.renderings[renderSlug]?.scopes[notebookSlug];

  useEffect(() => {
    if (!core || !config || scopeHasNotebook || lock.current) return;
    lock.current = true;
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

    dispatch({
      type: 'ADD_NOTEBOOK',
      payload: { renderSlug, notebookSlug, rendermime, notebook },
    });
  }, [core, config, renderSlug, notebookSlug, scopeHasNotebook, lock]);

  // TODO find a way to check if the all the notebooks are built and do a single dispatch
  // potentilly use a move the loop down into this component
  const allNotebooksAreBuilt = selectAreAllNotebookScopesBuilt(state, renderSlug);
  useEffect(() => {
    if (!allNotebooksAreBuilt) return;
    dispatch({ type: 'BUILD_STATUS', payload: { slug: renderSlug, status: 'wait-for-server' } });
  }, [allNotebooksAreBuilt]);

  return null;
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
  const lock = useRef(false); // TODO can be removed if we solve double render from provider

  const scope = state.renderings[renderSlug]?.scopes[notebookSlug];

  useEffect(() => {
    if (!core || !server || scope.session || lock.current) return;
    lock.current = true;
    console.log(`starting session for ${renderSlug}-${notebookSlug}`);

    server.listRunningSessions().then((sessions) => {
      console.log('running sessions', sessions);
      const path = `/${renderSlug}-${notebookSlug}.ipynb`;

      const existing = sessions.find((s) => s.path === path);

      if (existing) {
        console.log(`session already exists for ${renderSlug}-${notebookSlug}`, existing);
        server.connectToExistingSession(existing, scope.rendermime).then((sesh) => {
          if (sesh == null) {
            console.error(`Could not connect to session for ${renderSlug} ${notebookSlug}`);
            return;
          }
          console.log(`reconnected to session for ${renderSlug}/${notebookSlug}`, sesh);
          console.log('restarting session', sesh);
          sesh.kernel?.restart().then(() => {
            const notebook = state.renderings[renderSlug]?.scopes[notebookSlug].notebook;
            notebook.attachSession(sesh);
            dispatch({ type: 'ADD_SESSION', payload: { renderSlug, notebookSlug, session: sesh } });
          });
        });
      } else {
        server
          .startNewSession(scope.rendermime, {
            ...config?.kernels,
            name: `${renderSlug}-${notebookSlug}.ipynb`,
            path,
          })
          .then((sesh) => {
            if (sesh == null) {
              server?.getKernelSpecs().then((specs) => {
                console.error(`Could not start session for ${renderSlug} ${notebookSlug}`);
                console.log(`Available kernels: ${Object.keys(specs)}`);
              });
              return;
            }
            console.log(`session started for ${renderSlug}/${notebookSlug}`, sesh);
            const notebook = state.renderings[renderSlug]?.scopes[notebookSlug].notebook;
            notebook.attachSession(sesh);
            dispatch({ type: 'ADD_SESSION', payload: { renderSlug, notebookSlug, session: sesh } });
          });
      }
    });
  }, [core, config, renderSlug, notebookSlug, lock]);

  // TODO avoid multiple dispatch?
  const allSessionsAreStarted = selectAreAllSessionsStarted(state, renderSlug);
  useEffect(() => {
    if (!allSessionsAreStarted) return;
    dispatch({ type: 'SET_RENDERING_READY', payload: { slug: renderSlug } });
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
