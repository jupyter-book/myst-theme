import React from 'react';
import { ReferencesProvider } from '@myst-theme/providers';
import { Bibliography, ContentBlocks, FooterLinksBlock } from '../components';
import { ErrorDocumentNotFound } from './ErrorDocumentNotFound';
import { ErrorProjectNotFound } from './ErrorProjectNotFound';
import type { PageLoader } from '../types';
import type { GenericParent } from 'myst-common';
import { SourceFileKind } from 'myst-common';
import { EnableCompute } from '../components/EnableCompute';
import { NotebookRunAll } from '../components/ComputeControls';
import {
  NotebookProvider,
  BinderBadge,
  useComputeOptions,
  ConnectionStatusTray,
} from '@myst-theme/jupyter';
import { NotebookProvider, BinderBadge, useComputeOptions } from '@myst-theme/jupyter';
import { useComputeOptions } from '@myst-theme/jupyter';
import { useExecuteScope } from './execute/hooks';
import {
  useComputeOptions,
  useExecuteScope,
  ExecuteScopeProvider,
  BusyScopeProvider,
} from '@myst-theme/jupyter';
import { ComputeToolbar } from '../components/ComputeToolbar';

function Scope({ slug }: { slug: string }) {
  const { state } = useExecuteScope();

  const keys = Object.keys(state.mdast);
  return (
    <div className="fixed bottom-2 right-3 z-[1000] group/scope">
      <div className="px-1 text-xs text-center text-white rounded-md bg-neutral-500">scope</div>
      <div className="w-max max-w-[900px] max-h-[600px] overflow-auto absolute bottom-0 right-0 z-50 invisible group-hover/scope:visible border rounded bg-white p-2">
        <div>current slug: {slug}</div>
        <div>mdast keys: {keys.join(', ')}</div>
        <div>builds:</div>
        <pre className="my-0">{JSON.stringify(state.builds, null, 2)}</pre>
        <div>renderings:</div>
        <pre className="my-0">
          {JSON.stringify(
            Object.fromEntries(
              Object.entries(state.renderings).map(([k, r]) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { scopes, ...rest } = r;
                return [
                  k,
                  {
                    ...rest,
                    scopes: Object.fromEntries(
                      Object.entries(scopes).map(([s, scope]) => [
                        s,
                        Object.fromEntries(Object.entries(scope).map(([kk, v]) => [kk, !!v])),
                      ]),
                    ),
                  },
                ];
              }),
            ),
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
}

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
      <ExecuteScopeProvider contents={article}>
        <BusyScopeProvider>
          <ComputeToolbar slug={article.slug} />
          <ContentBlocks pageKind={article.kind} mdast={article.mdast as GenericParent} />
          <Bibliography />
          {!hide_footer_links && <FooterLinksBlock links={article.footer} />}
          <Scope slug={article.slug} />
        </BusyScopeProvider>
      </ExecuteScopeProvider>
    </ReferencesProvider>
  );
});

export function ProjectPageCatchBoundary() {
  return <ErrorProjectNotFound />;
}

export function ArticlePageCatchBoundary() {
  return <ErrorDocumentNotFound />;
}
