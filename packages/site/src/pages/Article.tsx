import { ReferencesProvider } from '@myst-theme/providers';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { Bibliography, ContentBlocks, FooterLinksBlock } from '../components';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound';
import { ErrorProjectNotFound } from './ErrorProjectNotFound';
import type { PageLoader } from '../types';
import { KINDS } from '../types';
import { ThebeSessionProvider } from 'thebe-react';
import type { GenericParent } from 'myst-common';
import { EnableCompute } from './EnableCompute';
import { NotebookRunAll } from '../components/NotebookRunAll';
import { NotebookProvider } from './NotebookProvider';

export function ArticlePage({ article }: { article: PageLoader }) {
  const { hide_title_block, hide_footer_links } = (article.frontmatter as any)?.design ?? {};
  const isJupyter = article?.kind && article.kind === KINDS.Notebook;
  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <ThebeSessionProvider start name={article.slug}>
        {!hide_title_block && (
          <FrontmatterBlock kind={article.kind} frontmatter={article.frontmatter} />
        )}
        <NotebookProvider siteConfig={false} page={article}>
          {/* will slug always be a valid session name? */}

          {/**
           * Added this compute here for now, it introduces a dep. on thebe-react in this package.
           * Should this stay here? where will server configuration be specified in future?
           * per article frontmatter? per site configuration?
           */}
          <div className="flex">
            {isJupyter && <div className="flex-grow"></div>}
            {isJupyter && (
              <EnableCompute canCompute={true}>
                <NotebookRunAll />
              </EnableCompute>
            )}
          </div>
          <ContentBlocks name={article.slug} mdast={article.mdast as GenericParent} />
          <Bibliography />
          {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
        </NotebookProvider>
      </ThebeSessionProvider>
    </ReferencesProvider>
  );
}

export function ProjectPageCatchBoundary() {
  return <ErrorProjectNotFound />;
}

export function ArticlePageCatchBoundary() {
  return <ErrorDocumentNotFound />;
}
