import type { GenericNode } from 'myst-common';
import { KnownCellOutputMimeTypes } from 'nbtx';
import type { MinifiedMimeOutput, MinifiedOutput } from 'nbtx';
import { SafeOutput } from './safe.js';
import { JupyterOutput } from './jupyter.js';
import { useMemo } from 'react';
import { useCellExecution } from './execute/index.js';
import { useOutputsContext } from './providers.js';

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

export function Output({ node }: { node: GenericNode }) {
  const { outputsId } = useOutputsContext();
  const { ready } = useCellExecution(outputsId);
  // FUTURE: we'll be rendering AST outputs directly in future
  const maybeSafeOutput = useMemo(() => node.jupyter_data, [node]);
  const isSafe = isOutputSafe(maybeSafeOutput, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES);

  if (isSafe && !ready) {
    return <SafeOutput output={maybeSafeOutput} />;
  }
  // TODO: myst-jp-output should be added to the first child div
  return <JupyterOutput outputsId={outputsId} output={maybeSafeOutput} />;
}
