import type { NodeRenderer } from '@myst-theme/providers';
import type { GenericNode } from 'myst-common';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Callout } from './exercise.js';

export const UnknownDirective: NodeRenderer<GenericNode> = ({ node }) => {
  const titleNode = (
    <>
      <code>{node.name}</code> - Unknown Directive
    </>
  );

  return (
    <Callout title={titleNode} color={'red'} dropdown Icon={ExclamationTriangleIcon as any}>
      <pre>{node.value}</pre>
    </Callout>
  );
};

const UNKNOWN_MYST_RENDERERS = {
  mystDirective: UnknownDirective,
};

export default UNKNOWN_MYST_RENDERERS;
