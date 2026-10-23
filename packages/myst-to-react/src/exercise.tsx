import type { Admonition as AdmonitionSpec } from 'myst-spec';
import React from 'react';
import type { NodeRenderer } from '@myst-theme/providers';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { HashLink } from './hashLink.js';
import type { GenericNode } from 'myst-common';
import { MyST } from './MyST.js';

const colorSchemes = {
  info: {
    border: 'dark:border-myst-info',
    bg: 'bg-myst-info-bg',
    text: 'text-myst-info-text',
  },
  proof: {
    border: 'dark:border-myst-proof',
    bg: 'bg-myst-proof-bg',
    text: 'text-myst-proof-text',
  },
  error: {
    border: 'dark:border-myst-error',
    bg: 'bg-myst-error-bg',
    text: 'text-myst-error-text',
  },
} as const;

type ColorScheme = keyof typeof colorSchemes;

function getClasses(className?: string) {
  const classes =
    className
      ?.split(' ')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => !!s) ?? [];
  return [...new Set(classes)];
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
  colorScheme = 'proof',
  dropdown,
  children,
  identifier,
  className,
  Icon,
}: {
  title?: React.ReactNode;
  colorScheme?: ColorScheme;
  children: React.ReactNode;
  dropdown?: boolean;
  identifier?: string;
  className?: string;
  Icon?: (props: { width?: string; height?: string; className?: string }) => React.JSX.Element;
}) {
  const { border, bg, text } = colorSchemes[colorScheme];
  return (
    <WrapperElement
      id={identifier}
      dropdown={dropdown}
      className={classNames(
        'myst-exercise my-5 shadow dark:bg-myst-bg-secondary overflow-hidden',
        'dark:border-l-4 border-myst-border-strong',
        border,
        className,
      )}
    >
      <HeaderElement
        dropdown={dropdown}
        className={classNames(
          'myst-exercise-header m-0 font-medium py-2 flex min-w-0',
          'text-md',
          'border-y dark:border-y-0',
          bg,
          {
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
              text,
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
      colorScheme="info"
      dropdown={isDropdown}
      className={classNames(classes, className)}
    >
      {useTitle ? <MyST ast={rest} /> : <MyST ast={node.children} />}
    </Callout>
  );
};

export const SolutionRenderer: NodeRenderer<AdmonitionSpec> = ({ node, className }) => {
  if ((node as any).hidden) return null;
  const [title, ...rest] = (node.children as GenericNode[]) ?? [];
  const classes = getClasses(node.class);
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
      colorScheme="proof"
      dropdown={isDropdown}
      className={classNames(classes, className)}
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
