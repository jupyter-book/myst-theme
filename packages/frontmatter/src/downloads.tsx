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
      <DocumentIcon
        width="1.25rem"
        height="1.25rem"
        className="items-center inline-block mr-2"
        aria-hidden="true"
      />
      {filename}
    </a>
  );
}

export function DownloadsDropdown({ exports }: HasExports) {
  if (!exports || exports.length === 0) return null;
  return (
    <Menu as="div" className="relative flex inline-block mx-1 grow-0">
      <Menu.Button className="relative">
        <span className="sr-only">Downloads</span>
        <ArrowDownTrayIcon
          width="1.25rem"
          height="1.25rem"
          className="ml-2 -mr-1"
          aria-hidden="true"
        />
      </Menu.Button>
      <Menu.Items className="absolute overflow-hidden bg-white rounded-sm shadow-lg -right-1 dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
        {exports.map(({ format, filename, url }, index) => (
          <Menu.Item key={index}>
            <Download
              className="block p-3 no-underline hover:bg-stone-700 dark:hover:bg-stone-200 hover:text-white dark:hover:text-black"
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
