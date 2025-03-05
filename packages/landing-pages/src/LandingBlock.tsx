import type { ReactNode } from 'react';
import type { GenericParent } from 'myst-common';

import { useGridSystemProvider } from '@myst-theme/providers';
import classNames from 'classnames';

export type LandingBlockProps = {
  node: GenericParent;
  className?: string;
  children: ReactNode;
};

export function LandingBlock({ node, className, children }: LandingBlockProps) {
  const grid = useGridSystemProvider();
  const { key } = node;

  const subGrid = node.visibility === 'hide' ? '' : `${grid} subgrid-gap col-page [&>*]:col-page`;
  const dataClassName = typeof node.data?.class === 'string' ? node.data?.class : undefined;
  // Hide the subgrid if either the dataClass or the className exists and includes `col-`
  const noSubGrid =
    (dataClassName && dataClassName.includes('col-')) || (className && className.includes('col-'));

  return (
    <div
      key={`block-${key}`}
      id={key}
      className={classNames('relative group/block py-6', className, dataClassName, {
        [subGrid]: !noSubGrid,
        hidden: node.visibility === 'remove',
      })}
    >
      {children}
    </div>
  );
}
