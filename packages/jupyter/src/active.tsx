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
import { stampScrollableA11y } from './passive.js';

/**
 * Attaches a live thebe kernel cell to the DOM so outputs update on re-execution.
 * Used when thebe compute is "ready" (a kernel is connected). The passive
 * counterpart, `PassiveOutputRenderer`, renders a fresh MIME bundle into a
 * disposable cell instead.
 */
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
    if (!ref.current || !exec?.cell) return;

    exec.cell.attachToDOM(ref.current);

    if (exec.cell.executionCount == null) {
      exec.cell.initOutputs(
        core?.stripWidgets(initialData, true, placeholder ? () => '' : undefined) ?? initialData,
      );
    }

    // Stamp a11y attributes on overflowing outputs. Use a MutationObserver
    // because renderers (e.g. Plotly) insert content asynchronously, and
    // re-execution swaps the output DOM out from under us.
    stampScrollableA11y(ref.current);
    const observer = new MutationObserver(() => stampScrollableA11y(ref.current));
    observer.observe(ref.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [exec?.cell]);

  const executed = exec?.cell?.executionCount != null;

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
      <div data-name="active-outputs-container" className="not-prose mb-5">
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
