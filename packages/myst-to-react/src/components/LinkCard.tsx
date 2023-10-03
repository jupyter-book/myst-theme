import { useLinkProvider, useBaseurl, withBaseurl } from '@myst-theme/providers';
import { ArrowTopRightOnSquareIcon as ExternalLinkIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';

export function LinkCard({
  url,
  title,
  internal = false,
  loading = false,
  description,
  thumbnail,
  className = 'w-[300px] sm:max-w-[500px] bg-white rounded shadow-md',
}: {
  url: string;
  internal?: boolean;
  loading?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  thumbnail?: string | null;
  className?: string;
}) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const to = withBaseurl(url, baseurl);
  return (
    <div
      className={classNames('hover-card-content rounded overflow-hidden', className, {
        'animate-pulse': loading,
      })}
    >
      {!loading && thumbnail && (
        <img src={thumbnail} className="w-full h-[150px] object-cover object-top object-left m-0" />
      )}
      {loading && <div className="animate-pulse bg-slate-100 dark:bg-slate-800 w-full h-[150px]" />}
      {internal && (
        <Link
          to={to}
          className="block px-3 mt-3 text-sm font-semibold text-inherit hover:text-inherit"
          prefetch="intent"
        >
          {title}
        </Link>
      )}
      {!internal && (
        <a
          href={to}
          className="block px-3 mt-3 text-sm font-semibold text-inherit hover:text-inherit"
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLinkIcon width="1rem" height="1rem" className="float-right" />
          {title}
        </a>
      )}
      {!loading && description && (
        <div className="p-3 prose text-sm max-h-[300px] overflow-hidden">{description}</div>
      )}
    </div>
  );
}
