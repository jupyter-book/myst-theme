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
import { select } from 'unist-util-select';

export const DIRECT_OUTPUT_TYPES = new Set(['stream', 'error']);

export const DIRECT_MIME_TYPES = new Set([
  KnownCellOutputMimeTypes.TextPlain,
  KnownCellOutputMimeTypes.ImagePng,
  KnownCellOutputMimeTypes.ImageGif,
  KnownCellOutputMimeTypes.ImageJpeg,
  KnownCellOutputMimeTypes.ImageBmp,
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

// const MIME_PAT_TYPST = /^mime:text\/vnd\.typst$/;
const ORDERED_MIME_PATTERNS = [
  /^application\/vnd\.mystmd\.ast\+json\b/,
  /^text\/markdown\b/,
  // If we encounter HTML, we want to render whatever the author intended (parsed or raw)
  /^text\/html$/,
  /^text\/latex\b/,
  /^image\//,
  /^text\/plain$/,
];

function getPreferredMIMEChild(children: GenericNode[]): GenericNode | undefined {
  return (
    Array.from(children)
      // Keep only things with MIME types
      .filter((node) =>
        ORDERED_MIME_PATTERNS.some((mime) => ((node as any).data?.mimeType ?? '').match(mime)),
      )
      // Sort by preferred MIME types
      .sort((left, right) => {
        const ld = (left as any).data?.mimeType;
        const rd = (right as any).data?.mimeType;
        let leftWins: boolean;

        for (const pat of ORDERED_MIME_PATTERNS) {
          if ((leftWins = ld.match(pat)) || rd.match(pat)) {
            return leftWins ? -1 : +1;
          }
        }
        return 0;
      })[0]
  );
}

export function Output({ node, className }: { node: GenericNode; className?: string }) {
  const { outputsId } = useOutputsContext();
  const { ready } = useCellExecution(outputsId ?? '');

  // Legacy direct React-only rendering path logic
  // Used for external legacy content
  const maybeJupyterData = useMemo(() => node.jupyter_data, [node]);
  const jupyterDataValidation = validateOutput(maybeJupyterData);
  const jupyterDataIsDirect = isOutputSafe(
    maybeJupyterData,
    DIRECT_OUTPUT_TYPES,
    DIRECT_MIME_TYPES,
  );

  const hasChildren = !!node.children?.length;
  const hasValidData = maybeJupyterData && jupyterDataValidation.isValid;

  // Do we need to error?
  if (!outputsId || (!hasChildren && !hasValidData)) {
    if (jupyterDataValidation.reason) {
      console.error(jupyterDataValidation.reason);
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
          {jupyterDataValidation.reason && (
            <div className="font-mono text-sm">Reason: {jupyterDataValidation.reason}</div>
          )}
        </div>
      </Callout>
    );
  }
  // New AST rendering path, always preferred unless there's a kernel involved
  // TODO: perhaps an opt-out of the ready check here for cells that we want
  //       to be sticky?
  const preferredChild = useMemo(() => getPreferredMIMEChild(node.children as any[]), [node]);
  // FIXME: check whether the HTML mime type has been processed
  const preferredChildHasHTML = useMemo(
    () => preferredChild?.data?.mimeType === 'text/html' && select('html', preferredChild),
    [preferredChild],
  );
  if (!ready && preferredChild) {
    // FIXME: we don't nicely handle ANSI code blocks (that are the render result of streams),
    //        so let's special case here ...'
    if (preferredChild.data?.outputType !== undefined) {
      return <SafeOutput output={maybeJupyterData} />;
    }
    // FIXME: HTML rendering, for example, is currently not nicely handled via <MyST> for plots
    //        This special case
    else if (preferredChildHasHTML) {
      return <JupyterOutput outputsId={outputsId} output={maybeJupyterData} />;
    } else {
      return <MyST ast={preferredChild} />;
    }
  } // Legacy direct rendering path, for not-ready cases
  else if (!ready && jupyterDataIsDirect) {
    return <SafeOutput output={maybeJupyterData} />;
  }
  // Kernel and/or widget backed rendering
  else {
    // TODO: myst-jp-output should be added to the first child div
    return <JupyterOutput outputsId={outputsId} output={maybeJupyterData} />;
  }
}
