import { SourceFileKind } from 'myst-spec-ext';
import type { GenericParent } from 'myst-common';
import { MyST } from 'myst-to-react';
export { Block } from 'myst-to-react';

/**
 * @deprecated This component is not maintained, in favor of the generic `MyST` component
 */
export function ContentBlocks({
  mdast,
  pageKind = SourceFileKind.Article,
  className,
}: {
  mdast: GenericParent;
  pageKind?: SourceFileKind;
  className?: string;
}) {
  return <MyST ast={mdast} className={className} />;
}
