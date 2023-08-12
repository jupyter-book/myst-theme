import { useNavOpen, useThemeTop } from '@myst-theme/providers';
import { TableOfContents } from './TableOfContents';

export function Navigation({
  children,
  projectSlug,
  tocRef,
  hide_toc,
  footer,
}: {
  children?: React.ReactNode;
  projectSlug?: string;
  tocRef?: React.RefObject<HTMLDivElement>;
  hide_toc?: boolean;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useNavOpen();
  const top = useThemeTop();
  if (hide_toc) return <>{children}</>;
  return (
    <>
      {children}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50"
          style={{ marginTop: top }}
          onClick={() => setOpen(false)}
        ></div>
      )}
      <TableOfContents tocRef={tocRef} projectSlug={projectSlug} footer={footer} />
    </>
  );
}
