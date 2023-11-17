import type { GenericNode } from 'myst-common';
import { KnownCellOutputMimeTypes } from 'nbtx';
import type { MinifiedMimeOutput, MinifiedOutput } from 'nbtx';
import classNames from 'classnames';
import { SafeOutputs } from './safe.js';
import { JupyterOutputs } from './jupyter.js';
import { useMemo } from 'react';
import { useCellExecution } from './execute/index.js';
import { usePlaceholder } from './decoration.js';
import { MyST } from 'myst-to-react';

export const DIRECT_OUTPUT_TYPES = new Set(['stream', 'error']);

export const DIRECT_MIME_TYPES = new Set([
  KnownCellOutputMimeTypes.TextPlain,
  KnownCellOutputMimeTypes.ImagePng,
  KnownCellOutputMimeTypes.ImageGif,
  KnownCellOutputMimeTypes.ImageJpeg,
  KnownCellOutputMimeTypes.ImageBmp,
]) as Set<string>;

export function allOutputsAreSafe(
  outputs: MinifiedOutput[],
  directOutputTypes: Set<string>,
  directMimeTypes: Set<string>,
) {
  if (!outputs || outputs.length === 0) return true;
  return outputs.reduce((flag, output) => {
    if (directOutputTypes.has(output.output_type)) return flag && true;
    const data = (output as MinifiedMimeOutput).data;
    const mimetypes = data ? Object.keys(data) : [];
    const safe =
      'data' in output &&
      Boolean(output.data) &&
      mimetypes.every((mimetype) => directMimeTypes.has(mimetype));
    return flag && safe;
  }, true);
}

export function JupyterOutput({
  outputId,
  identifier,
  data,
  align,
  className,
}: {
  outputId: string;
  identifier?: string;
  data: MinifiedOutput[];
  align?: 'left' | 'center' | 'right';
  className?: string;
}) {
  const { ready } = useCellExecution(outputId);
  const outputs: MinifiedOutput[] = data;
  const allSafe = useMemo(
    () => allOutputsAreSafe(outputs, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES),
    [outputs],
  );
  const placeholder = usePlaceholder();

  let component;
  if (allSafe && !ready) {
    if (placeholder && (!outputs || outputs.length === 0)) {
      if (placeholder) {
        return <MyST ast={placeholder} />;
      }
    }
    component = <SafeOutputs keyStub={outputId} outputs={outputs} />;
  } else {
    component = <JupyterOutputs id={outputId} outputs={outputs} />;
  }

  return (
    <div
      id={identifier || undefined}
      data-mdast-node-id={outputId}
      className={classNames(
        'max-w-full overflow-y-visible overflow-x-auto m-0 group not-prose relative',
        {
          'text-left': !align || align === 'left',
          'text-center': align === 'center',
          'text-right': align === 'right',
          'mb-5': outputs && outputs.length > 0,
        },
        className,
      )}
    >
      {component}
    </div>
  );
}

export function Output({ node }: { node: GenericNode }) {
  return (
    <JupyterOutput
      className={classNames({ hidden: node.visibility === 'remove' })}
      outputId={node.id}
      identifier={node.identifier}
      align={node.align}
      data={node.data}
    />
  );
}
