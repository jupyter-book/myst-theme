import { Heading } from 'myst-spec';
import type { NodeRenderer } from '@myst-theme/providers';
import { createElement as e } from 'react';
import { MyST } from './MyST.js';
import { HashLink } from './hashLink.js';

const Heading: NodeRenderer<Heading> = ({ node }) => {
  const { enumerator, depth, key, identifier, html_id } = node;
  const id = html_id || identifier || key;
  const textContent = (
    <>
      {enumerator && <span className="mr-3 select-none">{enumerator}</span>}
      <span className="heading-text">
        <MyST ast={node.children} />
      </span>
      <HashLink id={id} kind="Section" className="px-2 font-normal" hover hideInPopup />
    </>
  );
  // The `heading-text` class is picked up in the Outline to select without the enumerator and "#" link
  return e(
    `h${depth}`,
    {
      id,
      className: 'relative group',
    },
    textContent,
  );
};

const HEADING_RENDERERS = {
  heading: Heading,
};

export default HEADING_RENDERERS;
