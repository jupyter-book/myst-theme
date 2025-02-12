import type { NodeRenderer } from '@myst-theme/providers';

export const SIUnits: NodeRenderer = ({ node, className }) => {
  const space = node.number == null ? '' : ' ';
  const title = `${node.number ?? ''}${space}${node.alt}`;
  return (
    <span title={title} className={className}>
      {node.value}
    </span>
  );
};

const SI_RENDERERS = {
  si: SIUnits,
};

export default SI_RENDERERS;
