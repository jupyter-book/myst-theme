import type { GenericParent } from 'myst-common';
import { MyST, HashLink } from 'myst-to-react';
import classNames from 'classnames';

export function Abstract({
  content,
  title = 'Abstract',
  id = 'abstract',
  className,
}: {
  title?: string;
  id?: string;
  content?: GenericParent;
  className?: string;
}) {
  if (!content) return null;
  return (
    <div className={classNames('myst-abstract', className)}>
      <h2 id={id} className="myst-abstract-title mb-3 text-base font-semibold group">
        {title}
        <HashLink id={id} title={`Link to ${title}`} hover className="ml-2" />
      </h2>
      <div className="myst-abstract-box px-6 py-1 mb-3 rounded-sm bg-slate-50 dark:bg-slate-800">
        <MyST ast={content} className="myst-abstract-content col-body" />
      </div>
    </div>
  );
}
