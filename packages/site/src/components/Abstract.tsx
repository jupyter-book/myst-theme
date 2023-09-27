import type { GenericParent } from 'myst-common';
import { ContentBlocks } from './ContentBlocks';
import classNames from 'classnames';
import { HashLink } from 'myst-to-react';

export function Abstract({ content }: { content: GenericParent }) {
  if (!content) return <div className="hidden" aria-label="this article has no abstract" />;
  return (
    <>
      <h2 id="abstract" className="mb-3 text-base font-semibold group">
        Abstract
        <HashLink id="abstract" title="Link to Abstract" hover className="ml-2" />
      </h2>
      <div className="px-6 py-1 mb-3 rounded-sm bg-slate-50 dark:bg-slate-800">
        <ContentBlocks mdast={content} className="col-body" />
      </div>
    </>
  );
}

export function Keywords({
  keywords,
  hideKeywords,
}: {
  keywords?: string[];
  hideKeywords?: boolean;
}) {
  if (hideKeywords || !keywords || keywords.length === 0)
    return <div className="hidden" aria-label="this article has no keywords" />;
  return (
    <div className="mb-10 group">
      <span className="mr-2 font-semibold">Keywords:</span>
      {keywords.map((k, i) => (
        <span
          key={k}
          className={classNames({
            "after:content-[','] after:mr-1": i < keywords.length - 1,
          })}
        >
          {k}
        </span>
      ))}
      <HashLink id="keywords" title="Link to Keywords" hover className="ml-2" />
    </div>
  );
}
