import classNames from 'classnames';
import React from 'react';
import type { NodeRenderer } from '@myst-theme/providers';
import { MyST } from './MyST.js';

type GridItemSpec = {
  type: 'grid-item';
  columns: number;
};

const colSpanClassNames = [
  'col-span-1',
  'col-span-2',
  'col-span-3',
  'col-span-4',
  'col-span-5',
  'col-span-6',
  'col-span-7',
  'col-span-8',
  'col-span-9',
  'col-span-10',
  'col-span-11',
  'col-span-12',
];

export const GridItemRenderer: NodeRenderer<GridItemSpec> = ({ node, className }) => {
  return (
    <div className={classNames('myst-grid-item', colSpanClassNames[node.columns - 1], className, node.class)}>
      <MyST ast={node.children} />
    </div>
  );
};

const GRID_ITEM_RENDERERS = {
  'grid-item': GridItemRenderer,
};

export default GRID_ITEM_RENDERERS;
