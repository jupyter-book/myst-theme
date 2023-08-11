import React from 'react';
import type { GenericNode } from 'myst-common';
import { SourceFileKind } from 'myst-spec-ext';
import { useCellExecution } from './execute';
import {
  ArticleResetNotebook,
  ArticleRunNotebook,
  ArticleStatusBadge,
} from './controls/ArticleCellControls';
import { JupyterIcon } from '@scienceicons/react/24/solid';
import { useLinkProvider, useBaseurl, withBaseurl } from '@myst-theme/providers';

const PlaceholderContext = React.createContext<{ placeholder?: GenericNode }>({});

function PlaceholderProvider({
  placeholder,
  children,
}: React.PropsWithChildren<{ placeholder?: GenericNode }>) {
  const value = React.useMemo(() => ({ placeholder }), [placeholder]);
  return <PlaceholderContext.Provider value={value}>{children}</PlaceholderContext.Provider>;
}

export function usePlaceholder() {
  const context = React.useContext(PlaceholderContext);
  return context.placeholder;
}

export function OutputDecoration({
  outputId,
  placeholder,
  children,
  title = 'Jupyter Notebook',
  url,
}: {
  outputId: string;
  placeholder?: GenericNode;
  children?: React.ReactNode;
  title?: string;
  url?: string;
}) {
  const { canCompute, kind } = useCellExecution(outputId);
  const Link = useLinkProvider();
  const baseurl = useBaseurl();
  const showComputeControls = canCompute && kind === SourceFileKind.Article;

  if (showComputeControls) {
    return (
      <div className="mb-4 shadow">
        <div className="sticky top-[60px] z-[2] w-full bg-gray-100/80 backdrop-blur dark:bg-neutral-800/80 py-1 px-2">
          <div className="flex items-center">
            <div className="flex items-center">
              <JupyterIcon width="1.25rem" height="1.25rem" className="inline-block" />
              <span className="ml-2">Source:</span>
              {url && (
                <Link
                  to={withBaseurl(url, baseurl)}
                  className="ml-2 no-underline text-normal hover:underline"
                >
                  {title}
                </Link>
              )}
            </div>
            <div className="flex-grow" />
            <ArticleStatusBadge id={outputId} />
            <ArticleRunNotebook id={outputId} />
            <ArticleResetNotebook id={outputId} />
          </div>
        </div>
        <PlaceholderProvider placeholder={placeholder}>{children}</PlaceholderProvider>
      </div>
    );
  }

  // light
  if (kind === SourceFileKind.Article) {
    return (
      <>
        <div className="flex items-center justify-end text-xs">
          <JupyterIcon width="0.75rem" height="0.75rem" className="inline-block" />
          <div className="ml-1">Source:</div>
          {url && (
            <Link
              to={withBaseurl(url, baseurl)}
              className="ml-1 no-underline text-normal hover:underline"
            >
              {title}
            </Link>
          )}
        </div>
        <PlaceholderProvider placeholder={placeholder}>{children}</PlaceholderProvider>
      </>
    );
  }

  // Notebook outputs do not need any decoration
  return <>{children}</>;
}
