import type { NodeRenderers } from '@myst-theme/providers';
import { DEFAULT_RENDERERS } from 'myst-to-react';
import { MystDemoRenderer } from 'myst-demo';
import { MermaidNodeRenderer } from '@myst-theme/diagrams';

export const renderers: NodeRenderers = {
  ...DEFAULT_RENDERERS,
  myst: MystDemoRenderer,
  mermaid: MermaidNodeRenderer,
};
