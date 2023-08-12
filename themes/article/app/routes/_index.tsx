import { ProjectPageCatchBoundary, responseNoArticle, responseNoSite } from '@myst-theme/site';
import Page, { ArticlePageAndNavigation } from './$';
import { getConfig, getPage } from '../utils/loaders.server';
import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
export { links } from './$';

export const loader: LoaderFunction = async ({ params, request }) => {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = config?.projects?.[0];
  if (!project) throw responseNoArticle();
  if (project.slug) return redirect(`/${project.slug}`);
  const page = await getPage(request, { slug: project.index });
  return page;
};

export default Page;

export function CatchBoundary() {
  return (
    <ArticlePageAndNavigation>
      <main className="article">
        <ProjectPageCatchBoundary />
      </main>
    </ArticlePageAndNavigation>
  );
}
