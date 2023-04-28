import { ProjectPageCatchBoundary } from '@myst-theme/site';
import Page, { ArticlePageAndNavigation } from './$project.$slug';
export { loader, links } from './$project.$slug';
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
