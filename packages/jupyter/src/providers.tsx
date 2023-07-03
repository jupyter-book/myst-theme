import type { SourceFileKind } from 'myst-common';
import React from 'react';
import { ThebeServerProvider } from 'thebe-react';
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

export function ConfiguredThebeServerProvider({ children }: React.PropsWithChildren) {
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
}

export type PartialPage = {
  kind: SourceFileKind;
  file: string;
  sha256: string;
  slug: string;
  mdast: Root;
};

// export function deprecated__notebookFromMdast(
//   core: ThebeCore,
//   config: Config,
//   mdast: GenericParent,
//   idkMap: Record<string, string>,
//   rendermime: IRenderMimeRegistry,
// ) {
//   const notebook = new core.ThebeNotebook(mdast.key, config, rendermime);

//   // no metadata included in mdast yet
//   // Object.assign(notebook.metadata, ipynb.metadata);
//   notebook.cells = (mdast.children as GenericParent[]).map((block: GenericParent) => {
//     if (block.type !== 'block') console.warn(`Unexpected block type ${block.type}`);
//     if (block.children && block.children.length == 2 && block.children[0].type === 'code') {
//       const [codeCell, output] = block.children;

//       // use the block.key to identify the cell but maintain a mapping
//       // to allow code or output keys to look up cells and refs
//       idkMap[block.key] = block.key;
//       idkMap[codeCell.key] = block.key;
//       idkMap[output.key] = block.key;
//       return new core.ThebeCell(
//         block.key,
//         notebook.id,
//         codeCell.value ?? '',
//         config,
//         block.data ?? {},
//         notebook.rendermime,
//       );
//     } else {
//       // assume content - concatenate it
//       // TODO inject cell metadata
//       const cell = new core.ThebeNonExecutableCell(
//         block.key,
//         notebook.id,
//         block.children?.reduce((acc, child) => acc + '\n' + (child.value ?? ''), '') ?? '',
//         block.data ?? {},
//         notebook.rendermime,
//       );
//       return cell;
//     }
//   });

//   return notebook;
// }

// type IdKeyMap = Record<string, string>;

// interface NotebookContextType {
//   kind: SourceFileKind;
//   ready: boolean;
//   attached: boolean;
//   executing: boolean;
//   executed: boolean;
//   errors: IThebeNotebookError[] | null;
//   executeAll: (
//     options?: NotebookExecuteOptions | undefined,
//   ) => Promise<(IThebeCellExecuteReturn | null)[]>;
//   executeSome: (
//     predicate: (cell: IThebeCell) => boolean,
//     options?: NotebookExecuteOptions | undefined,
//   ) => Promise<(IThebeCellExecuteReturn | null)[]>;
//   notebook: ThebeNotebook | undefined;
//   idkMap: IdKeyMap;
//   restart: () => Promise<void>;
//   clear: () => void;
// }

// const NotebookContext = React.createContext<NotebookContextType | undefined>(undefined);

// export function NotebookProvider({
//   siteConfig,
//   page,
//   children,
// }: React.PropsWithChildren<{ siteConfig: boolean; page: PartialPage }>) {
//   // so at some point this gets the whole site config and can
//   // be use to lookup notebooks and recover ThebeNotebooks that
//   // can be used to execute notebook pages or blocks in articles
//   const { core } = useThebeLoader();
//   const { config } = useThebeConfig();
//   const rendermime = useRenderMimeRegistry();

//   const {
//     ready,
//     attached,
//     executing,
//     executed,
//     errors,
//     executeAll,
//     executeSome,
//     clear,
//     session,
//     notebook,
//     setNotebook,
//   } = useNotebookBase();

//   const idkMap = useRef<IdKeyMap>({});

//   useEffect(() => {
//     if (!core || !config) return;
//     idkMap.current = {};
//     if (page.kind === SourceFileKind.Notebook) {
//       const nb = deprecated__notebookFromMdast(
//         core,
//         config,
//         page.mdast as GenericParent,
//         idkMap.current,
//         rendermime,
//       );
//       setNotebook(nb);
//     } else {
//       // TODO will need do article relative notebook loading as appropriate once that is supported
//       setNotebook(undefined);
//     }
//   }, [core, config, page]);

//   return (
//     <NotebookContext.Provider
//       value={{
//         kind: page.kind,
//         ready,
//         attached,
//         executing,
//         executed,
//         errors,
//         executeAll,
//         executeSome,
//         notebook,
//         idkMap: idkMap.current,
//         restart: () => session?.restart() ?? Promise.resolve(),
//         clear,
//       }}
//     >
//       {children}
//     </NotebookContext.Provider>
//   );
// }

// export function useHasNotebookProvider() {
//   const notebookState = useContext(NotebookContext);
//   return notebookState !== undefined;
// }

// export function useMDASTNotebook() {
//   const notebookState = useContext(NotebookContext);
//   return notebookState;
// }

// export function useNotebookExecution() {
//   const notebookState = useContext(NotebookContext);
//   if (!notebookState) return undefined;

//   const { ready, attached, executing, executed, errors, executeAll, notebook, clear } =
//     notebookState;

//   return { ready, attached, executing, executed, errors, execute: executeAll, notebook, clear };
// }

// export function deprecated__useReadyToExecute() {
//   const notebookState = useContext(NotebookContext);
//   return notebookState?.ready ?? false;
// }

// export function useNotebookCellExecution(id: string) {
//   // setup a cell only executing state
//   const [executing, setExecuting] = useState(false);

//   const notebookState = useContext(NotebookContext);
//   if (!notebookState) return undefined;

//   const {
//     kind,
//     ready,
//     notebook,
//     executing: notebookIsExecuting,
//     executeSome,
//     idkMap,
//   } = notebookState;

//   const cellId = idkMap[id];
//   async function execute(options?: NotebookExecuteOptions) {
//     setExecuting(true);
//     const execReturn = await executeSome((cell) => cell.id === cellId, options);
//     setExecuting(false);
//     return execReturn;
//   }
//   const cell = notebook?.getCellById(cellId);
//   return notebook
//     ? {
//         kind,
//         ready,
//         cell,
//         executing,
//         notebookIsExecuting,
//         execute,
//         clear: () => cell?.clear(),
//         notebook,
//       }
//     : undefined;
// }
