import React, { useState, useCallback } from 'react';
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

const iconClass = 'myst-dropdown-header-icon inline-block pl-2 mr-2 -translate-y-[1px]';

export const SummaryTitle: NodeRenderer<SummarySpec> = ({ node, className }) => {
  return <MyST ast={node.children} className={className} />;
};

export function Details({
  title,
  children,
  open,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(!!open);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <section
      className={classNames(
        'myst-dropdown rounded-md my-5 shadow dark:shadow-2xl dark:shadow-neutral-900 overflow-hidden',
        'bg-gray-50 dark:bg-stone-800',
        className,
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } }}
        className={classNames(
          'myst-dropdown-header m-0 text-lg font-medium py-1 min-h-[2em] pl-3',
          'cursor-pointer hover:shadow-[inset_0_0_0px_30px_#00000003] dark:hover:shadow-[inset_0_0_0px_30px_#FFFFFF03]',
          'bg-gray-100 dark:bg-slate-900',
        )}
      >
        <span className="myst-dropdown-header-title text-neutral-900 dark:text-white">
          <span className="block float-right text-sm font-thin text-neutral-700 dark:text-neutral-200">
            <ChevronRightIcon
              width="1.5rem"
              height="1.5rem"
              className={classNames(iconClass, 'transition-transform', {
                'rotate-90 -translate-x-[5px] -translate-y-[5px]': isOpen,
              })}
            />
          </span>
          {title}
        </span>
      </div>
      <div
        className={classNames('myst-dropdown-body px-4 py-1', {
          'dropdown-body': true,
          'dropdown-open': isOpen,
          'dropdown-closed': !isOpen,
        })}
        aria-hidden={false}
      >
        {children}
      </div>
    </section>
  );
}

export const DetailsRenderer: NodeRenderer<DropdownSpec> = ({ node, className }) => {
  const [title, ...rest] = node.children as any[];
  return (
    <Details
      title={<MyST ast={[title]} />}
      open={node.open}
      className={classNames(node.class, className)}
    >
      <MyST ast={rest} />
    </Details>
  );
};

const DROPDOWN_RENDERERS = {
  details: DetailsRenderer,
  summary: SummaryTitle,
};

export default DROPDOWN_RENDERERS;
