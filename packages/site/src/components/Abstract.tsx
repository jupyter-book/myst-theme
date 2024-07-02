import type { GenericParent } from 'myst-common';
import { ContentBlocks } from './ContentBlocks.js';
import { HashLink } from 'myst-to-react';

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
    <div className={className}>
      <h2 id={id} className="mb-3 text-base font-semibold group">
        {title}
        <HashLink id={id} title={`Link to ${title}`} hover className="ml-2" />
      </h2>
      <div className="px-6 py-1 mb-3 rounded-sm bg-slate-50 dark:bg-slate-800">
        <ContentBlocks mdast={content} className="col-body" />
      </div>
    </div>
  );
}
