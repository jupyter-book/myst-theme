import classNames from 'classnames';
import { useBaseurl, useLinkProvider, withBaseurl } from '@myst-theme/providers';

export function HomeLink({
  logo,
  logoDark,
  logoText,
  name,
}: {
  logo?: string;
  logoDark?: string;
  logoText?: string;
  name?: string;
}) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const nothingSet = !logo && !logoText;
  return (
    <Link
      className="flex items-center ml-3 dark:text-white w-fit md:ml-5 xl:ml-7"
      to={withBaseurl('/', baseurl)}
      prefetch="intent"
    >
      {logo && (
        <div
          className={classNames('p-1 mr-3', {
            'dark:bg-white dark:rounded': !logoDark,
          })}
        >
          <img
            src={logo}
            className={classNames('h-9', { 'dark:hidden': !!logoDark })}
            alt={logoText || name}
            height="2.25rem"
          ></img>
          {logoDark && (
            <img
              src={logoDark}
              className="hidden h-9 dark:block"
              alt={logoText || name}
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
