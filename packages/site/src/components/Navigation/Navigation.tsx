import { useNavOpen } from '@myst-theme/providers';
import { TableOfContents } from './TableOfContents';

export function Navigation({
  children,
  projectSlug,
  top,
  tocRef,
  hide_toc,
  footer,
}: {
  children?: React.ReactNode;
  projectSlug?: string;
  top?: number;
  tocRef?: React.RefObject<HTMLDivElement>;
  hide_toc?: boolean;
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useNavOpen();
  if (hide_toc) return <>{children}</>;
  return (
    <>
      {children}
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-50"
          style={{ marginTop: top }}
          onClick={() => setOpen(false)}
        ></div>
      )}
      <TableOfContents tocRef={tocRef} projectSlug={projectSlug} top={top} footer={footer} />
    </>
  );
}
