import type { GenericParent } from 'myst-common';
import { MyST } from 'myst-to-react';
import { MadeWithMyst } from '@myst-theme/icons';

export function SidebarFooter({ content }: { content?: GenericParent }) {
  if (!content) {
    return <MadeWithMyst />;
  }

  return (
    <div className="article footer myst-primary-sidebar-footer">
      <MyST ast={content} />
    </div>
  );
}
