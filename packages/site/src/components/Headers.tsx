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

export function ArticleHeader({ frontmatter }: { frontmatter: PageFrontmatter }) {
  const grid = useGridSystemProvider();
  const { subject, venue, biblio, ...rest } = frontmatter ?? {};
  return (
    <header
      className={classNames('w-full relative pt-[2rem] col-screen article', grid, 'subgrid-gap', {
        'bg-no-repeat bg-cover bg-top': frontmatter?.banner,
        'pb-[4rem] min-h-[300px]': frontmatter?.banner,
      })}
      style={{
        backgroundImage: frontmatter?.banner ? `url(${frontmatter?.banner})` : undefined,
      }}
    >
      {frontmatter?.banner && (
        <div className="absolute border-white shadow-2xl bg-white/80 dark:bg-black/80 backdrop-blur top-[2rem] h-[calc(100%-4rem)] w-full col-screen md:col-screen-inset pointer-events-none"></div>
      )}
      <div
        className={classNames('flex w-full align-middle z-10 py-2 mb-[1rem] text-sm', {
          'col-screen md:col-screen-inset px-4': frontmatter?.banner,
          'col-page-right': !frontmatter?.banner,
          'bg-white/80 dark:bg-black/80': frontmatter?.banner,
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
        <LicenseBadges license={frontmatter?.license} />
        <OpenAccessBadge open_access={frontmatter?.open_access} />
        <GitHubLink github={frontmatter?.github} />
      </div>
      <FrontmatterBlock
        frontmatter={rest}
        authorStyle="list"
        className={classNames('z-10', { 'pt-4': frontmatter?.banner })}
        hideBadges
        hideExports
      />
    </header>
  );
}
