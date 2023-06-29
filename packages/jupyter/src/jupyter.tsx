import React, { useEffect, useRef, useState } from 'react';
import type { IOutput } from '@jupyterlab/nbformat';
import { useFetchAnyTruncatedContent } from './hooks';
import type { MinifiedOutput } from 'nbtx';
import { convertToIOutputs } from 'nbtx';
import { fetchAndEncodeOutputImages } from './convertImages';
import type { ThebeCore } from 'thebe-core';
import { SourceFileKind } from 'myst-common';
import { useXRefState } from '@myst-theme/providers';
import { useThebeLoader } from 'thebe-react';
import { useCellExecution } from './execute';

function ActiveOutputRenderer({ id, data }: { id: string; data: IOutput[] }) {
  const exec = useCellExecution(id);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !exec?.cell) {
      console.debug(`No cell ref available for cell ${exec?.cell?.id}`);
      return;
    }
    if (exec.cell.isAttachedToDOM) {
      console.debug(`Cell ${exec.cell.id} already attached to DOM`);
      return;
    }
    console.debug(`Attaching cell ${exec.cell.id} to DOM at:`, {
      el: ref.current,
      connected: ref.current.isConnected,
      data,
    });
    exec.cell.attachToDOM(ref.current);
    exec.cell.render(data);
  }, [ref?.current, exec?.cell]);

  return (
    <div>
      <div>ACTIVE</div>
      <div ref={ref} data-thebe-active-ref="true" className="relative" />
    </div>
  );
}

function PassiveOutputRenderer({
  id,
  data,
  core,
  kind,
}: {
  id: string;
  data: IOutput[];
  core: ThebeCore;
  kind: SourceFileKind;
}) {
  const cell = useRef(new core.PassiveCellRenderer(id, undefined, undefined));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    cell.current.attachToDOM(ref.current, true);
    cell.current.render(data, kind === SourceFileKind.Article);
  }, [ref]);

  return <div ref={ref} data-thebe-passive-ref="true" />;
}

export const JupyterOutputs = React.memo(
  ({ id, outputs }: { id: string; outputs: MinifiedOutput[] }) => {
    const { core, load } = useThebeLoader();
    const { inCrossRef } = useXRefState();
    const { data, error } = useFetchAnyTruncatedContent(outputs);
    const [fullOutputs, setFullOutputs] = useState<IOutput[] | null>(null);
    // const exec = useNotebookCellExecution(id);
    const exec = useCellExecution(id);

    useEffect(() => {
      if (core) return;
      load();
    }, [core, load]);

    useEffect(() => {
      if (!data || fullOutputs != null) return;

      fetchAndEncodeOutputImages(data).then((out) => {
        const compactOutputs = convertToIOutputs(out, {});
        setFullOutputs(compactOutputs);
      });
    }, [id, data, fullOutputs]);

    if (error) {
      console.error(error);
      return <div className="text-red-500">Error rendering output: {error.message}</div>;
    }

    if (!inCrossRef && exec?.ready) {
      return (
        <div>
          {!fullOutputs && <div className="p-2.5">Loading...</div>}
          {fullOutputs && <ActiveOutputRenderer id={id} data={fullOutputs} />}
        </div>
      );
    }

    return (
      <div>
        {!fullOutputs && <div className="p-2.5">Loading...</div>}
        {fullOutputs && core && (
          <PassiveOutputRenderer
            id={id}
            data={fullOutputs}
            core={core}
            kind={SourceFileKind.Notebook}
          ></PassiveOutputRenderer>
        )}
      </div>
    );
  },
);
