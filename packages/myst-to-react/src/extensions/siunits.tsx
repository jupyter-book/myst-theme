import type { NodeRenderer } from '@myst-theme/providers';

export const SIUnits: NodeRenderer = ({ node }) => {
  const space = node.number == null ? '' : ' ';
  const title = `${node.number ?? ''}${space}${node.alt}`;
  return <span title={title}>{node.value}</span>;
};

const SI_RENDERERS = {
  si: SIUnits,
};

export default SI_RENDERERS;
