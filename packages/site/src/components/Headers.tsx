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
import { ThemeButton } from './Navigation/index.js';

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
  const positionBackground = {
    'col-page-right': grid === 'article-left-grid',
    'col-page': grid === 'article-grid',
  };
  const positionFrontmatter = {
    'col-body': grid === 'article-left-grid',
    'col-page-left': grid === 'article-grid',
  };
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
        />
      )}
      <div
        className={classNames(
          'w-full relative col-screen article',
          grid,
          'subgrid-gap',
          {
            'my-[2rem] pb-[1rem] md:my-[4rem]': frontmatter?.banner,
            'my-[2rem]': !frontmatter?.banner,
          },
          className,
        )}
      >
        <div
          className={classNames(positionBackground, {
            'shadow-2xl bg-white/80 dark:bg-black/80 backdrop-blur': frontmatter?.banner,
          })}
        >
          <div
            className={classNames('flex w-full align-middle py-2 mb-[1rem] text-sm', {
              'px-4 w-full': frontmatter?.banner,
              'bg-white/80 dark:bg-black/80': frontmatter?.banner,
              ...positionBackground,
            })}
          >
            {subject && <div className={classNames('flex-none pr-2 smallcaps')}>{subject}</div>}
            <Journal venue={venue} biblio={biblio} className="hidden pl-2 border-l md:block" />
            <div className="flex-grow"></div>
            <div className="hidden sm:block">
              <LicenseBadges license={frontmatter?.license} />
              <OpenAccessBadge open_access={frontmatter?.open_access} />
              <GitHubLink github={frontmatter?.github} />
            </div>
            {toggleTheme && <ThemeButton className="inline-block w-5 h-5 mt-0.5 ml-1" />}
          </div>
          <div className="flex flex-col mb-10 md:flex-row">
            <FrontmatterBlock
              frontmatter={rest}
              authorStyle="list"
              className={classNames('flex-grow', {
                'pt-4 px-6': frontmatter?.banner,
                ...positionFrontmatter,
              })}
              hideBadges
              hideExports
            />
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
