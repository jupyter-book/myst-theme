import type { PageLoader } from '@myst-theme/common';
import type { SiteManifest } from 'myst-config';
import { ArticleProvider, useBaseurl, useLinkProvider } from '@myst-theme/providers';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { MyST } from 'myst-to-react';
import { slugToUrl } from 'myst-common';

type ManifestProject = Required<SiteManifest>['projects'][0];

export function deckPages(project: ManifestProject) {
  return project.pages.filter((page): page is typeof page & { slug: string } => 'slug' in page);
}

/** The index page as an article, followed by links to the other decks. */
export function DeckList({ article, project }: { article: PageLoader; project: ManifestProject }) {
  const Link = useLinkProvider();
  const baseurl = useBaseurl() ?? '';
  return (
    <ArticleProvider
      kind={article.kind}
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <main className="max-w-3xl px-6 py-12 mx-auto prose dark:prose-invert">
        <FrontmatterBlock
          frontmatter={article.frontmatter}
          hideBadges
          hideExports
          className="mb-8"
        />
        <MyST ast={article.mdast.children} />
        <ul className="myst-deck-list">
          {deckPages(project).map((page) => (
            <li key={page.slug}>
              <Link to={`${baseurl}/${slugToUrl(page.slug)}`}>{page.title}</Link>
              {page.description && <div className="text-sm opacity-70">{page.description}</div>}
            </li>
          ))}
        </ul>
      </main>
    </ArticleProvider>
  );
}
