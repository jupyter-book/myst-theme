import { useNavOpen, useThemeTop } from '@myst-theme/providers';
import { PrimarySidebar } from './TableOfContents.js';

export function Navigation({
  children,
  projectSlug,
  sidebarRef,
  hide_toc,
  footer,
}: {
  children?: React.ReactNode;
  projectSlug?: string;
  sidebarRef?: React.RefObject<HTMLDivElement>;
  hide_toc?: boolean;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useNavOpen();
  const top = useThemeTop();
  if (children)
    console.warn(
      `Including children in Navigation can break keyboard accessbility and is deprecated. Please move children to the page component.`,
    );
  if (hide_toc) return children ? null : <>{children}</>;
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50"
          style={{ marginTop: top }}
          onClick={() => setOpen(false)}
        ></div>
      )}
      <PrimarySidebar sidebarRef={sidebarRef} projectSlug={projectSlug} footer={footer} />
      {children}
    </>
  );
}
