import type { GenericParent } from 'myst-common';
import { ContentBlocks } from './ContentBlocks.js';
import classNames from 'classnames';
import { HashLink } from 'myst-to-react';
import { type KnownParts } from '../utils.js';

export function FrontmatterParts({
  parts,
  keywords,
  hideKeywords,
}: {
  parts: KnownParts;
  keywords?: string[];
  hideKeywords?: boolean;
}) {
  if (!parts.abstract && !parts.keypoints && !parts.summary) return null;
  return (
    <>
      <Abstract content={parts.abstract} />
      <Abstract content={parts.keypoints} title="Key Points" id="keypoints" />
      <Abstract content={parts.summary} title="Plain Language Summary" id="summary" />
      <Keywords keywords={keywords} hideKeywords={hideKeywords} />
    </>
  );
}

export function Abstract({
  content,
  title = 'Abstract',
  id = 'abstract',
}: {
  title?: string;
  id?: string;
  content?: GenericParent;
}) {
  if (!content) return null;
  return (
    <>
      <h2 id={id} className="mb-3 text-base font-semibold group">
        {title}
        <HashLink id={id} title={`Link to ${title}`} hover className="ml-2" />
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
  if (hideKeywords || !keywords || keywords.length === 0) return null;
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
