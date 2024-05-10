import { default as useSWR } from 'swr';
import { HoverPopover } from '../components/index.js';
import { MyST } from '../MyST.js';
import type { GenericNode } from 'myst-common';
import { RorIcon } from '@scienceicons/react/24/solid';

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => {
    if (res.status === 200) return res.json();
    throw new Error(`Content returned with status ${res.status}.`);
  });

function RORChild({ ror }: { ror: string }) {
  const { data, error } = useSWR(`https://api.ror.org/organizations/${ror}`, fetcher);
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
  const country_name = data?.country?.country_name;
  const basicLinks =
    (data?.links.map((url: string) => ({ url })) as { url: string; text?: string }[]) ?? [];
  const wikiLink = data.wikipedia_url
    ? [{ text: 'Wikipedia', url: data.wikipedia_url as string }]
    : [];
  const links = [...basicLinks, ...wikiLink];
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
      <div className="mb-4 text-xl font-bold">{data.name}</div>
      <dl className="mb-4 text-sm">
        <dt>Country</dt>
        <dd>{country_name}</dd>
        {links.length > 0 && (
          <>
            <dt>Links</dt>
            {links.map(({ url, text }) => (
              <dd>
                <a href={url}>{text || url}</a>
              </dd>
            ))}
          </>
        )}
        {data.acronyms?.length > 0 && (
          <>
            <dt>Acronyms</dt>
            {data.acronyms.map((text: string) => (
              <dd>{text}</dd>
            ))}
          </>
        )}
        {data.labels?.length > 0 && (
          <>
            <dt>Labels</dt>
            {data.labels.map(({ label, iso639 }: { label: string; iso639?: string }) => (
              <dd>
                {label}
                {iso639 ? ` (${iso639})` : null}
              </dd>
            ))}
          </>
        )}
      </dl>
    </div>
  );
}

export function RORLink({ node, ror }: { node: GenericNode; ror: string }) {
  return (
    <HoverPopover card={<RORChild ror={ror} />}>
      <a href={`https://ror.org/${ror}`} target="_blank" rel="noopener noreferrer">
        <MyST ast={node.children} />
      </a>
    </HoverPopover>
  );
}
