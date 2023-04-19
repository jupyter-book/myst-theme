import type { GenericParent } from 'myst-common';
import React, { useContext, useEffect, useRef, useState } from 'react';
import type {
  Config,
  IThebeCell,
  IThebeCellExecuteReturn,
  ThebeCore,
  ThebeNotebook,
} from 'thebe-core';
import type { IThebeNotebookError, NotebookExecuteOptions } from 'thebe-react';
import { useNotebookBase, useThebeConfig, useThebeCore } from 'thebe-react';
import type { PageLoader } from '../types';
import { KINDS } from '../types';

function notebookFromMdast(core: ThebeCore, config: Config, mdast: GenericParent): ThebeNotebook {
  const rendermime = undefined; // share rendermime beyond notebook scope?
  const notebook = new core.ThebeNotebook(mdast.key, config, rendermime);

  // no metadata included in mdast yet
  //Object.assign(notebook.metadata, ipynb.metadata);

  notebook.cells = (mdast.children as GenericParent[]).map((block: GenericParent) => {
    if (block.type !== 'block') console.warn(`Unexpected block type ${block.type}`);
    if (block.children.length > 0 && block.children[0].type === 'code') {
      const codeCell = block.children[0];
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

interface NotebookContextType {
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
  register: (id: string) => (el: HTMLDivElement) => void;
  restart: () => Promise<void>;
  clear: () => void;
}

const NotebookContext = React.createContext<NotebookContextType | undefined>(undefined);

export function NotebookProvider({
  siteConfig,
  page,
  children,
}: React.PropsWithChildren<{ siteConfig: boolean; page: PageLoader }>) {
  // so at some point this gets the whole site config and can
  // be use to lookup notebooks and recover ThebeNotebooks that
  // can be used to execute notebook pages or blocks in articles
  const { core } = useThebeCore();
  const { config } = useThebeConfig();

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

  const cellRefs = useRef<CellRefRegistry>({});

  useEffect(() => {
    if (!core || !config || notebook) return;
    if (page.kind !== KINDS.Notebook) return;
    const nb = notebookFromMdast(core, config, page.mdast as GenericParent);

    // this could be included in notebookFromMdast but keeping it separate to illustrate
    // how this could be handled in a separate hook from the actual notebook loading

    nb.cells.forEach((cell: IThebeCell) => {
      const item = Object.entries(cellRefs.current).find(([id]) => id === cell.id);
      if (item) {
        const [_, el] = item;
        console.debug(`Attached cell ${cell.id} to DOM at:`, { el, connected: el.isConnected });
        cell.attachToDOM(el);
      } else {
        console.debug(`No cell ref found for ${cell.id} or type ${typeof cell}`);
      }
    });

    setNotebook(nb);
  }, [core, config, page]);

  function register(id: string) {
    return (el: HTMLDivElement) => {
      if (el != null && cellRefs.current[id] !== el) {
        if (!el.isConnected) {
          console.debug(`skipping ref for cell ${id} as host is not connected`);
        } else {
          console.debug(`new ref for cell ${id} registered`);
          cellRefs.current[id] = el;
        }
      }
    };
  }

  return (
    <NotebookContext.Provider
      value={{
        ready,
        attached,
        executing,
        executed,
        errors,
        executeAll,
        executeSome,
        notebook,
        register,
        restart: () => session?.restart() ?? Promise.resolve(),
        clear,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}

export function useCellRefRegistry() {
  const notebookState = useContext(NotebookContext);
  if (notebookState === undefined) {
    throw new Error('useCellRefRegistry called outside of NotebookProvider');
  }
  return { register: notebookState.register };
}

export function useMDASTNotebook() {
  const notebookState = useContext(NotebookContext);

  if (notebookState === undefined) {
    throw new Error('useMDASTNotebook called outside of NotebookProvider');
  }

  return notebookState;
}

export function useNotebookCellExecution(id: string) {
  // setup a cell only executing state
  const [executing, setExecuting] = useState(false);
  const { ready, notebook, executeSome } = useMDASTNotebook();

  async function execute(options?: NotebookExecuteOptions) {
    setExecuting(true);
    const execReturn = await executeSome((cell) => cell.id === id, options);
    setExecuting(false);
    return execReturn;
  }
  const cell = notebook?.getCellById(id);
  return { ready, cell, executing, execute, clear: () => cell?.clear() };
}
