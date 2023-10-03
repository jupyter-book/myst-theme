import { default as useSWR } from 'swr';
import {
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  PlusCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { HoverPopover, LinkCard } from '../components/index.js';
import React, { useEffect, useState } from 'react';
import { CodeBlock } from '../code.js';
import classNames from 'classnames';

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => {
    if (res.status === 200) return res.text();
    throw new Error(`Content returned with status ${res.status}.`);
  });

const jsonFetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => {
    if (res.status === 200) return res.json();
    throw new Error(`Content returned with status ${res.status}.`);
  });

function extToLanguage(ext?: string): string | undefined {
  return (
    {
      ts: 'typescript',
      js: 'javascript',
      py: 'python',
      md: 'markdown',
      yml: 'yaml',
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
      <div className="hover-document article w-[500px] sm:max-w-[500px]">
        <a
          href={url}
          className="block text-inherit hover:text-inherit"
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLinkIcon width="1rem" height="1rem" className="float-right" />
        </a>
        <div className="mt-2">Error loading "{file}" from GitHub.</div>
      </div>
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
      className="hover-document article max-w-[80vw]"
    />
  );
}

// https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
function useWhiteTextColor(bgColor: string): boolean {
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16); // hexToR
  const g = parseInt(color.substring(2, 4), 16); // hexToG
  const b = parseInt(color.substring(4, 6), 16); // hexToB
  return r * 0.299 + g * 0.587 + b * 0.114 <= 186;
}

function GithubIssuePreview({
  url,
  org,
  repo,
  issue_number,
  open,
}: {
  url: string;
  org: string;
  repo: string;
  issue_number?: string | number;
  open: boolean;
}) {
  const { data, error } = useLoadWhenOpen(
    open,
    `https://api.github.com/repos/${org}/${repo}/issues/${issue_number}`,
    jsonFetcher,
  );
  if (!data && !error) {
    return (
      <div className="hover-document article w-[500px] sm:max-w-[500px] animate-pulse">
        Loading...
      </div>
    );
  }
  const resp = data as unknown as Record<string, any>;
  if (error) {
    return (
      <div className="hover-document article">
        <a
          href={url}
          className="block text-inherit hover:text-inherit"
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLinkIcon className="float-right w-4 h-4" />
        </a>
        <div className="mt-2">Error loading from GitHub.</div>
      </div>
    );
  }
  const dateString = new Date(resp.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <div className="hover-document article w-[400px] sm:max-w-[400px] p-3">
      <div className="text-xs font-light">
        {org}/{repo}
      </div>
      <div className="my-2 text-lg font-bold dark:text-white">
        {resp.state === 'open' && (
          <PlusCircleIcon
            width="1.5rem"
            height="1.5rem"
            className="inline-block mr-2 text-green-700 -translate-y-px dark:text-green-500"
          />
        )}
        {resp.state === 'closed' && (
          <CheckCircleIcon
            width="1.5rem"
            height="1.5rem"
            className="inline-block mr-2 text-purple-700 -translate-y-px dark:text-purple-500"
          />
        )}
        {resp.title}
      </div>
      <div className="text-xs font-light">
        #{issue_number} opened on {dateString} by{' '}
        <span className="font-normal">@{resp.user.login}</span>
      </div>
      <p className="text-md max-h-[4rem] overflow-hidden">{resp.body}</p>
      {resp.labels?.length > 0 && (
        <div className="flex flex-wrap">
          {resp.labels?.map((label: any) => (
            <span
              key={label.id}
              className={classNames(
                'mr-1 text-xs inline-flex items-center px-2 py-0.5 rounded-full',
                {
                  'text-white': useWhiteTextColor(label.color),
                },
              )}
              style={{ backgroundColor: `#${label.color}` }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function GithubLink({
  kind,
  children,
  url,
  org,
  repo,
  raw,
  file,
  from,
  to,
  issue_number,
}: {
  children: React.ReactNode;
  kind: 'file' | 'issue';
  url: string;
  raw: string;
  org: string;
  repo: string;
  file: string;
  from?: number;
  issue_number?: string | number;
  to?: number;
}) {
  return (
    <HoverPopover
      card={({ load }) => {
        if (kind === 'file') {
          return (
            <GithubFilePreview
              url={url}
              raw={raw}
              file={file}
              from={from}
              to={to}
              open={load}
              org={org}
              repo={repo}
            />
          );
        }
        if (kind === 'issue') {
          return (
            <GithubIssuePreview
              url={url}
              open={load}
              org={org}
              issue_number={issue_number}
              repo={repo}
            />
          );
        }
      }}
    >
      <a href={url} className="italic" target="_blank" rel="noreferrer">
        {children}
      </a>
    </HoverPopover>
  );
}
