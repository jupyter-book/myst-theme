import type { Admonition as AdmonitionSpec } from 'myst-spec';
import React from 'react';
import type { NodeRenderer } from '@myst-theme/providers';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';
import { HashLink } from './hashLink.js';
import type { GenericNode } from 'myst-common';
import { MyST } from './MyST.js';

export enum ProofKind {
  proof = 'proof',
  axiom = 'axiom',
  lemma = 'lemma',
  definition = 'definition',
  criterion = 'criterion',
  remark = 'remark',
  conjecture = 'conjecture',
  corollary = 'corollary',
  algorithm = 'algorithm',
  example = 'example',
  property = 'property',
  observation = 'observation',
  proposition = 'proposition',
  assumption = 'assumption',
  theorem = 'theorem',
}

const colorSchemes = {
  proof: { border: 'border-myst-proof', bg: 'bg-myst-proof-bg', text: 'text-myst-proof-text' },
  theorem: {
    border: 'border-myst-theorem',
    bg: 'bg-myst-theorem-bg',
    text: 'text-myst-theorem-text',
  },
  example: {
    border: 'border-myst-example',
    bg: 'bg-myst-example-bg',
    text: 'text-myst-example-text',
  },
  info: { border: 'border-myst-info', bg: 'bg-myst-info-bg', text: 'text-myst-info-text' },
  success: {
    border: 'border-myst-success',
    bg: 'bg-myst-success-bg',
    text: 'text-myst-success-text',
  },
  warning: {
    border: 'border-myst-warning',
    bg: 'bg-myst-warning-bg',
    text: 'text-myst-warning-text',
  },
  danger: { border: 'border-myst-danger', bg: 'bg-myst-danger-bg', text: 'text-myst-danger-text' },
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

function capitalize(kind?: string) {
  if (!kind) return '';
  return kind.slice(0, 1).toUpperCase() + kind.slice(1);
}

function getColorScheme(kind?: ProofKind | string): ColorScheme {
  switch (kind) {
    case ProofKind.proof:
    case ProofKind.algorithm:
      return 'proof';
    case ProofKind.lemma:
    case ProofKind.conjecture:
    case ProofKind.theorem:
      return 'theorem';
    case ProofKind.observation:
    case ProofKind.assumption:
    case ProofKind.axiom:
      return 'warning';
    case ProofKind.criterion:
    case ProofKind.corollary:
    case ProofKind.property:
      return 'example';
    case ProofKind.example:
      return 'success';
    case ProofKind.remark:
      return 'danger';
    case ProofKind.definition:
    case ProofKind.proposition:
      return 'info';
    default:
      return 'proof';
  }
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

export function Proof({
  title,
  kind,
  colorScheme = 'proof',
  dropdown,
  children,
  identifier,
  enumerator,
  className,
}: {
  title?: React.ReactNode;
  colorScheme?: ColorScheme;
  kind?: ProofKind;
  children: React.ReactNode;
  dropdown?: boolean;
  identifier?: string;
  enumerator?: string;
  className?: string;
}) {
  const { border, bg, text } = colorSchemes[colorScheme];
  return (
    <WrapperElement
      id={identifier}
      dropdown={dropdown}
      className={classNames(
        'myst-proof my-5 shadow dark:bg-myst-bg-secondary overflow-hidden',
        'border-l-4',
        border,
        className,
      )}
    >
      <HeaderElement
        dropdown={dropdown}
        className={classNames(
          'myst-proof-header m-0 font-medium py-2 flex min-w-0',
          'text-md',
          'border-y dark:border-y-0',
          bg,
          {
            'cursor-pointer hover:shadow-[inset_0_0_0px_30px_#00000003] dark:hover:shadow-[inset_0_0_0px_30px_#FFFFFF03]':
              dropdown,
          },
        )}
      >
        <div
          className={classNames(
            'myst-proof-title grow self-center overflow-hidden break-words',
            'ml-4', // No icon!
            text,
          )}
        >
          <HashLink id={identifier} kind={capitalize(kind)}>
            {capitalize(kind)} {enumerator}
          </HashLink>{' '}
          {title && <>({title})</>}
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
      <div className={classNames('myst-proof-body px-4', { 'details-body': dropdown })}>
        {children}
      </div>
    </WrapperElement>
  );
}

export const ProofRenderer: NodeRenderer<AdmonitionSpec> = ({ node, className }) => {
  const [title, ...rest] = node.children as GenericNode[];
  const classes = getClasses(node.class);
  const colorScheme = getColorScheme(node.kind as ProofKind);
  const isDropdown = classes.includes('dropdown');

  const useTitle = title?.type === 'admonitionTitle';

  return (
    <Proof
      identifier={node.html_id}
      title={useTitle ? <MyST ast={[title]} /> : undefined}
      kind={node.kind as ProofKind}
      enumerator={(node as any).enumerator}
      colorScheme={colorScheme}
      dropdown={isDropdown}
      className={className}
    >
      {useTitle ? <MyST ast={rest} /> : <MyST ast={node.children} />}
    </Proof>
  );
};

const PROOF_RENDERERS = {
  proof: ProofRenderer,
};

export default PROOF_RENDERERS;
