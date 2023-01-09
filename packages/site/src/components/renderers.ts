import { DEFAULT_RENDERERS } from 'myst-to-react';
import { MystDemoRenderer } from 'myst-demo';

export const renderers = {
  ...DEFAULT_RENDERERS,
  myst: MystDemoRenderer,
};
