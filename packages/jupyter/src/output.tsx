import type { GenericNode } from 'myst-common';
import { KnownCellOutputMimeTypes } from 'nbtx';
import type { MinifiedMimeOutput, MinifiedOutput } from 'nbtx';
import classNames from 'classnames';
import { SafeOutputs } from './safe';
import { NativeJupyterOutputs as JupyterOutputs } from './jupyter';

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

export function Output(node: GenericNode) {
  const outputs: MinifiedOutput[] = node.data;
  const allSafe = allOutputsAreSafe(outputs, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES);

  let component;
  if (allSafe) {
    component = <SafeOutputs keyStub={node.key} outputs={outputs} />;
  } else {
    component = <JupyterOutputs id={node.key} outputs={outputs} />;
  }

  return (
    <figure
      key={node.key}
      id={node.identifier || undefined}
      className={classNames('max-w-full overflow-auto m-0 group not-prose relative', {
        'text-left': !node.align || node.align === 'left',
        'text-center': node.align === 'center',
        'text-right': node.align === 'right',
      })}
    >
      {component}
    </figure>
  );
}
