import type { Admonition as AdmonitionSpec } from 'myst-spec';
import React from 'react';
import type { NodeRenderer } from '@myst-theme/providers';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { HashLink } from './hashLink.js';
import type { GenericNode } from 'myst-common';
import { MyST } from './MyST.js';

type Color = 'gray' | 'blue' | 'green' | 'yellow' | 'orange' | 'red' | 'purple';

function getClasses(className?: string) {
  const classes =
    className
      ?.split(' ')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => !!s) ?? [];
  return [...new Set(classes)];
}

function getColor(
  { classes = [] }: { classes?: string[] },
  defaultColor: Color = 'blue',
): {
  color: Color;
} {
  if (classes.includes('gray')) return { color: 'gray' };
  if (classes.includes('purple')) return { color: 'purple' };
  if (classes.includes('yellow')) return { color: 'yellow' };
  if (classes.includes('orange')) return { color: 'orange' };
  if (classes.includes('green')) return { color: 'green' };
  if (classes.includes('red')) return { color: 'red' };
  if (classes.includes('blue')) return { color: 'blue' };
  return { color: defaultColor };
}

const WrapperElement = ({
  id,
  dropdown,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  dropdown?: boolean;
}) => {
  if (dropdown)
    return (
      <details id={id} className={className}>
        {children}
      </details>
    );
  return (
    <aside id={id} className={className}>
      {children}
    </aside>
  );
};

const HeaderElement = ({
  dropdown,
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
  dropdown?: boolean;
}) => {
  if (dropdown) return <summary className={className}>{children}</summary>;
  return <div className={className}>{children}</div>;
};

const iconClass = 'inline-block pl-2 mr-2 self-center flex-none';

export function Callout({
  title,
  color,
  dropdown,
  children,
  identifier,
  Icon,
}: {
  title?: React.ReactNode;
  color?: Color;
  children: React.ReactNode;
  dropdown?: boolean;
  identifier?: string;
  Icon?: (props: { width?: string; height?: string; className?: string }) => JSX.Element;
}) {
  return (
    <WrapperElement
      id={identifier}
      dropdown={dropdown}
      className={classNames(
        'my-5 shadow dark:bg-stone-800 overflow-hidden',
        'dark:border-l-4 border-slate-400',
        {
          'dark:border-gray-500/60': !color || color === 'gray',
          'dark:border-blue-500/60': color === 'blue',
          'dark:border-green-500/60': color === 'green',
          'dark:border-amber-500/70': color === 'yellow',
          'dark:border-orange-500/60': color === 'orange',
          'dark:border-red-500/60': color === 'red',
          'dark:border-purple-500/60': color === 'purple',
        },
      )}
    >
      <HeaderElement
        dropdown={dropdown}
        className={classNames(
          'm-0 font-medium py-2 flex min-w-0',
          'text-md',
          'border-y dark:border-y-0',
          {
            'bg-gray-50/80 dark:bg-slate-900': !color || color === 'gray',
            'bg-blue-50/80 dark:bg-slate-900': color === 'blue',
            'bg-green-50/80 dark:bg-slate-900': color === 'green',
            'bg-amber-50/80 dark:bg-slate-900': color === 'yellow',
            'bg-orange-50/80 dark:bg-slate-900': color === 'orange',
            'bg-red-50/80 dark:bg-slate-900': color === 'red',
            'bg-purple-50/80 dark:bg-slate-900': color === 'purple',
            'cursor-pointer hover:shadow-[inset_0_0_0px_30px_#00000003] dark:hover:shadow-[inset_0_0_0px_30px_#FFFFFF03]':
              dropdown,
          },
        )}
      >
        {Icon && (
          <Icon
            width="2rem"
            height="2rem"
            className={classNames(
              'inline-block pl-2 mr-2 self-center flex-none',
              classNames({
                'text-gray-600': !color || color === 'gray',
                'text-blue-600': color === 'blue',
                'text-green-600': color === 'green',
                'text-amber-600': color === 'yellow',
                'text-orange-600': color === 'orange',
                'text-red-600': color === 'red',
                'text-purple-600': color === 'purple',
              }),
            )}
          />
        )}
        <div
          className={classNames(
            'text-neutral-900 dark:text-white grow self-center overflow-hidden break-words',
            { 'ml-4': !Icon }, // No icon!
            'group', // For nested cross-reference links
          )}
        >
          {title}
        </div>
        {dropdown && (
          <div className="self-center flex-none text-sm font-thin text-neutral-700 dark:text-neutral-200">
            <ChevronRightIcon
              width="1.5rem"
              height="1.5rem"
              className={classNames(iconClass, 'transition-transform details-toggle')}
            />
          </div>
        )}
      </HeaderElement>
      <div className={classNames('px-4', { 'details-body': dropdown })}>{children}</div>
    </WrapperElement>
  );
}

export const ExerciseRenderer: NodeRenderer<AdmonitionSpec> = ({ node }) => {
  if ((node as any).hidden) return null;
  const [title, ...rest] = (node.children as GenericNode[]) ?? [];
  const classes = getClasses(node.class);
  const { color } = getColor({ classes });
  const isDropdown = classes.includes('dropdown');

  const useTitle = node.children?.[0]?.type === 'admonitionTitle';

  const identifier = node.html_id;
  const enumerator = (node as any).enumerator;

  const titleNode = (
    <>
      <HashLink id={identifier} kind="Exercise">
        {(node as any).gate === 'start' && 'Start of '}
        {(node as any).gate === 'end' && 'End of '}
        Exercise{enumerator != null && <> {enumerator}</>}
      </HashLink>
      {useTitle && (
        <>
          {' '}
          (<MyST ast={[title]} />)
        </>
      )}
    </>
  );

  return (
    <Callout identifier={identifier} title={titleNode} color={color} dropdown={isDropdown}>
      {useTitle ? <MyST ast={rest} /> : <MyST ast={node.children} />}
    </Callout>
  );
};

export const SolutionRenderer: NodeRenderer<AdmonitionSpec> = ({ node }) => {
  if ((node as any).hidden) return null;
  const [title, ...rest] = (node.children as GenericNode[]) ?? [];
  const classes = getClasses(node.class);
  const { color } = getColor({ classes }, 'gray');
  const isDropdown = classes.includes('dropdown');

  const useTitle = node.children?.[0]?.type === 'admonitionTitle';

  const identifier = node.html_id;

  const titleNode = (
    <>
      {(node as any).gate === 'start' && 'Start of '}
      {(node as any).gate === 'end' && 'End of '}
      <MyST ast={[title]} />
      <HashLink id={identifier} kind="Solution" hover hideInPopup>
        {' #'}
      </HashLink>
    </>
  );

  return (
    <Callout
      identifier={identifier}
      title={useTitle ? titleNode : undefined}
      color={color}
      dropdown={isDropdown}
    >
      {useTitle ? <MyST ast={rest} /> : <MyST ast={node.children} />}
    </Callout>
  );
};

const EXERCISE_RENDERERS = {
  exercise: ExerciseRenderer,
  solution: SolutionRenderer,
};

export default EXERCISE_RENDERERS;
