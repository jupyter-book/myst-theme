import React, { useEffect, useRef, useState } from 'react';
import type { IOutput } from '@jupyterlab/nbformat';
import { useFetchAnyTruncatedContent } from './hooks';
import type { MinifiedOutput } from 'nbtx';
import { convertToIOutputs } from 'nbtx';
import { fetchAndEncodeOutputImages } from './convertImages';
import type { ThebeCore } from 'thebe-react';
import { useThebeCore } from 'thebe-react';

function OutputRenderer({ id, data, core }: { id: string; data: IOutput[]; core: ThebeCore }) {
  const [cell] = useState(new core.PassiveCellRenderer(id));
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cell.render(data);
  }, [data, cell]);
  useEffect(() => {
    if (!ref.current) return;
    cell.attachToDOM(ref.current);
  }, [ref]);
  return <div ref={ref} />;
}

const MemoOutputRenderer = React.memo(OutputRenderer);

export const NativeJupyterOutputs = ({
  id,
  outputs,
}: {
  id: string;
  outputs: MinifiedOutput[];
}) => {
  const { core } = useThebeCore();
  const { data, error } = useFetchAnyTruncatedContent(outputs);
  const [loaded, setLoaded] = useState(false);
  const [fullOutputs, setFullOutputs] = useState<IOutput[] | null>(null);

  useEffect(() => {
    if (!data || loaded) return;
    setLoaded(true);
    fetchAndEncodeOutputImages(data).then((out) => {
      const compactOutputs = convertToIOutputs(out, {});
      setFullOutputs(compactOutputs);
    });
  }, [id, data]);

  if (error) {
    return <div className="text-red-500">Error rendering output: {error.message}</div>;
  }

  return (
    <div>
      {!fullOutputs && <div className="p-2.5">Loading...</div>}
      {fullOutputs && core && <MemoOutputRenderer id={id} core={core} data={fullOutputs} />}
    </div>
  );
};
