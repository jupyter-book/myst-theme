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
      className: classNames('myst-landing-heading', node.class, className, 'group'),
      id: id,
    },
    <>
      {enumerator && <span className="myst-landing-enumerator mr-3 select-none">{enumerator}</span>}
      <span className="myst-landing-text heading-text">
        <MyST ast={node.children} />
      </span>
      <HashLink
        className="myst-landing-link font-normal"
        id={id}
        kind="Section"
        hover
        hideInPopup
        noWidth
      />
    </>,
  );
}
