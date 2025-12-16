import type { GenericNode } from 'myst-common';
import { KnownCellOutputMimeTypes } from 'nbtx';
import type { MinifiedMimeOutput, MinifiedOutput } from 'nbtx';
import { SafeOutput } from './safe.js';
import { JupyterOutput } from './jupyter.js';
import { useMemo } from 'react';
import { useCellExecution } from './execute/index.js';
import { useOutputsContext } from './providers.js';
import { Callout, MyST } from 'myst-to-react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const DIRECT_OUTPUT_TYPES = new Set(['stream', 'error']);

export const DIRECT_MIME_TYPES = new Set([
  KnownCellOutputMimeTypes.TextPlain,
  KnownCellOutputMimeTypes.ImagePng,
  KnownCellOutputMimeTypes.ImageGif,
  KnownCellOutputMimeTypes.ImageJpeg,
  KnownCellOutputMimeTypes.ImageBmp,
  // TODO: handle variants here
  'text/markdown',
]) as Set<string>;

export function isOutputSafe(
  output: MinifiedOutput | null | undefined,
  directOutputTypes: Set<string>,
  directMimeTypes: Set<string>,
) {
  if (!output) return false;
  try {
    if (directOutputTypes.has(output.output_type)) return true;
    const data = (output as MinifiedMimeOutput).data;
    const mimetypes = data ? Object.keys(data) : [];
    return (
      'data' in output &&
      Boolean(output.data) &&
      mimetypes.every((mimetype) => directMimeTypes.has(mimetype))
    );
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Check if an output is valid and has the expected structure.
 *
 * @param output - The output to validate.
 * @returns Object with isValid flag and reason if invalid.
 */
export function validateOutput(output: unknown): {
  isValid: boolean;
  reason?: string;
} {
  if (!output || typeof output !== 'object') {
    return { isValid: false, reason: 'Jupyter output data package is missing or not an object' };
  }

  const outputType = (output as any).output_type;
  if (!('output_type' in output) || typeof outputType !== 'string') {
    return { isValid: false, reason: 'Missing or invalid output_type property' };
  }

  return { isValid: true };
}

export function Output({ node, className }: { node: GenericNode; className?: string }) {
  const { outputsId } = useOutputsContext();
  const { ready } = useCellExecution(outputsId ?? '');
  // FUTURE: we'll be rendering AST outputs directly in future
  const maybeSafeOutput = useMemo(() => node.jupyter_data, [node]);
  const isSafe = isOutputSafe(maybeSafeOutput, DIRECT_OUTPUT_TYPES, DIRECT_MIME_TYPES);

  const validation = validateOutput(maybeSafeOutput);
  if (!outputsId || !maybeSafeOutput || !validation.isValid) {
    if (validation.reason) {
      console.error(validation.reason);
    }
    return (
      <Callout
        title={<div>Cannot render output node</div>}
        color={'red'}
        dropdown
        Icon={ExclamationTriangleIcon as any}
        className={className}
      >
        <div className="py-2 space-y-1">
          <div>Output data package is not compatible with the current renderer.</div>
          {validation.reason && (
            <div className="font-mono text-sm">Reason: {validation.reason}</div>
          )}
        </div>
      </Callout>
    );
  }

  if (isSafe && !ready) {
    if (node.children?.length) {
      return <MyST ast={node.children} />;
    }
    return <SafeOutput output={maybeSafeOutput} />;
  }

  // TODO: myst-jp-output should be added to the first child div
  return <JupyterOutput outputsId={outputsId} output={maybeSafeOutput} />;
}
