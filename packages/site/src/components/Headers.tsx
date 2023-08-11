import {
  FrontmatterBlock,
  GitHubLink,
  Journal,
  LicenseBadges,
  OpenAccessBadge,
} from '@myst-theme/frontmatter';
import { useGridSystemProvider } from '@myst-theme/providers';
import classNames from 'classnames';
import type { PageFrontmatter } from 'myst-frontmatter';
import { ThemeButton } from './Navigation';

export function ArticleHeader({
  frontmatter,
  children,
  toggleTheme,
  className,
}: {
  frontmatter: PageFrontmatter;
  children?: React.ReactNode;
  toggleTheme?: boolean;
  className?: string;
}) {
  const grid = useGridSystemProvider();
  const { subject, venue, biblio, ...rest } = frontmatter ?? {};
  return (
    <header className="relative col-screen">
      {frontmatter?.banner && (
        // This is the banner contained in a full-bleed div
        <div
          className={classNames(
            'absolute',
            grid,
            'subgrid-gap col-screen bg-no-repeat bg-cover bg-top w-full h-full -z-10 pointer-events-none',
          )}
          style={{
            backgroundImage: `url(${frontmatter?.banner})`,
          }}
        >
          <div
            className={classNames(
              'absolute border-white shadow-2xl bg-white/80 dark:bg-black/80 backdrop-blur col-page-right',
              'w-full',
              'top-[2rem] h-[calc(100%-4rem)] md:top-[4rem] md:h-[calc(100%-8rem)]',
            )}
          />
        </div>
      )}
      <div
        className={classNames(
          'w-full relative col-screen article',
          grid,
          'subgrid-gap',
          {
            'my-[2rem] pb-[2rem] md:my-[4rem]': frontmatter?.banner,
            'my-[2rem]': !frontmatter?.banner,
          },
          className,
        )}
      >
        <div
          className={classNames('flex w-full align-middle py-2 mb-[1rem] text-sm', {
            'col-page-right px-4 w-full': frontmatter?.banner,
            'bg-white/80 dark:bg-black/80': frontmatter?.banner,
            'col-page-right': !frontmatter?.banner,
          })}
        >
          {subject && (
            <div
              className={classNames('flex-none pr-2 smallcaps', {
                'border-r mr-2': venue,
              })}
            >
              {subject}
            </div>
          )}
          <Journal venue={venue} biblio={biblio} />
          <div className="flex-grow"></div>
          <div className="hidden sm:block">
            <LicenseBadges license={frontmatter?.license} />
            <OpenAccessBadge open_access={frontmatter?.open_access} />
            <GitHubLink github={frontmatter?.github} />
          </div>
          {toggleTheme && <ThemeButton className="inline-block w-5 h-5 mt-0.5 ml-1" />}
        </div>
        <FrontmatterBlock
          frontmatter={rest}
          authorStyle="list"
          className={classNames({ 'pt-4 px-6': frontmatter?.banner })}
          hideBadges
          hideExports
        />
        {children}
      </div>
    </header>
  );
}
