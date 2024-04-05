import {
  DocumentArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { useSiteManifest } from '@myst-theme/providers';
import { triggerDirectDownload } from '@myst-theme/frontmatter';
import { Link } from '@remix-run/react';
import { SiteAction as DownloadsItem } from 'myst-config';
import { useCallback, useState } from 'react';

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

  const [downloading, setDownloading] = useState<Record<string, boolean>>({});

  const handleDownload = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>, item: DownloadsItem & { filename: string }) => {
      e.preventDefault();
      e.stopPropagation();

      if (downloading[item.url]) return;
      setDownloading({ ...downloading, [item.url]: true });

      await triggerDirectDownload(item.url, item.filename);

      setDownloading({ ...downloading, [item.url]: false });
    },
    [downloading],
  );

  if (downloads.length === 0) return null;

  return (
    <div className="col-margin mt-3 mx-5 lg:m-0 lg:w-[300px]">
      <div className="flex flex-wrap gap-2 lg:flex-col w-fit lg:mx-auto">
        {downloads.map((item) => {
          if ((item as DownloadsItem).internal && !item.filename) {
            return (
              <Link key={item.url} to={item.url} className="no-underline">
                <DocumentIcon width="1.5rem" height="1.5rem" className="inline h-5 pr-2" />
                <span className="align-middle">{(item as DownloadsItem).title}</span>
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
              onClick={
                item.filename
                  ? (e) => handleDownload(e, item as DownloadsItem & { filename: string })
                  : undefined
              }
            >
              {icon}
              <span className="align-middle">
                {(item as DownloadsItem).title ?? `Download ${formatToTitle(item.format)}`}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
