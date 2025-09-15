import { Embed } from './embed.js';
import { Outputs } from './outputs.js';
import { Output } from './output.js';
import { Figure } from './figure.js';
import { mergeRenderers } from '@myst-theme/providers';
import { NOTEBOOK_BLOCK_RENDERERS } from './block.js';

export { NOTEBOOK_BLOCK_RENDERERS } from './block.js';
export const OUTPUT_RENDERERS = {
  outputs: Outputs,
  output: Output,
  embed: Embed,
  container: Figure,
};
export const JUPYTER_RENDERERS = mergeRenderers([OUTPUT_RENDERERS, NOTEBOOK_BLOCK_RENDERERS]);
