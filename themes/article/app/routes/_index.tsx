import { ProjectPageCatchBoundary } from '@myst-theme/site';
import Page, { ArticlePageAndNavigation } from './$slug';
export { loader, links } from './$slug';
export default Page;

export function CatchBoundary() {
  return (
    <ArticlePageAndNavigation>
      <main className="article-content">
        <ProjectPageCatchBoundary />
      </main>
    </ArticlePageAndNavigation>
  );
}
