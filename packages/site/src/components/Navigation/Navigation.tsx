import { useNavOpen, useSiteManifest, useThemeTop } from '@myst-theme/providers';
import { PrimarySidebar } from './PrimarySidebar.js';
import type { Heading } from '@myst-theme/common';
import { getProjectHeadings } from '@myst-theme/common';
import type { SiteManifest } from 'myst-config';

/**
 * PrimaryNavigation will load nav links and headers from the site manifest and display
 * them in a mobile-friendly format.
 */
export const PrimaryNavigation = ({
  children,
  projectSlug,
  sidebarRef,
  hide_toc,
  mobileOnly,
  footer,
}: {
  children?: React.ReactNode;
  projectSlug?: string;
  sidebarRef?: React.RefObject<HTMLDivElement>;
  hide_toc?: boolean;
  mobileOnly?: boolean;
  footer?: React.ReactNode;
}) => {
  const config = useSiteManifest();
  if (!config) return null;

  const headings = getProjectHeadings(config, projectSlug, {
    addGroups: false,
  });

  const { nav } = config;

  return (
    <ConfigurablePrimaryNavigation
      children={children}
      sidebarRef={sidebarRef}
      hide_toc={hide_toc}
      mobileOnly={mobileOnly}
      nav={nav}
      headings={headings}
      footer={footer}
    />
  );
};

/**
@deprecated use PrimaryNavigation instead
 */
export const Navigation = PrimaryNavigation;

/**
 * ConfigurablePrimaryNavigation will display a mobile-friendly navigation sidebar based on the
 * nav, headings, and footer provided by the caller. Use this in situations where the PrimaryNavigation
 * component may pick up the wrong SiteManifest.
 */
export const ConfigurablePrimaryNavigation = ({
  children,
  sidebarRef,
  hide_toc,
  mobileOnly,
  nav,
  headings,
  footer,
}: {
  children?: React.ReactNode;
  sidebarRef?: React.RefObject<HTMLDivElement>;
  hide_toc?: boolean;
  mobileOnly?: boolean;
  nav?: SiteManifest['nav'];
  headings?: Heading[];
  footer?: React.ReactNode;
}) => {
  const [open, setOpen] = useNavOpen();
  const top = useThemeTop();

  if (children)
    console.warn(
      `Including children in Navigation can break keyboard accessibility and is deprecated. Please move children to the page component.`,
    );

  // the logic on the following line looks wrong, this will return `null` or `<></>`
  // we should just return `null` if `hide_toc` is true?
  if (!nav && hide_toc) return children ? null : <>{children}</>;
  if (nav && hide_toc) {
    headings = undefined;
    footer = null;
  }

  return (
    <>
      {open && !mobileOnly && headings && (
        // Darkened backdrop behind the open sidebar on mobile.
        <div
          // It follows the same top-offset rules as the sidebar: header offset on desktop,
          // full-screen from top on mobile.
          className="myst-navigation-overlay fixed inset-0 max-xl:z-40 xl:z-30 bg-black opacity-50 max-xl:!mt-0"
          style={{ marginTop: top }}
          // Clicking the backdrop is the primary escape path for closing the sidebar.
          onClick={() => setOpen(false)}
        ></div>
      )}
      <PrimarySidebar
        // The actual sidebar panel is here; the overlay backdrop is above.
        sidebarRef={sidebarRef}
        nav={nav}
        headings={headings}
        footer={footer}
        hide_toc={hide_toc}
        mobileOnly={mobileOnly}
      />
      {children}
    </>
  );
};
