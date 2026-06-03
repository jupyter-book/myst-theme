/**
 * A small wrapper component around scienceicons so that we can add a .scienceicon class to style.
 */
import type { NodeRenderer } from '@myst-theme/providers';
import { ScienceIconRenderer } from '@scienceicons/myst/react';
import classNames from 'classnames';

// Wrap upstream renderer output with a class so our theme CSS can target it
// If scienceicons starts shipping with a class then we can delete this!
export const ScienceIconWithClass: NodeRenderer = ({ node, className }) => {
  return (
    <span className={classNames('scienceicon', className)}>
      <ScienceIconRenderer node={node} />
    </span>
  );
};

const SCIENCEICON_CLASS_RENDERERS = {
  // Override the "scienceicon" node renderer key with our class-attached wrapper.
  scienceicon: ScienceIconWithClass,
};

export default SCIENCEICON_CLASS_RENDERERS;
