import type {
  Admonition as AdmonitionSpec,
  AdmonitionTitle as AdmonitionTitleSpec,
} from 'myst-spec';
import React from 'react';
import type { NodeRenderer } from '@myst-theme/providers';
import {
  InformationCircleIcon,
  ExclamationCircleIcon as OExclamationIcon,
  MegaphoneIcon,
  PencilSquareIcon,
  ArrowRightCircleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import {
  ExclamationTriangleIcon as SExclamationIcon,
  ExclamationCircleIcon as SExclamationCircleIcon,
  XCircleIcon,
  BoltIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { MyST } from './MyST.js';
import type { GenericNode } from 'myst-common';
// import { AdmonitionKind } from 'myst-common';

// TODO: get this from myst-spec?
export enum AdmonitionKind {
  admonition = 'admonition',
  attention = 'attention',
  caution = 'caution',
  danger = 'danger',
  error = 'error',
  important = 'important',
  hint = 'hint',
  note = 'note',
  seealso = 'seealso',
  tip = 'tip',
  warning = 'warning',
}

type Color = 'blue' | 'green' | 'yellow' | 'red';
type ColorAndKind = {
  kind: AdmonitionKind;
  color: Color;
};

function getClasses(className?: string) {
  const classes =
    className
      ?.split(' ')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => !!s) ?? [];
  return [...new Set(classes)];
}

function getFirstKind({
  kind,
  classes = [],
}: {
  kind?: AdmonitionKind | string;
  classes?: string[];
}): ColorAndKind {
  if (kind === AdmonitionKind.note || classes.includes('note')) {
    return { kind: AdmonitionKind.note, color: 'blue' };
  }
  if (kind === AdmonitionKind.important || classes.includes('important')) {
    return { kind: AdmonitionKind.important, color: 'blue' };
  }
  if (kind === AdmonitionKind.hint || classes.includes('hint')) {
    return { kind: AdmonitionKind.hint, color: 'green' };
  }
  if (kind === AdmonitionKind.seealso || classes.includes('seealso')) {
    return { kind: AdmonitionKind.seealso, color: 'green' };
  }
  if (kind === AdmonitionKind.tip || classes.includes('tip')) {
    return { kind: AdmonitionKind.tip, color: 'green' };
  }
  if (kind === AdmonitionKind.attention || classes.includes('attention')) {
    return { kind: AdmonitionKind.attention, color: 'yellow' };
  }
  if (kind === AdmonitionKind.warning || classes.includes('warning')) {
    return { kind: AdmonitionKind.warning, color: 'yellow' };
  }
  if (kind === AdmonitionKind.caution || classes.includes('caution')) {
    return { kind: AdmonitionKind.caution, color: 'yellow' };
  }
  if (kind === AdmonitionKind.danger || classes.includes('danger')) {
    return { kind: AdmonitionKind.danger, color: 'red' };
  }
  if (kind === AdmonitionKind.error || classes.includes('error')) {
    return { kind: AdmonitionKind.error, color: 'red' };
  }
  return { kind: AdmonitionKind.note, color: 'blue' };
}

const iconClass = 'inline-block pl-2 mr-2 self-center flex-none';

function AdmonitionIcon({ kind, className }: { kind: AdmonitionKind; className?: string }) {
  const cn = classNames(iconClass, className);
  const opts = { width: '2rem', height: '2rem', className: cn };
  if (kind === AdmonitionKind.note) return <InformationCircleIcon {...opts} />;
  if (kind === AdmonitionKind.caution) return <OExclamationIcon {...opts} />;
  if (kind === AdmonitionKind.warning) return <SExclamationIcon {...opts} />;
  if (kind === AdmonitionKind.danger) return <SExclamationCircleIcon {...opts} />;
  if (kind === AdmonitionKind.error) return <XCircleIcon {...opts} />;
  if (kind === AdmonitionKind.attention) return <MegaphoneIcon {...opts} />;
  if (kind === AdmonitionKind.tip) return <PencilSquareIcon {...opts} />;
  if (kind === AdmonitionKind.hint) return <LightBulbIcon {...opts} />;
  if (kind === AdmonitionKind.important) return <BoltIcon {...opts} />;
  if (kind === AdmonitionKind.seealso) return <ArrowRightCircleIcon {...opts} />;
  return <InformationCircleIcon {...opts} />;
}

export const AdmonitionTitle: NodeRenderer<AdmonitionTitleSpec> = ({ node }) => {
  return <MyST ast={node.children} />;
};

const WrapperElement = ({
  dropdown,
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
  dropdown?: boolean;
}) => {
  if (dropdown) return <details className={className}>{children}</details>;
  return <aside className={className}>{children}</aside>;
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

export function Admonition({
  title,
  kind,
  color,
  simple,
  dropdown,
  children,
  hideIcon,
  className,
}: {
  title?: React.ReactNode;
  color?: Color;
  kind?: AdmonitionKind;
  children: React.ReactNode;
  simple?: boolean;
  dropdown?: boolean;
  hideIcon?: boolean;
  className?: string;
}) {
  return (
    <WrapperElement
      dropdown={dropdown}
      className={classNames(
        'my-5 shadow-md dark:shadow-2xl dark:shadow-neutral-900',
        'bg-gray-50/10 dark:bg-stone-800',
        'overflow-hidden',
        {
          'rounded border-l-4': !simple,
          'border-l-2': simple,
          'border-blue-500': !color || color === 'blue',
          'border-green-600': color === 'green',
          'border-amber-600': color === 'yellow',
          'border-red-600': color === 'red',
        },
        className,
      )}
    >
      {title && (
        <HeaderElement
          dropdown={dropdown}
          className={classNames('m-0 font-medium py-1 flex min-w-0', {
            'text-lg': !simple,
            'text-md': simple,
            'bg-gray-100 dark:bg-stone-700': simple,
            'text-blue-600 bg-blue-50 dark:bg-slate-900': !simple && (!color || color === 'blue'),
            'text-green-600 bg-green-50 dark:bg-slate-900': !simple && color === 'green',
            'text-amber-600 bg-amber-50 dark:bg-slate-900': !simple && color === 'yellow',
            'text-red-600 bg-red-50 dark:bg-slate-900': !simple && color === 'red',
            'cursor-pointer hover:shadow-[inset_0_0_0px_30px_#00000003] dark:hover:shadow-[inset_0_0_0px_30px_#FFFFFF03]':
              dropdown,
          })}
        >
          {!hideIcon && (
            <AdmonitionIcon
              kind={kind ?? AdmonitionKind.note}
              className={classNames({
                // Needed for simple!
                'text-blue-600': !color || color === 'blue',
                'text-green-600': color === 'green',
                'text-amber-600': color === 'yellow',
                'text-red-600': color === 'red',
              })}
            />
          )}
          <div
            className={classNames(
              'text-neutral-900 dark:text-white grow self-center overflow-hidden break-words',
              { 'ml-4': hideIcon },
            )}
          >
            {title}
          </div>
          {dropdown && (
            <div className="self-center flex-none text-sm font-thin text-neutral-700 dark:text-neutral-200">
              <ChevronRightIcon
                width="2rem"
                height="2rem"
                className={classNames(iconClass, 'transition-transform details-toggle')}
              />
            </div>
          )}
        </HeaderElement>
      )}
      <div className={classNames('px-4', { 'py-1': !simple, 'details-body': dropdown })}>
        {children}
      </div>
    </WrapperElement>
  );
}

export const AdmonitionRenderer: NodeRenderer<AdmonitionSpec> = ({ node }) => {
  const [title, ...rest] = node.children as GenericNode[];
  const classes = getClasses(node.class);
  const { kind, color } = getFirstKind({ kind: node.kind, classes });
  const isDropdown = classes.includes('dropdown');
  const isSimple = classes.includes('simple');
  const hideIcon = node.icon === false;

  const useTitle = title?.type === 'admonitionTitle';

  return (
    <Admonition
      title={useTitle ? <MyST ast={[title]} /> : undefined}
      kind={kind}
      color={color}
      dropdown={isDropdown}
      simple={isSimple}
      hideIcon={hideIcon}
      className={classNames(classes)}
    >
      {useTitle ? <MyST ast={rest} /> : <MyST ast={node.children} />}
    </Admonition>
  );
};

const ADMONITION_RENDERERS = {
  admonition: AdmonitionRenderer,
  admonitionTitle: AdmonitionTitle,
};

export default ADMONITION_RENDERERS;
