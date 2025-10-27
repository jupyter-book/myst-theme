import type { SourceFileKind } from 'myst-spec-ext';
import type { GenericParent } from 'myst-common';
import { MyST, Block as MystBlock } from 'myst-to-react';
import classNames from 'classnames';

/**
 * @deprecated This component is not maintained, in favor of the generic `MyST` component
 */
export function ContentBlocks({
  mdast,
  className,
}: {
  mdast: GenericParent;
  pageKind?: SourceFileKind;
  className?: string;
}) {
  return <MyST ast={mdast} className={classNames("myst-content-blocks", className)} />;
}

/** @deprecated use `import { Block } from 'myst-to-react';` */
export const Block = MystBlock;
