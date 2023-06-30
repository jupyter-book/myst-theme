import { useCellExecution } from '@myst-theme/jupyter';
import { Clear, Run } from './Buttons';

export function RunNotebookCell({ id }: { id: string }) {
  const { ready, cellIsBusy, notebookIsBusy, execute } = useCellExecution(id);
  if (!ready) return null;
  return <Run ready={ready} executing={cellIsBusy} disabled={notebookIsBusy} onClick={execute} />;
}

export function RunNotebookCellSpinnerOnly({ id }: { id: string }) {
  const { ready, cellIsBusy } = useCellExecution(id);
  if (!ready || !cellIsBusy) return null;
  return (
    <Run
      ready={ready}
      executing={cellIsBusy}
      disabled={true}
      onClick={() => ({})}
      title="Run this cell"
    />
  );
}

export function ClearNotebookCell({ id }: { id: string }) {
  const { ready, notebookIsBusy, clear } = useCellExecution(id);
  if (!ready) return null;
  return (
    <Clear ready={ready} disabled={notebookIsBusy} onClick={clear} title="Clear cell outputs" />
  );
}
