import {
  DocumentArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { useSiteManifest } from '@myst-theme/providers';
import { Link } from '@remix-run/react';
import { SiteAction as DownloadsItem } from 'myst-config';
import { useCallback } from 'react';

function formatToTitle(format?: string) {
  if (!format) return 'File';
  switch (format) {
    case 'pdf':
      return 'PDF';
    case 'meca':
      return 'MECA';
    case 'xml':
      return 'JATS';
    default:
      break;
  }
  return format;
}

export function DownloadLinksArea() {
  const site = useSiteManifest();
  const project = site?.projects?.[0];
  const downloads = project?.downloads ?? project?.exports ?? [];

  const handleDownload = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>, item: DownloadsItem) => {
      e.preventDefault();
      e.stopPropagation();
      // Example: Fetching a PDF from an API
      const response = await fetch(item.url);
      const blob = await response.blob(); // Ensure the response is a Blob
      const url = URL.createObjectURL(blob);

      // Create an <a> element and trigger the download
      const a = document.createElement('a');
      a.href = url;

      if (item.filename) {
        a.download = item.filename; // Suggest a filename for the download
      } else {
        const url = new URL(item.url);
        const segments = url.pathname.split('/');
        a.download = segments.pop() || segments.pop() || '';
      }
      document.body.appendChild(a); // Append to the document
      a.click();

      // Clean up by revoking the object URL and removing the <a> element
      URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    },
    [],
  );

  if (downloads.length === 0) return null;

  return (
    <div className="col-margin mt-3 mx-5 lg:m-0 lg:w-[300px]">
      <div className="flex flex-wrap gap-2 lg:flex-col w-fit lg:mx-auto">
        {downloads.map((item) => {
          if (item.internal && !item.filename) {
            return (
              <Link to={item.url} className="no-underline">
                <DocumentIcon width="1.5rem" height="1.5rem" className="inline h-5 pr-2" />
                <span className="align-middle">{item.title}</span>
              </Link>
            );
          }

          const externalLinkNotDownload = !item.filename;
          const icon = externalLinkNotDownload ? (
            <ArrowTopRightOnSquareIcon width="1.5rem" height="1.5rem" className="inline h-5 pr-2" />
          ) : (
            <DocumentArrowDownIcon width="1.5rem" height="1.5rem" className="inline h-5 pr-2" />
          );

          return (
            <a
              key={item.url}
              href={item.url}
              className="inline-block mr-2 no-underline lg:mr-0 lg:block"
              download={item.filename ? item.filename : undefined}
              target={externalLinkNotDownload ? '_blank' : undefined}
              rel={externalLinkNotDownload ? 'noreferrer noopener' : undefined}
              onClick={item.filename ? (e) => handleDownload(e, item) : undefined}
            >
              {icon}
              <span className="align-middle">
                {item.title ?? `Download ${formatToTitle(item.format)}`}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
