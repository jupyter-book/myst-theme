import { type KnownParts } from '../utils.js';
import { Abstract } from './Abstract.js';
import { Keywords } from './Keywords.js';

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
