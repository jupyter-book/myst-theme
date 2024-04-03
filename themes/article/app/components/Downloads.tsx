import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { useSiteManifest } from '@myst-theme/providers';

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

export function Downloads() {
  const site = useSiteManifest();
  const project = site?.projects?.[0];
  const downloads = [
    ...(project?.downloads ?? project?.exports ?? []),
    ...(project?.pages?.[0]?.downloads ?? project?.pages?.[0]?.exports ?? []),
  ];
  if (downloads.length === 0) return null;
  return (
    <div className="col-margin mt-3 mx-5 lg:m-0 lg:w-[300px]">
      <div className="flex flex-wrap gap-2 lg:flex-col w-fit lg:mx-auto">
        {downloads.map((action) => (
          <a
            key={action.url}
            href={action.url}
            className="inline-block mr-2 no-underline lg:mr-0 lg:block"
          >
            <DocumentArrowDownIcon width="1.5rem" height="1.5rem" className="inline h-5 pr-2" />
            <span>Download {formatToTitle(action.format)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
