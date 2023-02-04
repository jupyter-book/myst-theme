import { Heading } from 'myst-spec';
import type { NodeRenderer } from '@myst-theme/providers';
import { useXRefState } from '@myst-theme/providers';
import { createElement as e } from 'react';
import classNames from 'classnames';

function getHelpHashText(kind: string) {
  return `Link to this ${kind}`;
}

export function HashLink({
  id,
  kind,
  align = 'inline',
  children = '#',
  hover,
  className = 'font-normal',
}: {
  id: string;
  kind: string;
  hover?: boolean;
  align?: 'inline' | 'left' | 'right';
  children?: '#' | '¶' | React.ReactNode;
  className?: string;
}) {
  const { inCrossRef } = useXRefState();
  // If we are in a cross-reference popout, hide the hash links
  if (inCrossRef) return null;
  const helpText = getHelpHashText(kind);
  return (
    <a
      className={classNames('select-none no-underline', className, {
        'absolute top-0 left-0 -translate-x-[100%] pr-3': align === 'left',
        'absolute top-0 right-0 translate-x-[100%] pl-3': align === 'right',
        'transition-opacity opacity-0 group-hover:opacity-70': hover,
        'hover:underline': !hover,
      })}
      href={`#${id}`}
      title={helpText}
      aria-label={helpText}
    >
      {children}
    </a>
  );
}

const Heading: NodeRenderer<Heading> = (node, children) => {
  const { enumerator, depth, key, identifier, html_id } = node;
  const id = html_id || identifier || key;
  const textContent = (
    <>
      {enumerator && <span className="select-none mr-3">{enumerator}</span>}
      <span className="heading-text">{children}</span>
      <HashLink id={id} align="inline" kind="Section" className="px-2 font-normal" hover />
    </>
  );
  // The `heading-text` class is picked up in the Outline to select without the enumerator and "#" link
  return e(
    `h${depth}`,
    {
      key: node.key,
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
