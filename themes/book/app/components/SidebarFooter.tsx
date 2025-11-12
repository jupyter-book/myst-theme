import type { GenericParent } from 'myst-common';
import { MyST } from 'myst-to-react';
import { MadeWithMyst } from '@myst-theme/icons';

export function SidebarFooter({ content }: { content?: GenericParent }) {
  if (!content) {
    return <MadeWithMyst />;
  }

  return (
    <div className="myst-primary-sidebar-footer text-sm text-slate-900 dark:text-white [&>*]:m-0 [&_a]:underline [&_a]:font-semibold">
      <MyST ast={content} />
    </div>
  );
}
