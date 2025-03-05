import { createElement as e } from 'react';
import type { GenericParent } from 'myst-common';
import { MyST, HashLink } from 'myst-to-react';
import classNames from 'classnames';

export function BlockHeading({ node, className }: { node: GenericParent; className?: string }) {
  const { enumerator, depth, key, identifier, html_id } = node;
  const id = html_id || identifier || key;

  return e(
    `h${depth}`,
    {
      className: classNames(node.class, className, 'group'),
      id: id,
    },
    <>
      {enumerator && <span className="mr-3 select-none">{enumerator}</span>}
      <span className="heading-text">
        <MyST ast={node.children} />
      </span>
      <HashLink id={id} kind="Section" className="font-normal" hover hideInPopup noWidth />
    </>,
  );
}
