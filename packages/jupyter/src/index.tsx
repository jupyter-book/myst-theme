import { Embed } from './embed';
import { Output } from './output';
import { Figure } from './figure';

const OUTPUT_RENDERERS = {
  output: Output,
  embed: Embed,
  container: Figure,
};

export * from './BinderBadge';
export * from './ErrorTray';
export * from './ConnectionStatusTray';
export * from './providers';
export * from './execute';
export * from './controls';

export default OUTPUT_RENDERERS;
