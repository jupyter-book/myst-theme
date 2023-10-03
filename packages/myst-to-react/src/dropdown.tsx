import React from 'react';
import type { NodeRenderer } from '@myst-theme/providers';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { MyST } from './MyST.js';

type DropdownSpec = {
  type: 'details';
  open?: boolean;
};
type SummarySpec = {
  type: 'summary';
};

const iconClass = 'inline-block pl-2 mr-2 -translate-y-[1px]';

export const SummaryTitle: NodeRenderer<SummarySpec> = ({ node }) => {
  return <MyST ast={node.children} />;
};

export function Details({
  title,
  children,
  open,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details
      className={classNames(
        'rounded-md my-5 shadow dark:shadow-2xl dark:shadow-neutral-900 overflow-hidden',
        'bg-gray-50 dark:bg-stone-800',
      )}
      open={open}
    >
      <summary
        className={classNames(
          'm-0 text-lg font-medium py-1 min-h-[2em] pl-3',
          'cursor-pointer hover:shadow-[inset_0_0_0px_30px_#00000003] dark:hover:shadow-[inset_0_0_0px_30px_#FFFFFF03]',
          'bg-gray-100 dark:bg-slate-900',
        )}
      >
        <span className="text-neutral-900 dark:text-white">
          <span className="block float-right text-sm font-thin text-neutral-700 dark:text-neutral-200">
            <ChevronRightIcon
              width="1.5rem"
              height="1.5rem"
              className={classNames(iconClass, 'details-toggle', 'transition-transform')}
            />
          </span>
          {title}
        </span>
      </summary>
      <div className="px-4 py-1 details-body">{children}</div>
    </details>
  );
}

export const DetailsRenderer: NodeRenderer<DropdownSpec> = ({ node }) => {
  const [title, ...rest] = node.children as any[];
  return (
    <Details title={<MyST ast={[title]} />} open={node.open}>
      <MyST ast={rest} />
    </Details>
  );
};

const DROPDOWN_RENDERERS = {
  details: DetailsRenderer,
  summary: SummaryTitle,
};

export default DROPDOWN_RENDERERS;
