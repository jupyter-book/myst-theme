import type { GenericParent } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import React, { useCallback, useContext, useRef, useState } from 'react';
import type {
  Config,
  IRenderMimeRegistry,
  IThebeCell,
  IThebeCellExecuteReturn,
  ThebeCore,
  ThebeNotebook,
} from 'thebe-core';
import type { IThebeNotebookError, NotebookExecuteOptions } from 'thebe-react';
import {
  useRenderMimeRegistry,
  useNotebookBase,
  useThebeConfig,
  useThebeCore,
  ThebeServerProvider,
} from 'thebe-react';
import type { Root } from 'mdast';
import { useSiteManifest } from '@myst-theme/providers';
import { thebeFrontmatterToOptions } from './utils';

export function useComputeOptions() {
  const config = useSiteManifest();
  const makeOptions = () => {
    if (!config) return { canCompute: false };
    // TODO there may be multiple projects?
    // useProjectManifest?
    const mainProject = config?.projects?.[0];
    const thebeFrontmatter = mainProject?.thebe;
    const githubBadgeUrl = mainProject?.github;
    const binderBadgeUrl = mainProject?.binder;
    const thebeOptions = thebeFrontmatterToOptions(
      thebeFrontmatter,
      githubBadgeUrl,
      binderBadgeUrl,
    );
    return {
      canCompute: thebeFrontmatter !== undefined && thebeFrontmatter !== false,
      thebe: thebeOptions,
      githubBadgeUrl,
      binderBadgeUrl,
    };
  };

  return React.useMemo(makeOptions, [config]);
}

export const ConfiguredThebeServerProvider = ({ children }: React.PropsWithChildren) => {
  const { thebe } = useComputeOptions();
  return (
    <ThebeServerProvider
      connect={false}
      options={thebe}
      useBinder={thebe?.useBinder}
      useJupyterLite={thebe?.useJupyterLite}
    >
      {children}
    </ThebeServerProvider>
  );
};

export type PartialPage = {
  kind: SourceFileKind;
  file: string;
  sha256: string;
  slug: string;
  mdast: Root;
};

export function notebookFromMdast(
  core: ThebeCore,
  config: Config,
  mdast: GenericParent,
  idkMap: Record<string, string>,
  rendermime: IRenderMimeRegistry,
) {
  const notebook = new core.ThebeNotebook(mdast.key, config, rendermime);

  // no metadata included in mdast yet
  //Object.assign(notebook.metadata, ipynb.metadata);
  notebook.cells = (mdast.children as GenericParent[]).map((block: GenericParent) => {
    if (block.type !== 'block') console.warn(`Unexpected block type ${block.type}`);
    if (block.children.length == 2 && block.children[0].type === 'code') {
      const [codeCell, output] = block.children;

      // use the block.key to identify the cell but maintain a mapping
      // to allow code or output keys to look up cells and refs
      idkMap[block.key] = block.key;
      idkMap[codeCell.key] = block.key;
      idkMap[output.key] = block.key;
      return new core.ThebeCell(
        block.key,
        notebook.id,
        codeCell.value ?? '',
        config,
        block.data ?? {},
        notebook.rendermime,
      );
    } else {
      // assume content - concatenate it
      // TODO inject cell metadata
      const cell = new core.ThebeNonExecutableCell(
        block.key,
        notebook.id,
        block.children.reduce((acc, child) => acc + '\n' + (child.value ?? ''), ''),
        block.data ?? {},
        notebook.rendermime,
      );
      return cell;
    }
  });

  return notebook;
}

// registry[cellId]
type CellRefRegistry = Record<string, HTMLDivElement>;
type IdKeyMap = Record<string, string>;

interface NotebookContextType {
  kind: SourceFileKind;
  ready: boolean;
  attached: boolean;
  executing: boolean;
  executed: boolean;
  errors: IThebeNotebookError[] | null;
  executeAll: (
    options?: NotebookExecuteOptions | undefined,
  ) => Promise<(IThebeCellExecuteReturn | null)[]>;
  executeSome: (
    predicate: (cell: IThebeCell) => boolean,
    options?: NotebookExecuteOptions | undefined,
  ) => Promise<(IThebeCellExecuteReturn | null)[]>;
  notebook: ThebeNotebook | undefined;
  registry: CellRefRegistry;
  idkMap: IdKeyMap;
  register: (id: string) => (el: HTMLDivElement) => void;
  restart: () => Promise<void>;
  loadNotebook: () => void;
  resetNotebook: () => void;
  clear: () => void;
}

const NotebookContext = React.createContext<NotebookContextType | undefined>(undefined);

export function NotebookProvider({
  page,
  children,
}: React.PropsWithChildren<{ siteConfig: boolean; page: PartialPage }>) {
  // so at some point this gets the whole site config and can
  // be use to lookup notebooks and recover ThebeNotebooks that
  // can be used to execute notebook pages or blocks in articles
  const { core } = useThebeCore();
  const { config } = useThebeConfig();
  const rendermime = useRenderMimeRegistry();

  const {
    ready,
    attached,
    executing,
    executed,
    errors,
    executeAll,
    executeSome,
    clear,
    session,
    notebook,
    setNotebook,
  } = useNotebookBase();

  const registry = useRef<CellRefRegistry>({});
  const idkMap = useRef<IdKeyMap>({});

  const loadNotebook = () => {
    if (!core || !config) return;
    if (page.kind === SourceFileKind.Notebook) {
      const nb = notebookFromMdast(
        core,
        config,
        page.mdast as GenericParent,
        idkMap.current,
        rendermime,
      );
      setNotebook(nb);
      console.debug('myst-theme:setNotebook', nb);
    }
  };

  function register(id: string) {
    return (el: HTMLDivElement) => {
      if (el != null && registry.current[idkMap.current[id]] !== el) {
        if (!el.isConnected) {
          console.debug(`'myst-theme: skipping ref for cell ${id} as host is not connected`);
        } else {
          console.debug(
            `'myst-theme: new ref for cell ${id} registered ${JSON.stringify(
              idkMap.current,
              null,
              2,
            )}`,
          );
          registry.current[idkMap.current[id]] = el;
        }
      }
    };
  }

  return (
    <NotebookContext.Provider
      value={{
        kind: page.kind,
        ready,
        attached,
        executing,
        executed,
        errors,
        executeAll,
        executeSome,
        notebook,
        registry: registry.current,
        idkMap: idkMap.current,
        register,
        restart: () => session?.restart() ?? Promise.resolve(),
        loadNotebook,
        resetNotebook: () => setNotebook(undefined),
        clear,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}

export function useNotebookLoader() {
  const notebookState = useContext(NotebookContext);
  if (notebookState === undefined) return undefined;

  const { ready, loadNotebook, resetNotebook } = notebookState;

  return { ready, loadNotebook, resetNotebook };
}

export function useHasNotebookProvider() {
  const notebookState = useContext(NotebookContext);
  return notebookState !== undefined;
}

export function useCellRefRegistry() {
  const notebookState = useContext(NotebookContext);
  if (notebookState === undefined) return undefined;
  return { register: notebookState.register };
}

export function useCellRef(id: string) {
  const notebookState = useContext(NotebookContext);
  if (notebookState === undefined) return undefined;

  const { registry, idkMap } = notebookState;
  const entry = Object.entries(notebookState.registry).find(([cellId]) => cellId === idkMap[id]);
  console.debug('useCellRef', { id, registry, idkMap, entry });
  return { el: entry?.[1] ?? null };
}

export function useMDASTNotebook() {
  const notebookState = useContext(NotebookContext);
  return notebookState;
}

export function useNotebookExecution() {
  const notebookState = useContext(NotebookContext);
  if (!notebookState) return undefined;

  const { ready, attached, executing, executed, errors, executeAll, notebook, clear } =
    notebookState;

  return { ready, attached, executing, executed, errors, execute: executeAll, notebook, clear };
}

export function useNotebookCellExecution(id: string) {
  // setup a cell only executing state
  const [executing, setExecuting] = useState(false);

  const notebookState = useContext(NotebookContext);
  if (!notebookState) return undefined;

  const {
    kind,
    ready,
    notebook,
    executing: notebookIsExecuting,
    executeSome,
    idkMap,
  } = notebookState;

  const cellId = idkMap[id];
  async function execute(options?: NotebookExecuteOptions) {
    setExecuting(true);
    const execReturn = await executeSome((cell) => cell.id === cellId, options);
    setExecuting(false);
    return execReturn;
  }
  const cell = notebook?.getCellById(cellId);
  return {
    kind,
    ready,
    cell,
    executing,
    notebookIsExecuting,
    execute,
    clear: () => cell?.clear(),
    notebook,
  };
}
