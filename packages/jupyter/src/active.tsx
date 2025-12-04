import { useEffect, useRef, useState } from 'react';
import type { IOutput } from '@jupyterlab/nbformat';
import type { ThebeCore } from 'thebe-core';
import { useCellExecution } from './execute/index.js';
import { usePlaceholder } from './decoration.js';
import { MyST } from 'myst-to-react';
import classNames from 'classnames';
import { convertToIOutputs, type MinifiedOutput } from 'nbtx';
import { useThebeLoader } from 'thebe-react';
import { useFetchAnyTruncatedContent } from './hooks.js';
import { useXRefState } from '@myst-theme/providers';
import { fetchAndEncodeOutputImages } from './convertImages.js';

export function ActiveOutputRenderer({
  outputsId,
  initialData,
  core,
}: {
  outputsId: string;
  initialData: IOutput[];
  core: ThebeCore;
}) {
  const exec = useCellExecution(outputsId);
  const placeholder = usePlaceholder();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !exec?.cell) {
      console.debug(`Jupyter: No cell ref available for cell ${outputsId}:${exec?.cell?.id}`);
      return;
    }

    const verb = exec.cell.isAttachedToDOM ? 'reattaching' : 'attaching';
    console.debug(`${verb} cell ${exec.cell.id} to DOM at:`, {
      el: ref.current,
      connected: ref.current.isConnected,
      data: core?.stripWidgets(initialData) ?? initialData,
    });

    exec.cell.attachToDOM(ref.current);

    if (exec.cell.executionCount == null) {
      exec.cell.initOutputs(
        core?.stripWidgets(initialData, true, placeholder ? () => '' : undefined) ?? initialData,
      );
    }
  }, [ref?.current, exec?.cell]);

  const executed = exec?.cell?.executionCount != null;
  console.debug(
    `Jupyter: Cell ${outputsId} executed: ${executed}; Show output: ${executed || !placeholder}`,
  );

  return (
    <div>
      <div
        ref={ref}
        data-thebe-active-ref="true"
        className={classNames('relative', { 'invisible h-0': !executed && placeholder })}
      />
      {exec.ready && placeholder && !executed && <MyST ast={placeholder} />}
    </div>
  );
}

export function ActiveJupyterCellOutputs({
  outputsId,
  outputs,
}: {
  outputsId: string;
  outputs: MinifiedOutput[];
}) {
  const { core, load } = useThebeLoader();
  const { inCrossRef } = useXRefState();
  const exec = useCellExecution(outputsId);
  // NOTE: could maybe lift this into the outputs renderer,  from here and the passive renderer
  // but the images will be cached anywways, so there is limited benefit
  const { data, error } = useFetchAnyTruncatedContent(outputs);
  const [fullOutputs, setFullOutputs] = useState<IOutput[] | null>(null);

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
  }, [outputsId, data, fullOutputs]);

  if (error) {
    console.error(error);
    return <div className="text-red-500">Error rendering output: {error.message}</div>;
  }

  if (!inCrossRef && exec?.ready) {
    return (
      <div>
        {!fullOutputs && <div className="p-2.5">Fetching full output data...</div>}
        {core && fullOutputs && (
          <ActiveOutputRenderer
            key={outputsId}
            outputsId={outputsId}
            initialData={fullOutputs}
            core={core}
          />
        )}
      </div>
    );
  }

  return <div>ActiveJupyterCellOutputs in cross reference</div>;
}
