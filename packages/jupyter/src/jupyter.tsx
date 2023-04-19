import React, { useEffect, useState } from 'react';
import type { IOutput } from '@jupyterlab/nbformat';
import { useFetchAnyTruncatedContent } from './hooks';
import type { MinifiedOutput } from 'nbtx';
import { convertToIOutputs } from 'nbtx';
import { fetchAndEncodeOutputImages } from './convertImages';
import { useThebeCore } from 'thebe-react';
import { useCellRefRegistry, useNotebookCellExecution, useCellRef } from '@myst-theme/providers';

function ActiveOutputRenderer({ id, data }: { id: string; data: IOutput[] }) {
  // TODO
  // having this as the only output renderer and having the dependency on these
  // two hooks means a NotebookProvider needs to be in the tree, perhaps we should
  // change that to render the ActiveOutput **only when** there  is a notebook renderer and
  // otherwise fall back to the PassiveRender method we has before
  const { el } = useCellRef(id);
  const { cell } = useNotebookCellExecution(id);
  useEffect(() => {
    if (!el || !cell) return;
    console.debug(`Attaching cell ${cell.id} to DOM at:`, { el, connected: el.isConnected });
    cell.attachToDOM(el);
    cell.render(data);
  }, [el, cell]);

  return null;
}

export const JupyterOutputs = ({ id, outputs }: { id: string; outputs: MinifiedOutput[] }) => {
  const { core, load } = useThebeCore();
  const { data, error } = useFetchAnyTruncatedContent(outputs);
  const [loaded, setLoaded] = useState(false);
  const [fullOutputs, setFullOutputs] = useState<IOutput[] | null>(null);
  const { register } = useCellRefRegistry();

  useEffect(() => {
    if (core) return;
    load();
  }, [core, load]);

  useEffect(() => {
    if (!data || loaded) return;
    setLoaded(true);
    fetchAndEncodeOutputImages(data).then((out) => {
      const compactOutputs = convertToIOutputs(out, {});
      setFullOutputs(compactOutputs);
    });
  }, [id, data]);

  if (error) {
    return <div className="text-red-500">Error rendering output: {error.message}</div>;
  }

  return (
    <div ref={register(id)} data-thebe-ref="true">
      {!fullOutputs && <div className="p-2.5">Loading...</div>}
      {fullOutputs && core && <ActiveOutputRenderer id={id} data={fullOutputs} />}
    </div>
  );
};
