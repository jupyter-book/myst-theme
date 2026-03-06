import type { NodeRenderers } from '@myst-theme/providers';
import { AnyWidgetRenderer } from './renderers.js';

export * from './models.js';

export const ANY_RENDERERS: NodeRenderers = {
  anywidget: AnyWidgetRenderer,
};
