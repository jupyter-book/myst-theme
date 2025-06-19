import { useSiteManifest } from '@myst-theme/providers';
import { getProjectHeadings } from '@myst-theme/common';
import { Toc } from './TableOfContentsItems.js';

export const InlineTableOfContents = ({
  projectSlug,
  sidebarRef,
  className = 'flex-grow overflow-y-auto max-w-[350px]',
}: {
  projectSlug?: string;
  className?: string;
  sidebarRef?: React.RefObject<HTMLElement>;
}) => {
  const config = useSiteManifest();
  if (!config) return null;
  const headings = getProjectHeadings(config, projectSlug, {
    addGroups: false,
  });
  if (!headings) return null;
  return (
    <nav aria-label="Table of Contents" className={className} ref={sidebarRef}>
      <Toc headings={headings} open_urls_in_same_tab={config?.options?.open_toc_urls_in_same_tab} />
    </nav>
  );
};
