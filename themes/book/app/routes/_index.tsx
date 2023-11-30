import { KatexCSS, responseNoArticle, responseNoSite } from '@myst-theme/site';
import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { getConfig, getPage } from '~/utils/loaders.server';
import Page from './$';

export const links: LinksFunction = () => [KatexCSS];

export const loader: LoaderFunction = async ({ params, request }) => {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = config?.projects?.[0];
  if (!project) throw responseNoArticle();
  if (project.slug) return redirect(`/${project.slug}`);
  const page = await getPage(request, { slug: project.index });
  return { page, project };
};

export default Page;
