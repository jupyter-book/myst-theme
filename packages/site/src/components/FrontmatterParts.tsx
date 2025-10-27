import { type KnownParts } from '../utils.js';
import { Abstract } from './Abstract.js';
import { Keywords } from './Keywords.js';
import classNames from 'classnames';

export function FrontmatterParts({
  parts,
  keywords,
  hideKeywords,
  containerClassName,
  innerClassName,
}: {
  parts: KnownParts;
  keywords?: string[];
  hideKeywords?: boolean;
  containerClassName?: string;
  innerClassName?: string;
}) {
  if (!parts.abstract && !parts.keypoints && !parts.summary) return null;
  return (
    <div className={classNames('myst-fm-parts', containerClassName)}>
      <Abstract className={classNames('myst-fm-section', innerClassName)} content={parts.abstract} />
      <Abstract
        className={classNames('myst-fm-section', innerClassName)}
        content={parts.keypoints}
        title="Key Points"
        id="keypoints"
      />
      <Abstract
        className={classNames('myst-fm-section', innerClassName)}
        content={parts.summary}
        title="Plain Language Summary"
        id="summary"
      />
      <Keywords className={classNames('myst-fm-section', innerClassName)} keywords={keywords} hideKeywords={hideKeywords} />
    </div>
  );
}
