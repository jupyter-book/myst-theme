import React, { useEffect, useState } from 'react';
import type { IOutput } from '@jupyterlab/nbformat';
import { useFetchAnyTruncatedContent } from './hooks';
import type { MinifiedOutput } from 'nbtx';
import { convertToIOutputs } from 'nbtx';
import { fetchAndEncodeOutputImages } from './convertImages';
import { useThebeCore } from 'thebe-react';
import { useCellRefRegistry, useNotebookCellExecution } from './providers';
import { SourceFileKind } from 'myst-common';
import { ActiveOutputRenderer, PassiveOutputRenderer } from './renderers';
import { useXRefState } from '@myst-theme/providers';

export const JupyterOutputs = ({ id, outputs }: { id: string; outputs: MinifiedOutput[] }) => {
  const { core, load } = useThebeCore();
  const { inCrossRef } = useXRefState();
  const { data, error } = useFetchAnyTruncatedContent(outputs);
  const [loaded, setLoaded] = useState(false);
  const [fullOutputs, setFullOutputs] = useState<IOutput[] | null>(null);
  const registry = useCellRefRegistry();
  const exec = useNotebookCellExecution(id);

  useEffect(() => {
    if (core) return;
    load();
  }, [core, load]);

  useEffect(() => {
    if (!data || loaded || fullOutputs != null) return;
    setLoaded(true);
    fetchAndEncodeOutputImages(data).then((out) => {
      const compactOutputs = convertToIOutputs(out, {});
      setFullOutputs(compactOutputs);
    });
  }, [id, data, fullOutputs]);

  if (error) {
    return <div className="text-red-500">Error rendering output: {error.message}</div>;
  }

  if (!inCrossRef && registry && exec?.cell) {
    return (
      <div ref={registry?.register(id)} data-thebe-active-ref="true">
        {!fullOutputs && <div className="p-2.5">Loading...</div>}
        {fullOutputs && <ActiveOutputRenderer id={id} data={fullOutputs} />}
      </div>
    );
  }

  return (
    <>
      {!fullOutputs && <div className="p-2.5">Loading...</div>}
      {fullOutputs && core && (
        <PassiveOutputRenderer
          id={id}
          data={fullOutputs}
          core={core}
          kind={exec?.kind ?? SourceFileKind.Notebook}
        ></PassiveOutputRenderer>
      )}
    </>
  );
};
