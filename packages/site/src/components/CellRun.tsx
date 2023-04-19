import { useNotebookCellExecution } from '@myst-theme/jupyter';
import { Spinner } from './Spinner';

// export function CellRun({ id }: { id: string }) {
//   const { ready, executing, execute, clear } = useNotebookCellExecution(id);

//   if (!ready) return null;

//   return (
//     <div className="absolute bottom-0 w-full group flex space-x-1 my-1 justify-end">
//       <div className="inline-block relative text-sm">
//         <button
//           className="text-sm border border-1 cursor-pointer px-1 rounded border-orange-700 text-orange-700 opacity-80 hover:opacity-100"
//           disabled={executing}
//           onClick={() => execute()}
//         >
//           run
//         </button>
//         {executing && (
//           <span className="absolute top-0 left-0 translate-x-1/4 z-10 w-[22px] h-[22px]">
//             <Spinner size={22} />
//           </span>
//         )}
//       </div>
//       <button
//         className="text-sm border border-1 cursor-pointer px-1 rounded border-orange-700 text-orange-700 opacity-80 hover:opacity-100"
//         disabled={executing}
//         onClick={() => clear()}
//       >
//         clear
//       </button>
//     </div>
//   );
// }
