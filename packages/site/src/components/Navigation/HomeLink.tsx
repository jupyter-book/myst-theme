import classNames from 'classnames';
import { useBaseurl, useLinkProvider, withBaseurl } from '@myst-theme/providers';

export function HomeLink({
  logo,
  logoDark,
  logoText,
  logoAlt,
  name,
  url,
}: {
  logo?: string;
  logoDark?: string;
  logoText?: string;
  logoAlt?: string;
  name?: string;
  url?: string;
}) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const nothingSet = !logo && !logoText;
  const altText = logoAlt ?? logoText ?? name;
  return (
    <Link
      className="myst-home-link flex items-center ml-3 dark:text-white w-fit md:ml-5 xl:ml-7"
      to={url ? url : withBaseurl('/', baseurl)}
      prefetch="intent"
    >
      {logo && (
        <div
          className={classNames('myst-home-link-logo mr-3 flex items-center', {
            'dark:bg-white dark:rounded px-1': !logoDark,
          })}
        >
          <img
            src={logo}
            className={classNames('h-9', { 'dark:hidden': !!logoDark })}
            alt={altText}
            height="2.25rem"
          ></img>
          {logoDark && (
            <img
              src={logoDark}
              className="hidden h-9 dark:block"
              alt={altText}
              height="2.25rem"
            ></img>
          )}
        </div>
      )}
      <span
        className={classNames('text-md sm:text-xl tracking-tight sm:mr-5', {
          'sr-only': !(logoText || nothingSet),
        })}
      >
        {logoText || 'Made with MyST'}
      </span>
    </Link>
  );
}
