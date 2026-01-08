import { useEffect, useRef } from 'react';
import type { IOutput } from '@jupyterlab/nbformat';
import type { ThebeCore } from 'thebe-core';
import type { SourceFileKind } from 'myst-spec-ext';
import { usePlotlyPassively } from './plotly.js';

/**
 * Render a single output as a passive cell output.
 *
 * This is used for outputs that require jupyters rendermime support, such as Plotly.
 *
 * @param id - The id of the cell.
 * @param data - The output data.
 * @param core - The Thebe core.
 * @param kind - The kind of source file.
 */
export function PassiveOutputRenderer({
  id,
  data,
  core,
}: {
  id: string;
  data: IOutput;
  core: ThebeCore;
  kind: SourceFileKind;
}) {
  const rendermime = core.makeRenderMimeRegistry();

  const cell = useRef(new core.PassiveCellRenderer(id, rendermime, undefined));
  const ref = useRef<HTMLDivElement>(null);

  const { loaded } = usePlotlyPassively(rendermime, [data]);

  useEffect(() => {
    if (!ref.current || !loaded) return;
    // eslint-disable-next-line import/no-extraneous-dependencies
    cell.current.attachToDOM(ref.current ?? undefined, true);
    cell.current.render(core?.stripWidgets([data]) ?? data);
  }, [ref, loaded]);

  return <div ref={ref} className="not-prose" data-thebe-passive-ref="true" data-output-id={id} />;
}
