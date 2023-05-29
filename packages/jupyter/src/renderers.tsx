import React, { useEffect, useRef, useState } from 'react';
import type { IOutput } from '@jupyterlab/nbformat';
import { useFetchAnyTruncatedContent } from './hooks';
import type { MinifiedOutput } from 'nbtx';
import { convertToIOutputs } from 'nbtx';
import { fetchAndEncodeOutputImages } from './convertImages';
import type { ThebeCore } from 'thebe-core';
import { useThebeCore } from 'thebe-react';
import { useCellRef, useCellRefRegistry, useNotebookCellExecution } from './providers';
import { SourceFileKind } from 'myst-common';
import { useXRefState } from '@myst-theme/providers';

export function ActiveOutputRenderer({ id, data }: { id: string; data: IOutput[] }) {
  const ref = useCellRef(id);
  const exec = useNotebookCellExecution(id);

  useEffect(() => {
    if (!ref?.el || !exec?.cell) {
      console.debug(`No cell ref available for cell ${exec?.cell?.id}`);
      return;
    }
    console.debug(`Attaching cell ${exec.cell.id} to DOM at:`, {
      el: ref.el,
      connected: ref.el.isConnected,
      data,
    });
    exec.cell.attachToDOM(ref.el);
    exec.cell.render(data);
  }, [ref?.el, exec?.cell]);

  return null;
}

function PassiveOutputRendererFn({
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
  const [cell] = useState(new core.PassiveCellRenderer(id, undefined, undefined));
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cell.render(data, kind === SourceFileKind.Article);
  }, [data, cell]);
  useEffect(() => {
    if (!ref.current) return;
    cell.attachToDOM(ref.current, true);
  }, [ref]);
  return <div ref={ref} data-thebe-passive-ref="true" />;
}

export const PassiveOutputRenderer = React.memo(PassiveOutputRendererFn);
