import { useSiteManifest } from '@myst-theme/providers';
import { Download } from '@myst-theme/frontmatter';

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
  if (downloads.length === 0) return null;

  return (
    <div className="col-margin mt-3 mx-5 lg:m-0 lg:w-[300px]">
      <div className="flex flex-wrap gap-2 lg:flex-col w-fit lg:mx-auto">
        {downloads.map((item) => {
          return (
            <Download
              url={item.url}
              format={item.format}
              filename={item.filename}
              title={(item as any).title ?? formatToTitle(item.format)}
              internal={(item as any).internal}
            />
          );
        })}
      </div>
    </div>
  );
}
