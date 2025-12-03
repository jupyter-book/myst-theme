import React, { useEffect, useState } from 'react';
import type { IOutput } from '@jupyterlab/nbformat';
import { useFetchAnyTruncatedContent } from './hooks.js';
import type { MinifiedOutput } from 'nbtx';
import { convertToIOutputs } from 'nbtx';
import { fetchAndEncodeOutputImages } from './convertImages.js';
import { SourceFileKind } from 'myst-spec-ext';
import { useThebeLoader } from 'thebe-react';
import { PassiveOutputRenderer } from './passive.js';

/**
 * Render a single output as a Jupyter output.
 *
 * @param id - The id of the cell.
 * @param output - The output data.
 */
export const JupyterOutput = React.memo(
  ({ outputsId, output }: { outputsId: string; output: MinifiedOutput }) => {
    const { core, load } = useThebeLoader();
    const { data, error } = useFetchAnyTruncatedContent([output]);
    const [fullOutput, setFullOutput] = useState<IOutput | null>(null);

    useEffect(() => {
      if (core) return;
      load();
    }, [core, load]);

    useEffect(() => {
      if (!data || fullOutput != null) return;

      fetchAndEncodeOutputImages(data).then((out) => {
        const compactOutputs = convertToIOutputs(out, {});
        setFullOutput(compactOutputs[0]);
      });
    }, [outputsId, data, fullOutput]);

    if (error) {
      console.error(error);
      return <div className="text-red-500">Error rendering output: {error.message}</div>;
    }

    // if (!inCrossRef && exec?.ready) {
    //   return (
    //     <div>
    //       {!fullOutputs && <div className="p-2.5">Fetching full output data...</div>}
    //       {core && fullOutputs && (
    //         <ActiveOutputRenderer key={id} id={id} initialData={fullOutputs} core={core} />
    //       )}
    //     </div>
    //   );
    // }

    return (
      <div>
        {!fullOutput && <div className="p-2.5">Loading...</div>}
        {fullOutput && core && (
          <PassiveOutputRenderer
            id={outputsId}
            data={fullOutput}
            core={core}
            kind={SourceFileKind.Notebook}
          ></PassiveOutputRenderer>
        )}
      </div>
    );
  },
);
