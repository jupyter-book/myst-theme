import useSWR from 'swr';
import { ArrowTopRightOnSquareIcon as ExternalLinkIcon } from '@heroicons/react/24/outline';
import { HoverPopover } from '../components/HoverPopover';
import { LinkCard } from '../components/LinkCard';
import React, { useEffect, useState } from 'react';
import { CodeBlock } from '../code';

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => {
    if (res.status === 200) return res.text();
    throw new Error(`Content returned with status ${res.status}.`);
  });

function extToLanguage(ext?: string): string | undefined {
  return (
    {
      ts: 'typescript',
      js: 'javascript',
      py: 'python',
    }[ext ?? ''] ?? ext
  );
}

function useLoadWhenOpen(open: boolean, url: string, loader: (...args: any[]) => any) {
  const [cached, setCached] = useState<string>();
  const { data, error } = useSWR(open ? url : null, loader);
  useEffect(() => {
    setCached(cached || data);
  }, [cached, url, data]);
  return { data: cached, error };
}

function GithubFilePreview({
  url,
  raw,
  org,
  repo,
  file,
  from,
  to,
  open,
}: {
  url: string;
  raw: string;
  file: string;
  org: string;
  repo: string;
  from?: number;
  to?: number;
  open: boolean;
}) {
  const { data, error } = useLoadWhenOpen(open, raw, fetcher);
  let code = data;
  if (error) {
    return (
      <span>
        <a href={url} className="block" target="_blank" rel="noreferrer">
          <ExternalLinkIcon className="w-4 h-4 float-right" />
        </a>
        <div className="mt-2">Error loading "{file}" from GitHub.</div>
      </span>
    );
  }
  const lang = extToLanguage(file?.split('.').pop());

  let startingLineNumber = 1;
  let emphasizeLines: number[] = [];
  const offset = 5;
  if (code && from && to) {
    startingLineNumber = from;
    code = code
      ?.split('\n')
      .slice(from - 1, to)
      .join('\n');
  } else if (code && from) {
    startingLineNumber = from + 1 - offset;
    emphasizeLines = [from];
    code = code
      ?.split('\n')
      .slice(Math.max(0, from - offset), from + offset)
      .join('\n');
  } else {
    code = code?.split('\n').slice(0, 10).join('\n');
  }
  const description = code ? (
    <>
      <CodeBlock
        value={code}
        lang={lang}
        filename={file}
        showLineNumbers
        startingLineNumber={startingLineNumber}
        emphasizeLines={emphasizeLines}
        showCopy={false}
      />
    </>
  ) : null;
  return (
    <LinkCard
      loading={!code}
      url={url}
      title={`GitHub - ${org}/${repo}`}
      description={description}
      className="max-w-[80vw]"
    />
  );
}

export function GithubLink({
  children,
  url,
  org,
  repo,
  raw,
  file,
  from,
  to,
}: {
  children: React.ReactNode;
  url: string;
  raw: string;
  org: string;
  repo: string;
  file: string;
  from?: number;
  to?: number;
}) {
  return (
    <HoverPopover
      card={({ open }) => (
        <GithubFilePreview
          url={url}
          raw={raw}
          file={file}
          from={from}
          to={to}
          open={open}
          org={org}
          repo={repo}
        />
      )}
    >
      <a href={url} className="italic" target="_blank" rel="noreferrer">
        {children}
      </a>
    </HoverPopover>
  );
}
