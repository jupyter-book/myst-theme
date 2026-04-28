import { useEffect, useRef } from 'react';
import type { IOutput } from '@jupyterlab/nbformat';
import type { ThebeCore } from 'thebe-core';
import type { SourceFileKind } from 'myst-spec-ext';
import { usePlotlyPassively } from './plotly.js';

/**
 * Mark each `.jp-OutputArea-output` descendant of `root` as keyboard-focusable
 * (tabIndex/role/aria-label) when its content overflows horizontally, so wide
 * outputs (tables, plots) are reachable via keyboard.
 */
export function stampScrollableA11y(root: HTMLElement | null) {
  root?.querySelectorAll<HTMLElement>('.jp-OutputArea-output').forEach((el) => {
    if (el.scrollWidth > el.clientWidth) {
      el.tabIndex = 0;
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', 'cell output');
    }
  });
}

/**
 * Render one output without a live kernel, using thebe-core's rendermime registry
 * to turn the MIME bundle into DOM.
 *
 * Used for outputs that browsers can't render directly
 * (e.g., pandas or plotly MIME types).
 *
 * With live thebe kernels, the counterpart is `ActiveOutputRenderer` in `active.tsx`.
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
    // Stamp a11y attributes on overflowing outputs. Use a MutationObserver
    // because some renderers (e.g. Plotly) insert their content asynchronously,
    // after cell.render() returns.
    stampScrollableA11y(ref.current);
    const observer = new MutationObserver(() => stampScrollableA11y(ref.current));
    observer.observe(ref.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ref, loaded]);

  return <div ref={ref} data-thebe-passive-ref="true" data-output-id={id} />;
}
