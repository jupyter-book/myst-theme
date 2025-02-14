import type { NodeRenderers } from '@myst-theme/providers';
import SPLIT_IMAGE_RENDERERS from './SplitImageBlock.js';
import CENTERED_RENDERERS from './CenteredBlock.js';
import JUSTIFIED_RENDERERS from './JustifiedBlock.js';
import LOGO_CLOUD_RENDERERS from './LogoCloudBlock.js';
import { mergeRenderers } from '@myst-theme/providers';

export * from './SplitImageBlock.js';
export * from './CenteredBlock.js';
export * from './JustifiedBlock.js';
export * from './LogoCloudBlock.js';

const BLOCK_RENDERERS: NodeRenderers = mergeRenderers([
  SPLIT_IMAGE_RENDERERS,
  CENTERED_RENDERERS,
  JUSTIFIED_RENDERERS,
  LOGO_CLOUD_RENDERERS,
]);
export default BLOCK_RENDERERS;
