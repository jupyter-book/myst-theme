import { Embed } from './embed.js';
import { Output } from './output.js';
import { Figure } from './figure.js';

const JUPYTER_RENDERERS = {
  output: Output,
  embed: Embed,
  container: Figure,
};

export * from './BinderBadge.js';
export * from './ErrorTray.js';
export * from './ConnectionStatusTray.js';
export * from './providers.js';
export * from './execute/index.js';
export * from './controls/index.js';
export * from './utils.js';
export { default as BLOCK_RENDERERS } from './block.js';
export { useLaunchBinder } from './hooks.js';

export default JUPYTER_RENDERERS;
