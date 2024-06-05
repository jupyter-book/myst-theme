import type { GenericNode, GenericParent } from 'myst-common';
import { HashLink, MyST } from 'myst-to-react';
import type { KnownParts } from '../utils.js';

export function BackmatterParts({ parts }: { parts: KnownParts }) {
  return (
    <>
      <Backmatter title="Acknowledgments" id="acknowledgments" content={parts.acknowledgments} />
      <Backmatter
        title="Data Availability"
        id="data-availability"
        content={parts.data_availability}
      />
    </>
  );
}

/**
 * This returns the contents of a part that we want to render (not the root or block, which are already wrapped)
 * This also fixes a bug that the key is not defined on a block.
 */
function getChildren(content?: GenericParent): GenericNode | GenericNode[] {
  if (
    content?.type === 'root' &&
    content.children?.length === 1 &&
    content.children[0].type === 'block'
  ) {
    return content.children[0].children as GenericNode[];
  }
  return content as GenericNode;
}

export function Backmatter({
  title,
  id,
  content,
}: {
  title: string;
  id: string;
  content?: GenericParent;
}) {
  if (!content) return null;
  return (
    <div className="flex flex-col w-full md:flex-row group/backmatter">
      <h2
        id={id}
        className="mt-5 text-base font-semibold group md:w-[200px] self-start md:flex-none opacity-90 group-hover/backmatter:opacity-100"
      >
        {title}
        <HashLink id={id} title={`Link to ${title}`} hover className="ml-2" />
      </h2>
      <div className="grow opacity-90 group-hover/backmatter:opacity-100 col-screen">
        <MyST ast={getChildren(content)} />
      </div>
    </div>
  );
}
