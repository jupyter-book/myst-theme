import { useEffect, useRef } from 'react';
import type { ExecuteScopeAction } from './actions.js';
import type { IdKeyMap, ExecuteScopeState, ExecutionScope } from './types.js';
import { useThebeLoader, useThebeConfig, useThebeServer } from 'thebe-react';
import { notebookFromMdast } from './utils.js';
import type { GenericParent } from 'myst-common';
import {
  selectAreAllNotebookScopesBuilt,
  selectAreAllSessionsStarted,
  selectNotebookForPage,
} from './selectors.js';
import { useFetchMdast } from 'myst-to-react';
import { useLoadPlotly } from '../plotly.js';

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

  const { plotly } = useLoadPlotly();

  useEffect(() => {
    if (!core || !config || !plotly || scopeHasNotebook || lock.current) return;
    lock.current = true;
    console.debug(`Jupyter: NotebookBuilder - ${notebookSlug} being added to scope ${pageSlug}`);
    const rendermime = core?.makeRenderMimeRegistry(config?.mathjax);
    if (plotly) rendermime.addFactory(plotly.rendererFactory, 41);
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
  }, [core, config, pageSlug, notebookSlug, scopeHasNotebook, lock, plotly]);

  // TODO find a way to check if the all the notebooks are built and do a single dispatch
  // potentilly use a move the loop down into this component
  const allNotebooksAreBuilt = plotly && selectAreAllNotebookScopesBuilt(state, pageSlug);
  useEffect(() => {
    if (!allNotebooksAreBuilt) return;
    dispatch({ type: 'BUILD_STATUS', payload: { slug: pageSlug, status: 'wait-for-server' } });
  }, [allNotebooksAreBuilt]);

  return null;
}

export function SessionStarter({
  pageSlug,
  notebookSlug,
  location,
  state,
  dispatch,
}: {
  pageSlug: string;
  notebookSlug: string;
  location: string | undefined;
  state: ExecuteScopeState;
  dispatch: React.Dispatch<ExecuteScopeAction>;
}) {
  const { core } = useThebeLoader();
  const { config, server } = useThebeServer();
  const lock = useRef(false); // TODO can be removed if we solve double render from provider

  const scope: ExecutionScope | undefined = state.pages[pageSlug]?.scopes[notebookSlug];

  useEffect(() => {
    if (!core || !server || scope?.session || lock.current) return;
    lock.current = true;
    console.debug(`Jupyter: Starting session for ${pageSlug}-${notebookSlug} at ${location}`);
    if (location === undefined) {
      console.warn(
        'Article/Notebook json is missing the location field, this maybe break notebook execution when located outside of the root folder',
      );
    }

    server.listRunningSessions().then((sessions) => {
      console.debug('Jupyter: running sessions', sessions);

      // the location gives us the correct path for the notebook including it's filename
      // we need to replace the filename with one based on the page slug and notebook slug
      // in order to allow for multiple independent sessions of the same notebook
      let path = `/${pageSlug}-${notebookSlug}.ipynb`;
      console.debug('session starter path:', path);
      const match = location?.match(/(.*)\/.*.ipynb$/) ?? null;
      if (match) {
        console.debug('session starter match:', match);
        path = `${match[1]}/${pageSlug}-${notebookSlug}.ipynb`;
        console.debug('session starter path (modified):', path);
      }

      const existing = sessions.find((s) => s.path === path);

      if (existing) {
        console.debug(`session already exists for ${path}`, existing);
        server.connectToExistingSession(existing, scope.rendermime).then((sesh) => {
          if (sesh == null) {
            console.error(`Could not connect to session for ${path}`);
            return;
          }
          console.debug(`reconnected to session for ${path}`, sesh);
          console.debug('restarting session', sesh);
          sesh.kernel?.restart().then(() => {
            const notebook = selectNotebookForPage(state, pageSlug, notebookSlug);
            notebook.attachSession(sesh);
            dispatch({ type: 'ADD_SESSION', payload: { pageSlug, notebookSlug, session: sesh } });
          });
        });
      } else {
        server
          .startNewSession(scope.rendermime, {
            ...config?.kernels,
            path,
          })
          .then((sesh) => {
            if (sesh == null) {
              server?.getKernelSpecs().then((specs) => {
                console.error(`Could not start session for ${path}`);
                console.debug(`Available kernels: ${Object.keys(specs)}`);
              });
              return;
            }
            console.debug(`session started for ${path}`, sesh);
            const notebook = selectNotebookForPage(state, pageSlug, notebookSlug);
            notebook.attachSession(sesh);
            dispatch({ type: 'ADD_SESSION', payload: { pageSlug, notebookSlug, session: sesh } });
          });
      }
    });
  }, [core, config, scope, pageSlug, notebookSlug, lock]);

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
