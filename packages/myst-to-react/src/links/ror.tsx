import { default as useSWR } from 'swr';
import { HoverPopover } from '../components/index.js';
import { MyST } from '../MyST.js';
import type { GenericNode } from 'myst-common';
import { RorIcon } from '@scienceicons/react/24/solid';
import classNames from 'classnames';
import { useMemo } from 'react';

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => {
    if (res.status === 200) return res.json();
    throw new Error(`Content returned with status ${res.status}.`);
  }) as Promise<RORRecord>;

type RORRecord = {
  id: string;
  names: { lang: string | null; types: string[]; value: string }[];
  locations: {
    geonames_id: number;
    geonames_details: { country_code: string; country_name: string };
  }[];
  links: {
    type: string;
    value: string;
  }[];
};

function RORChild({ ror }: { ror: string }) {
  const { data, error } = useSWR(`https://api.ror.org/v2/organizations/${ror}`, fetcher);
  const name = useMemo(
    () => data?.names.find((n) => n.types.includes('ror_display'))?.value,
    [data],
  );
  const countryName = useMemo(() => data?.locations[0]?.geonames_details.country_name, [data]);
  const links = useMemo(() => data?.links ?? [], [data]);
  const labels = useMemo(() => data?.names.filter((n) => n.types.includes('label')) ?? [], [data]);
  const acronyms = useMemo(
    () => data?.names.filter((n) => n.types.includes('acronym')) ?? [],
    [data],
  );
  if (!data && !error) {
    return (
      <div className="hover-document article w-[500px] sm:max-w-[500px] animate-pulse">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="hover-document article w-[500px] sm:max-w-[500px]">Error loading {ror}.</div>
    );
  }
  return (
    <div className="hover-document article w-[500px] sm:max-w-[500px] p-3">
      <p className="flex items-stretch gap-2 text-sm font-light">
        <RorIcon width="1.25rem" height="1.25rem" className="self-center inline-block" />
        <a
          href={`https://ror.org/${ror}`}
          className="self-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <code>{ror}</code>
        </a>
      </p>
      <div className="mb-4 text-xl font-bold">{name}</div>
      <dl className="mb-4 text-sm">
        {countryName && (
          <>
            <dt>Country</dt>
            <dd>{countryName}</dd>
          </>
        )}
        {links.length > 0 && (
          <>
            <dt>Links</dt>
            {links.map(({ type, value }) => (
              <dd>
                <a href={value}>{type === 'wikipedia' ? 'Wikipedia' : value}</a>
              </dd>
            ))}
          </>
        )}
        {acronyms?.length > 0 && (
          <>
            <dt>Acronyms</dt>
            {acronyms.map(({ value }) => (
              <dd>{value}</dd>
            ))}
          </>
        )}
        {labels?.length > 0 && (
          <>
            <dt>Labels</dt>
            {labels.map(({ value, lang }) => (
              <dd>
                {value}
                {lang ? ` (${lang})` : null}
              </dd>
            ))}
          </>
        )}
      </dl>
    </div>
  );
}

export function RORLink({
  node,
  ror,
  className,
}: {
  node: GenericNode;
  ror: string;
  className?: string;
}) {
  return (
    <HoverPopover card={<RORChild ror={ror} />}>
      <a
        href={`https://ror.org/${ror}`}
        target="_blank"
        rel="noopener noreferrer"
        className={classNames('hover-link', className)}
      >
        <MyST ast={node.children} />
      </a>
    </HoverPopover>
  );
}
