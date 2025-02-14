import { Embed } from './embed.js';
import { Output } from './output.js';
import { Figure } from './figure.js';

import { mergeRenderers } from '@myst-theme/providers';
import NOTEBOOK_RENDERERS from './block.js';

export * from './BinderBadge.js';
export * from './ErrorTray.js';
export * from './ConnectionStatusTray.js';
export * from './providers.js';
export * from './execute/index.js';
export * from './controls/index.js';
export * from './utils.js';
export { useLaunchBinder } from './hooks.js';

export const OUTPUT_RENDERERS = {
  output: Output,
  embed: Embed,
  container: Figure,
};
export { NOTEBOOK_RENDERERS };

const JUPYTER_RENDERERS = mergeRenderers([OUTPUT_RENDERERS, NOTEBOOK_RENDERERS]);
export default JUPYTER_RENDERERS;
