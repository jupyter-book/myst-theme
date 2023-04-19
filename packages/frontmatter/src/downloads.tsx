import { Menu } from '@headlessui/react';
import DocumentIcon from '@heroicons/react/24/outline/DocumentIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import classNames from 'classnames';
import { useCallback } from 'react';

type HasExports = {
  exports?: { format: string; filename: string; url: string }[];
};

/**
 * triggerDirectDownload - aims to trigger a direct download for the
 *
 * @param url - url or resource to download
 * @param filename - default filename and extension for dialog / system
 * @returns - true or throws
 */
export async function triggerDirectDownload(url: string, filename: string) {
  const resp = await fetch(url);
  const blob = await resp.blob();

  return triggerBlobDownload(blob, filename);
}

/**
 * triggerBlobDownload - aims to trigger a direct download for the
 *
 * @param blob - blob to download
 * @param filename - default filename and extension for dialog / system
 * @returns - true or throws
 */
export async function triggerBlobDownload(blob: Blob, filename: string) {
  if (window.navigator && (window.navigator as any).msSaveOrOpenBlob)
    return (window.navigator as any).msSaveOrOpenBlob(blob);

  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.style.display = 'none';

  a.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    }),
  );

  setTimeout(() => {
    // For Firefox it is necessary to delay revoking the ObjectURL
    URL.revokeObjectURL(objectUrl);
    a.remove();
  }, 100);

  return true;
}

export function Download({
  url,
  filename,
  format,
  className,
}: {
  url: string;
  filename: string;
  format: string;
  className?: string;
}) {
  const clickDownload = useCallback(
    (e: any) => {
      e.preventDefault();
      triggerDirectDownload(url, filename);
    },
    [url, filename],
  );
  return (
    <a className={classNames(className, 'flex')} href={url} onClick={clickDownload}>
      <span className="sr-only">Download as {format}</span>
      <DocumentIcon className="w-5 h-5 inline-block items-center mr-2" aria-hidden="true" />
      {filename}
    </a>
  );
}

export function DownloadsDropdown({ exports }: HasExports) {
  if (!exports || exports.length === 0) return null;
  return (
    <Menu as="div" className="flex relative grow-0 inline-block mx-1">
      <Menu.Button className="relative">
        <span className="sr-only">Downloads</span>
        <ArrowDownTrayIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
      </Menu.Button>
      <Menu.Items className="absolute -right-1 bg-white dark:bg-slate-800 rounded-sm overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        {exports.map(({ format, filename, url }) => (
          <Menu.Item key={url}>
            <Download
              className="block hover:bg-stone-700 dark:hover:bg-stone-200 hover:text-white dark:hover:text-black p-3 no-underline"
              url={url}
              filename={filename}
              format={format}
            />
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}
