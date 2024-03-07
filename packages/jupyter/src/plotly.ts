import { useEffect, useState } from 'react';
import type { IRenderMime, IRenderMimeRegistry } from '@jupyterlab/rendermime';
import type { IOutput } from '@jupyterlab/nbformat';

export function useLoadPlotly() {
  const [plotly, setPlotly] = useState<
    { rendererFactory: IRenderMime.IRendererFactory } | undefined
  >();

  useEffect(() => {
    if (plotly) return;
    // eslint-disable-next-line import/no-extraneous-dependencies
    import('jupyterlab-plotly/lib/plotly-renderer.js').then(
      (module: { rendererFactory: IRenderMime.IRendererFactory }) => {
        console.debug('Jupyter: Adding plotly renderer factory to rendermime registry', {
          module,
        });
        setPlotly(module);
      },
    );
  }, [plotly]);

  return { plotly };
}

const PLOTLY_MIMETYPE = 'application/vnd.plotly.v1+json';

export function isPlotly(outputs: IOutput[]) {
  return outputs.some((output) => Object.keys(output.data ?? []).includes(PLOTLY_MIMETYPE));
}

export function usePlotlyPassively(rendermime: IRenderMimeRegistry, outputs: IOutput[]) {
  const isPlotlyOutput = isPlotly(outputs);
  // skip loading for non plotly outputs
  const [loaded, setLoaded] = useState(!isPlotlyOutput);

  useEffect(() => {
    if (loaded || !isPlotlyOutput) return;
    // eslint-disable-next-line import/no-extraneous-dependencies
    import('jupyterlab-plotly/lib/plotly-renderer.js').then(
      (module: { rendererFactory: IRenderMime.IRendererFactory }) => {
        console.debug('Jupyter: Adding plotly renderer factory to rendermime registry', {
          module,
        });
        rendermime.addFactory(module.rendererFactory, 41);
        setLoaded(true);
      },
    );
  }, [loaded, isPlotlyOutput]);

  return { loaded };
}
