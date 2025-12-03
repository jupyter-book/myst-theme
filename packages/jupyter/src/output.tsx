import type { GenericNode } from 'myst-common';
import { KnownCellOutputMimeTypes } from 'nbtx';
import type { MinifiedMimeOutput, MinifiedOutput } from 'nbtx';
import classNames from 'classnames';
import { SafeOutputs } from './safe.js';
import { JupyterOutputs } from './jupyter.js';
import { useMemo } from 'react';
import { useCellExecution } from './execute/index.js';
import { usePlaceholder } from './decoration.js';
import { Details, MyST } from 'myst-to-react';
import { selectAll } from 'unist-util-select';
import { useOutputsContext, OutputsContextProvider } from './providers.js';

export const DIRECT_OUTPUT_TYPES = new Set(['stream', 'error']);

export const DIRECT_MIME_TYPES = new Set([
  KnownCellOutputMimeTypes.TextPlain,
  KnownCellOutputMimeTypes.ImagePng,
  KnownCellOutputMimeTypes.ImageGif,
  KnownCellOutputMimeTypes.ImageJpeg,
  KnownCellOutputMimeTypes.ImageBmp,
]) as Set<string>;

export function isOutputSafe(
  output: MinifiedOutput,
  directOutputTypes: Set<string>,
  directMimeTypes: Set<string>,
) {
  if (directOutputTypes.has(output.output_type)) return true;
  const data = (output as MinifiedMimeOutput).data;
  const mimetypes = data ? Object.keys(data) : [];
  return (
    'data' in output &&
    Boolean(output.data) &&
    mimetypes.every((mimetype) => directMimeTypes.has(mimetype))
  );
}

export function allOutputsAreSafe(
  outputs: MinifiedOutput[],
  directOutputTypes: Set<string>,
  directMimeTypes: Set<string>,
) {
  if (!outputs || outputs.length === 0) return true;
  return outputs.reduce(
    (flag, output) => flag && isOutputSafe(output, directOutputTypes, directMimeTypes),
    true,
  );
}

export function Output({ node }: { node: GenericNode }) {
  const { outputsId } = useOutputsContext();
  const { ready } = useCellExecution(outputsId);
  const jupyterLikeOutput = useMemo(() => [node.jupyter_data], [node]);
  const isSafe = isOutputSafe(jupyterLikeOutput[0], DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES);
  return isSafe && !ready ? (
    <SafeOutputs keyStub={outputsId} outputs={jupyterLikeOutput} />
  ) : (
    <JupyterOutputs id={outputsId} outputs={jupyterLikeOutput} />
  );
}

export function Outputs({ node }: { node: GenericNode }) {
  const className = classNames({ hidden: node.visibility === 'remove' });
  const { children, identifier, align } = node;
  const outputsId = node.id ?? node.key;
  const cellExecutionContext = useCellExecution(outputsId);
  const { ready } = cellExecutionContext;

  const outputs: MinifiedOutput[] = useMemo(
    () => selectAll('output', node).map((child) => (child as any).jupyter_data),
    [children],
  );

  // top level all safe only used for placeholder behaviour
  const allSafe = useMemo(
    () => allOutputsAreSafe(outputs, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES),
    [outputs],
  );
  const placeholder = usePlaceholder();

  if (!ready && placeholder) {
    return <MyST ast={placeholder} />;
  }

  const output = (
    <div
      id={identifier || undefined}
      data-mdast-node-id={outputsId}
      className={classNames(
        'myst-jp-output max-w-full overflow-y-visible overflow-x-auto m-0 group not-prose relative',
        {
          'text-left': !align || align === 'left',
          'text-center': align === 'center',
          'text-right': align === 'right',
          'mb-5': outputs && outputs.length > 0,
        },
        className,
      )}
    >
      <OutputsContextProvider outputsId={outputsId}>
        <MyST ast={children} />
      </OutputsContextProvider>
    </div>
  );

  if (node.visibility === 'hide') {
    return <Details title="Output">{output}</Details>;
  }
  return output;
}
