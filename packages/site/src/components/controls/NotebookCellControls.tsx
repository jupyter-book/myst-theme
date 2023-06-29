import { useCellExecution } from '@myst-theme/jupyter';
import { Clear, Run } from './Buttons';

export function RunNotebookCell({ id }: { id: string }) {
  const { ready, isBusy, anyBusy, execute } = useCellExecution(id);
  if (!ready) return null;
  return <Run ready={ready} executing={isBusy} disabled={anyBusy} onClick={execute} />;
}

export function RunNotebookCellSpinnerOnly({ id }: { id: string }) {
  const { ready, isBusy } = useCellExecution(id);
  if (!ready || !isBusy) return null;
  return <Run ready={ready} executing={isBusy} disabled={true} onClick={() => ({})} />;
}

export function ClearNotebookCell({ id }: { id: string }) {
  const { ready, anyBusy, clear } = useCellExecution(id);
  if (!ready) return null;
  return <Clear ready={ready} disabled={anyBusy} onClick={clear} />;
}
