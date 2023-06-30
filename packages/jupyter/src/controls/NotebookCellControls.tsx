import { useCellExecution } from '../execute/hooks';
import { Clear, Run } from './Buttons';

export function NotebookRunCell({ id }: { id: string }) {
  const { ready, cellIsBusy, notebookIsBusy, execute } = useCellExecution(id);
  if (!ready) return null;
  return <Run ready={ready} executing={cellIsBusy} disabled={notebookIsBusy} onClick={execute} />;
}

export function NotebookRunCellSpinnerOnly({ id }: { id: string }) {
  const { ready, cellIsBusy } = useCellExecution(id);
  if (!ready || !cellIsBusy) return null;
  return (
    <Run
      ready={ready}
      executing={cellIsBusy}
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
