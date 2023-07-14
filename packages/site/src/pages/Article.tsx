import React from 'react';
import { ReferencesProvider } from '@myst-theme/providers';
import { Bibliography, ContentBlocks, FooterLinksBlock } from '../components';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound';
import { ErrorProjectNotFound } from './ErrorProjectNotFound';
import type { PageLoader } from '../types';
import type { GenericParent } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import {
  useComputeOptions,
  ExecuteScopeProvider,
  BusyScopeProvider,
  NotebookToolbar,
  ConnectionStatusTray,
  BinderBadge,
  useCanCompute,
} from '@myst-theme/jupyter';
import { FrontmatterBlock } from '@myst-theme/frontmatter';

export const ArticlePage = React.memo(function ({ article }: { article: PageLoader }) {
  const canCompute = useCanCompute(article);
  const { binderBadgeUrl } = useComputeOptions();
  const { hide_title_block, hide_footer_links } = (article.frontmatter as any)?.design ?? {};

  // take binder url from article frontmatter or fallback to project
  const binderUrl = article.frontmatter.binder ?? binderBadgeUrl;

  return (
    <ReferencesProvider
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider contents={article}>
          {!hide_title_block && (
            <FrontmatterBlock
              kind={article.kind}
              frontmatter={article.frontmatter}
              className="mb-8"
            />
          )}
          {binderUrl && !canCompute && (
            <div className="flex justify-end">
              <BinderBadge binder={binderUrl} />
            </div>
          )}
          {canCompute && article.kind === SourceFileKind.Notebook && <NotebookToolbar showLaunch />}
          {/* {canCompute && article.kind === SourceFileKind.Article && <NotebookToolbar />} */}
          <ContentBlocks pageKind={article.kind} mdast={article.mdast as GenericParent} />
          <Bibliography />
          <ConnectionStatusTray />
          {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ReferencesProvider>
  );
});

export function ProjectPageCatchBoundary() {
  return <ErrorProjectNotFound />;
}

export function ArticlePageCatchBoundary() {
  return <ErrorDocumentNotFound />;
}
