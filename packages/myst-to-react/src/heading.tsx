import { Heading } from 'myst-spec';
import type { NodeRenderer } from '@myst-theme/providers';
import { useXRefState } from '@myst-theme/providers';
import { createElement as e } from 'react';
import classNames from 'classnames';

export function HashLink({
  id,
  kind,
  title = `Link to this ${kind}`,
  children = '¶',
  hover,
  className = 'font-normal',
  hideInPopup,
}: {
  id?: string;
  kind: string;
  title?: string;
  hover?: boolean;
  children?: '#' | '¶' | React.ReactNode;
  className?: string;
  hideInPopup?: boolean;
}) {
  const { inCrossRef } = useXRefState();
  if (inCrossRef || !id) {
    // If we are in a cross-reference pop-out, either hide hash link
    // or return something that is **not** a link
    return hideInPopup ? null : (
      <span className={classNames('select-none', className)}>{children}</span>
    );
  }
  const scroll: React.MouseEventHandler<HTMLAnchorElement> = (evt) => {
    evt.preventDefault();
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(undefined, '', `#${id}`);
  };
  return (
    <a
      className={classNames('select-none no-underline text-inherit hover:text-inherit', className, {
        'transition-opacity opacity-0 focus:opacity-100 group-hover:opacity-70': hover,
        'hover:underline': !hover,
      })}
      onClick={scroll}
      href={`#${id}`}
      title={title}
      aria-label={title}
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
      {enumerator && <span className="mr-3 select-none">{enumerator}</span>}
      <span className="heading-text">{children}</span>
      <HashLink id={id} kind="Section" className="px-2 font-normal" hover hideInPopup />
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
