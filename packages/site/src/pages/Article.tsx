import React from 'react';
import { ReferencesProvider } from '@myst-theme/providers';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { Bibliography, ContentBlocks, FooterLinksBlock } from '../components';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound';
import { ErrorProjectNotFound } from './ErrorProjectNotFound';
import type { PageLoader } from '../types';
import { ThebeRenderMimeRegistryProvider, ThebeSessionProvider } from 'thebe-react';
import type { GenericParent } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import { EnableCompute } from '../components/EnableCompute';
import { NotebookRunAll } from '../components/ComputeControls';
import { NotebookProvider, BinderBadge, useComputeOptions } from '@myst-theme/jupyter';

export const ArticlePage = React.memo(function ({ article }: { article: PageLoader }) {
  const computeOptions = useComputeOptions();
  const canCompute = computeOptions.canCompute && (article.frontmatter as any)?.thebe !== false;
  const { hide_title_block, hide_footer_links, binder } =
    (article.frontmatter as any)?.design ?? {};
  const isJupyter = article?.kind && article.kind === SourceFileKind.Notebook;
  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <ThebeRenderMimeRegistryProvider>
        <ThebeSessionProvider start={false} name={article.slug}>
          {!hide_title_block && (
            <FrontmatterBlock kind={article.kind} frontmatter={article.frontmatter} />
          )}
          <NotebookProvider siteConfig={false} page={article}>
            <div className="flex items-center">
              <div className="flex-grow"></div>
              {binder && <BinderBadge binder={binder} />}
              {canCompute && isJupyter && (
                <EnableCompute canCompute={true} key={article.slug}>
                  <NotebookRunAll />
                </EnableCompute>
              )}
            </div>
            <ContentBlocks pageKind={article.kind} mdast={article.mdast as GenericParent} />
            <Bibliography />
            {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
          </NotebookProvider>
        </ThebeSessionProvider>
      </ThebeRenderMimeRegistryProvider>
    </ReferencesProvider>
  );
});

export function ProjectPageCatchBoundary() {
  return <ErrorProjectNotFound />;
}

export function ArticlePageCatchBoundary() {
  return <ErrorDocumentNotFound />;
}
