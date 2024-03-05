import React, { useEffect, useRef, useState } from 'react';
import type { IOutput } from '@jupyterlab/nbformat';
import { useFetchAnyTruncatedContent } from './hooks.js';
import type { MinifiedOutput } from 'nbtx';
import { convertToIOutputs } from 'nbtx';
import { fetchAndEncodeOutputImages } from './convertImages.js';
import type { ThebeCore } from 'thebe-core';
import { SourceFileKind } from 'myst-spec-ext';
import { useXRefState } from '@myst-theme/providers';
import { useThebeLoader } from 'thebe-react';
import { useCellExecution } from './execute/index.js';
import { usePlaceholder } from './decoration.js';
import { MyST } from 'myst-to-react';
import classNames from 'classnames';
import { usePlotlyPassively } from './plotly.js';

function ActiveOutputRenderer({
  id,
  initialData,
  core,
}: {
  id: string;
  initialData: IOutput[];
  core: ThebeCore;
}) {
  const exec = useCellExecution(id);
  const placeholder = usePlaceholder();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !exec?.cell) {
      console.debug(`Jupyter: No cell ref available for cell ${id}:${exec?.cell?.id}`);
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
    `Jupyter: Cell ${id} executed: ${executed}; Show output: ${executed || !placeholder}`,
  );

  return (
    <div>
      <div
        ref={ref}
        data-thebe-active-ref="true"
        className={classNames('relative', { 'invisible h-0': !executed && placeholder })}
      />
      {placeholder && !executed && <MyST ast={placeholder} />}
    </div>
  );
}

function PassiveOutputRenderer({
  id,
  data,
  core,
}: {
  id: string;
  data: IOutput[];
  core: ThebeCore;
  kind: SourceFileKind;
}) {
  const rendermime = core.makeRenderMimeRegistry();

  const cell = useRef(new core.PassiveCellRenderer(id, rendermime, undefined));
  const ref = useRef<HTMLDivElement>(null);

  const { loaded } = usePlotlyPassively(rendermime, data);

  useEffect(() => {
    if (!ref.current || !loaded) return;
    // eslint-disable-next-line import/no-extraneous-dependencies
    cell.current.attachToDOM(ref.current ?? undefined, true);
    cell.current.render(core?.stripWidgets(data) ?? data);
  }, [ref, loaded]);

  return <div ref={ref} data-thebe-passive-ref="true" />;
}

export const JupyterOutputs = React.memo(
  ({ id, outputs }: { id: string; outputs: MinifiedOutput[] }) => {
    const { core, load } = useThebeLoader();
    const { inCrossRef } = useXRefState();
    const { data, error } = useFetchAnyTruncatedContent(outputs);
    const [fullOutputs, setFullOutputs] = useState<IOutput[] | null>(null);
    const exec = useCellExecution(id);
    const placeholder = usePlaceholder();

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
          {!fullOutputs && <div className="p-2.5">Fetching full output data...</div>}
          {core && fullOutputs && (
            <ActiveOutputRenderer key={id} id={id} initialData={fullOutputs} core={core} />
          )}
        </div>
      );
    }

    if (placeholder) {
      return <MyST ast={placeholder} />;
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
