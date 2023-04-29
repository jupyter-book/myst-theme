import { ProjectPageCatchBoundary } from '@myst-theme/site';
import Page, { ArticlePageAndNavigation } from './$project.$slug';
export { loader, links } from './$project.$slug';

// TODO render something that can give us a ProjectContext
// around the Page
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
