import React, { useContext, useEffect, useState } from 'react';
import type {
  Config,
  IThebeCell,
  IThebeCellExecuteReturn,
  ThebeNotebook,
  ThebeSession,
} from 'thebe-core';
// import type { IThebeNotebookError, NotebookExecuteOptions, ThebeCore } from 'thebe-react';
// import { useThebeCore, useThebeConfig, useNotebookBase } from 'thebe-react';
// import type { GenericParent } from 'myst-common';

// export enum KINDS {
//   Article = 'Article',
//   Notebook = 'Notebook',
// }

// function notebookFromMdast(core: ThebeCore, config: Config, mdast: GenericParent): ThebeNotebook {
//   const rendermime = undefined; // share rendermime beyond notebook scope?
//   const notebook = new core.ThebeNotebook(core.shortId(), config, rendermime);

//   // no metadata included in mdast yet
//   //Object.assign(notebook.metadata, ipynb.metadata);

//   notebook.cells = (mdast.children as GenericParent[]).map((block: GenericParent) => {
//     if (block.type !== 'block') console.warn(`Unexpected block type ${block.type}`);
//     if (block.children.length > 0 && block.children[0].type === 'code') {
//       const codeCell = block.children[0];
//       return new core.ThebeCell(core.shortId(), notebook.id, codeCell.value ?? '', config);
//     } else {
//       // assume content - concatenate it
//       return new core.ThebeNonExecutableCell(
//         core.shortId(),
//         notebook.id,
//         block.children.reduce((acc, child) => acc + '\n' + (child.value ?? ''), ''),
//       );
//     }
//   });

//   return notebook;
// }

// function useNotebookFromMDAST(mdast?: GenericParent) {
//   const { core } = useThebeCore();
//   const { config } = useThebeConfig();
//   const [loading, setLoading] = useState<boolean>(false);

//   console.log('useNotebookFromMDAST');

//   const {
//     ready,
//     attached,
//     executing,
//     executed,
//     errors,
//     notebook,
//     setNotebook,
//     refs,
//     setRefs,
//     executeAll,
//     executeSome,
//     clear,
//     session,
//   } = useNotebookBase();

//   /**
//    * - set loading flag
//    * - load the notebook
//    * - setup callback refs, to auto-attach to dom
//    * - set notebook, which triggers
//    * - clear loading flag
//    */
//   useEffect(() => {
//     if (!core || !config || !mdast) return;
//     setLoading(true);

//     const nb = notebookFromMdast(core, config, mdast);

//     // generating refs for all cells - this seems a bit wasteful but then
//     // we maintain a 1:1 block:cell mapping which will make things easier
//     setRefs(
//       Array(nb.cells.length)
//         .fill(null)
//         .map((_, idx) => (node) => {
//           console.debug(`new ref[${idx}] - attaching to dom...`, node);
//           if (node != null) nb.cells[idx].attachToDOM(node);
//         }),
//     );
//     setNotebook(nb);
//     setLoading(false);
//   }, [core, config, mdast]);

//   return {
//     ready,
//     loading,
//     attached,
//     executing,
//     executed,
//     errors,
//     notebook,
//     cellRefs: refs,
//     cellIds: (notebook?.cells ?? []).map((c) => c.id),
//     executeAll,
//     executeSome,
//     clear,
//     session,
//   };
// }

// export interface MDASTNotebookContextType {
//   loading: boolean;
//   ready: boolean;
//   attached: boolean;
//   executing: boolean;
//   executed: boolean;
//   errors: IThebeNotebookError[] | null;
//   notebook: ThebeNotebook | undefined;
//   executeAll: (
//     options?: NotebookExecuteOptions | undefined,
//   ) => Promise<(IThebeCellExecuteReturn | null)[]>;
//   executeSome: (
//     predicate: (cell: IThebeCell) => boolean,
//     options?: NotebookExecuteOptions | undefined,
//   ) => Promise<(IThebeCellExecuteReturn | null)[]>;
//   clear: () => void;
//   session: ThebeSession | undefined;
//   cellRefs: ((node: HTMLDivElement) => void)[];
//   cellIds: string[];
// }

// // export const MDASTNotebookContext = React.createContext<MDASTNotebookContextType>({
// //   loading: false,
// //   ready: false,
// //   attached: false,
// //   executing: false,
// //   executed: false,
// //   errors: null,
// //   notebook: undefined,
// //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
// //   executeAll: (options?: NotebookExecuteOptions | undefined) => Promise.resolve([]),
// //   executeSome: (
// //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
// //     predicate: (cell: IThebeCell) => boolean,
// //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
// //     options?: NotebookExecuteOptions | undefined,
// //   ) => Promise.resolve([]),
// //   clear: () => ({}),
// //   session: undefined,
// //   cellRefs: [],
// //   cellIds: [],
// // });

// const MDASTNotebookContext = React.createContext<
//   { cellIds: string[]; cellRefs: ((e: any) => void)[] } | undefined
// >(undefined);

// export function MDASTNotebookProvider({
//   kind,
//   mdast,
//   children,
// }: React.PropsWithChildren<{ kind: KINDS; mdast: GenericParent }>) {
//   const [state, setState] = useState<
//     { cellIds: string[]; cellRefs: ((e: any) => void)[] } | undefined
//   >(undefined);
//   // const bundle = useNotebookFromMDAST(kind === KINDS.Notebook ? mdast : undefined);

//   useEffect(() => {
//     setTimeout(() => {
//       console.log('TIMEOUT');
//       setState({ cellIds: ['A', 'B'], cellRefs: [() => ({}), () => ({})] });
//     }, 5000);
//   }, []);

//   // console.log('MDASTNotebookProvider 1', { kind, bundle });
//   console.log({ state });
//   return (
//     <MDASTNotebookContext.Provider value={state ?? { cellIds: [], cellRefs: [] }}>
//       {children}
//     </MDASTNotebookContext.Provider>
//   );
// }

// export function useMDASTNotebook() {
//   const notebookContext = useContext(MDASTNotebookContext);
//   console.log('useMDASTNotebook', { notebookContext });
//   // if (notebookContext === undefined) {
//   //   throw new Error('hook not inside provider');
//   // }
//   return notebookContext ?? { cellIds: [], cellRefs: [] };
// }
