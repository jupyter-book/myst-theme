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
  className,
  Icon,
}: {
  title?: React.ReactNode;
  color?: Color;
  children: React.ReactNode;
  dropdown?: boolean;
  identifier?: string;
  className?: string;
  Icon?: (props: { width?: string; height?: string; className?: string }) => JSX.Element;
}) {
  return (
    <WrapperElement
      id={identifier}
      dropdown={dropdown}
      className={classNames(
        'myst-exercise my-5 shadow dark:bg-myst-bg-alt overflow-hidden',
        'dark:border-l-4 border-myst-border-strong',
        {
          'dark:border-myst-gray/60': !color || color === 'gray',
          'dark:border-myst-info/60': color === 'blue',
          'dark:border-myst-success/60': color === 'green',
          'dark:border-myst-warning/70': color === 'yellow',
          'dark:border-myst-orange/60': color === 'orange',
          'dark:border-myst-danger/60': color === 'red',
          'dark:border-myst-purple/60': color === 'purple',
        },
        className,
      )}
    >
      <HeaderElement
        dropdown={dropdown}
        className={classNames(
          'myst-exercise-header m-0 font-medium py-2 flex min-w-0',
          'text-md',
          'border-y dark:border-y-0',
          {
            'bg-myst-gray-bg': !color || color === 'gray',
            'bg-myst-info-bg': color === 'blue',
            'bg-myst-success-bg': color === 'green',
            'bg-myst-warning-bg': color === 'yellow',
            'bg-myst-orange-bg': color === 'orange',
            'bg-myst-danger-bg': color === 'red',
            'bg-myst-purple-bg': color === 'purple',
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
              'myst-exercise-header-icon inline-block pl-2 mr-2 self-center flex-none',
              classNames({
                'text-myst-gray-text': !color || color === 'gray',
                'text-myst-info-text': color === 'blue',
                'text-myst-success-text': color === 'green',
                'text-myst-warning-text': color === 'yellow',
                'text-myst-orange-text': color === 'orange',
                'text-myst-danger-text': color === 'red',
                'text-myst-purple-text': color === 'purple',
              }),
            )}
          />
        )}
        <div
          className={classNames(
            'myst-exercise-title text-myst-text grow self-center overflow-hidden break-words',
            { 'ml-4': !Icon }, // No icon!
            'group', // For nested cross-reference links
          )}
        >
          {title}
        </div>
        {dropdown && (
          <div className="self-center flex-none text-sm font-thin text-myst-text-secondary">
            <ChevronRightIcon
              width="1.5rem"
              height="1.5rem"
              className={classNames(iconClass, 'transition-transform details-toggle')}
            />
          </div>
        )}
      </HeaderElement>
      <div className={classNames('myst-exercise-body px-4', { 'details-body': dropdown })}>
        {children}
      </div>
    </WrapperElement>
  );
}

export const ExerciseRenderer: NodeRenderer<AdmonitionSpec> = ({ node, className }) => {
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
    <Callout
      identifier={identifier}
      title={titleNode}
      color={color}
      dropdown={isDropdown}
      className={className}
    >
      {useTitle ? <MyST ast={rest} /> : <MyST ast={node.children} />}
    </Callout>
  );
};

export const SolutionRenderer: NodeRenderer<AdmonitionSpec> = ({ node, className }) => {
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
      className={className}
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
