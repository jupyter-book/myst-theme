import type { NodeRenderer } from '@myst-theme/providers';
import { MyST } from './MyST.js';
import type { GenericNode } from 'myst-common';
import classNames from 'classnames';

type Aside = {
  type: 'aside';
};

function getAsideClass(kind?: string) {
  switch (kind) {
    case 'topic':
      return {
        container:
          'myst-aside myst-aside-${kind} my-5 shadow dark:bg-stone-800 overflow-hidden dark:border-l-4 border-slate-400',
        title:
          'myst-aside-title m-0 font-medium py-2 px-4 flex min-w-0 text-md border-y dark:border-y-0 bg-gray-50/80 dark:bg-slate-900',
        body: 'myst-aside-body px-4',
      };
    case 'margin':
    case 'sidebar':
    default:
      return {
        container: 'myst-aside myst-aside-${kind} text-sm lg:h-0 col-margin-right',
        title: 'myst-aside-title text-base font-semibold',
        body: 'myst-aside-body',
      };
  }
}

export const AsideRenderer: NodeRenderer<Aside> = ({ node, className }) => {
  const [title, ...rest] = node.children as GenericNode[];
  const classes = getAsideClass(node.kind);
  if (title.type !== 'admonitionTitle') {
    return (
      <aside className={classNames(classes.container, node.class, className)}>
        <MyST ast={node.children} />
      </aside>
    );
  }
  return (
    <aside className={classNames(classes.container, node.class, className)}>
      <div className={classes.title}>
        <MyST ast={title} />
      </div>
      <div className={classes.body}>
        <MyST ast={rest} />
      </div>
    </aside>
  );
};

const ASIDE_RENDERERS = {
  aside: AsideRenderer,
};

export default ASIDE_RENDERERS;
