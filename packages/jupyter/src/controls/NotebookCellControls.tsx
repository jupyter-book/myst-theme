import { useCellExecution } from '../execute/hooks.js';
import { Clear, Run } from './Buttons.js';

export function NotebookRunCell({ id }: { id: string }) {
  const { ready, cellIsExecuting, notebookIsBusy, execute } = useCellExecution(id);
  if (!ready) return null;
  return (
    <Run ready={ready} executing={cellIsExecuting} disabled={notebookIsBusy} onClick={execute} />
  );
}

export function NotebookRunCellSpinnerOnly({ id }: { id: string }) {
  const { ready, cellIsExecuting } = useCellExecution(id);
  if (!ready || !cellIsExecuting) return null;
  return (
    <Run
      ready={ready}
      executing={cellIsExecuting}
      disabled={true}
      onClick={() => ({})}
      title="executing cell..."
    />
  );
}

export function NotebookClearCell({ id }: { id: string }) {
  const { ready, notebookIsBusy, clear } = useCellExecution(id);
  if (!ready) return null;
  return (
    <Clear ready={ready} disabled={notebookIsBusy} onClick={clear} title="Clear cell outputs" />
  );
}
