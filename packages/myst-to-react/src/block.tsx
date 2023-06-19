import classNames from 'classnames';
import { useState } from 'react';

function BlockInner({
  nodeKey,
  children,
  visibility,
}: {
  nodeKey: string;
  children: any;
  visibility?: string;
}) {
  const [hidden, setHidden] = useState(true);
  if (visibility) {
    return (
      <div key={nodeKey} className={classNames({ hidden: visibility === 'remove' })}>
        <label
          className={classNames('relative inline-flex items-center', {
            hidden: visibility === 'show',
          })}
        >
          <input type="checkbox" defaultValue="" className="sr-only peer" />
          <div
            className="cursor-pointer w-11 h-6 bg-gray-200 rounded-full peer  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-400"
            onClick={() => setHidden(!hidden)}
          />
          <span className="ml-3 text-sm font-medium text-gray-900">
            click to {hidden ? 'show' : 'hidden'} code cell
          </span>
        </label>
        <div className={classNames({ hidden: hidden && visibility === 'hide' })}>{children}</div>
      </div>
    );
  }
  return <div key={nodeKey}>{children}</div>;
}

export function BlockOuter(node: any, children: any) {
  return (
    <BlockInner nodeKey={node.key} visibility={node.visibility}>
      {children}
    </BlockInner>
  );
}

const BLOCK_RENDERERS = { block: BlockOuter };

export default BLOCK_RENDERERS;
