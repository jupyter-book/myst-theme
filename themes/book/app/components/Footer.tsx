import type { GenericParent } from 'myst-common';
import classNames from 'classnames';
import { MyST } from 'myst-to-react';

export function Footer({ content, className }: { content: GenericParent; className?: string }) {
  return (
    // Outer footer, sets up the grid, leaves margin above
    <footer
      className={classNames(
        'article footer bg-white dark:bg-slate-950 mt-10 shadow-2xl shadow py-10',
        className,
      )}
    >
      {/* Inner div that adds the shadow */}
      <MyST ast={content} />
    </footer>
  );
}
