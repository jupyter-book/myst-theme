import { default as useSWR } from 'swr';
import { HoverPopover } from '../components/index.js';

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => {
    if (res.status === 200) return res.json();
    throw new Error(`Content returned with status ${res.status}.`);
  });

function RRIDChild({ rrid }: { rrid: string }) {
  const { data, error } = useSWR(`https://scicrunch.org/resolver/${rrid}.json`, fetcher);
  if (!data && !error) {
    return (
      <div className="hover-document article w-[500px] sm:max-w-[500px] animate-pulse">
        Loading...
      </div>
    );
  }
  const hit = data?.hits?.hits?.[0];
  if (error || !hit) {
    return (
      <div className="hover-document article w-[500px] sm:max-w-[500px]">Error loading {rrid}.</div>
    );
  }
  const {
    name: title,
    curie,
    description,
    supercategory,
    keywords,
    types: categories,
  } = hit?._source?.item ?? {};
  const category = supercategory?.[0]?.name;
  const types = (categories?.map(({ name }: { name: string }) => name) as string[]) ?? [];
  const tags = (keywords?.map(({ keyword }: { keyword: string }) => keyword) as string[]) ?? [];
  return (
    <div className="hover-document article w-[500px] sm:max-w-[500px] p-3">
      <p className="text-sm font-light">RRID: {category}</p>
      <div className="mb-4 text-xl font-bold">
        {title} <code>{curie}</code>
      </div>
      <p className="text-md">{description}</p>
      {types.length > 0 && (
        <>
          <div className="my-2 text-xs font-thin">Categories</div>
          <div className="flex flex-wrap ml-1">
            {types?.map((tag) => (
              <span className="inline-flex items-center px-3 py-1 ml-1 text-xs uppercase border rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
      {tags.length > 0 && (
        <>
          <div className="my-2 text-xs font-thin">Tags</div>
          <div className="flex flex-wrap ml-1">
            {tags?.map((tag) => (
              <span className="inline-flex items-center px-3 py-1 ml-1 text-xs uppercase border rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function RRIDLink({ rrid }: { rrid: string }) {
  return (
    <HoverPopover card={<RRIDChild rrid={rrid} />}>
      <a href={`https://scicrunch.org/resolver/${rrid}`} target="_blank" rel="noopener noreferrer">
        RRID: <cite className="italic">{rrid}</cite>
      </a>
    </HoverPopover>
  );
}
