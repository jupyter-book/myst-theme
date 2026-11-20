import {
  KatexCSS,
  getMetaTagsForArticle,
  responseNoArticle,
  responseNoSite,
} from '@myst-theme/site';
import { getConfig, getPage } from '~/utils/loaders.server';
import { getProject } from '@myst-theme/common';
import { ProjectProvider } from '@myst-theme/providers';
import { Deck } from '../components/Deck';
import { DeckList, deckPages } from '../components/DeckList';
export { ErrorBoundary } from './$';

import type { Route } from './+types/_index';

export async function loader({ request }: Route.LoaderArgs) {
  const config = await getConfig();
  if (!config) throw responseNoSite();
  const project = getProject(config);
  if (!project) throw responseNoArticle();
  const page = await getPage(request, { slug: project.index });
  return { config, page, project };
}

export function meta({ loaderData, location }: Route.MetaArgs) {
  if (!loaderData) return [];
  const { config, project } = loaderData;
  return getMetaTagsForArticle({
    origin: '',
    url: location.pathname,
    title: config?.title ?? project.title,
    description: config.description ?? project.description ?? undefined,
    image: (project.thumbnailOptimized || project.thumbnail) ?? undefined,
    keywords: config.keywords ?? project.keywords ?? [],
    twitter: config?.options?.twitter,
  });
}

export function links(): ReturnType<Route.LinksFunction> {
  return [KatexCSS];
}

/** A single-page project is one deck; otherwise the index page lists the decks. */
export default function Index({ loaderData }: Route.ComponentProps) {
  const { page, project } = loaderData;
  return (
    <ProjectProvider>
      {deckPages(project).length > 0 ? (
        <DeckList article={page} project={project} />
      ) : (
        <Deck article={page} />
      )}
    </ProjectProvider>
  );
}
