import React from 'react';
import type { GenericNode } from 'myst-common';
import { SourceFileKind } from 'myst-spec-ext';
import { useCellExecution } from './execute/index.js';
import {
  ArticleResetNotebook,
  ArticleRunNotebook,
  ArticleStatusBadge,
} from './controls/ArticleCellControls.js';
import { JupyterIcon } from '@scienceicons/react/24/solid';
import { useLinkProvider, useBaseurl, withBaseurl, useThemeTop } from '@myst-theme/providers';
import { useComputeOptions } from './providers.js';

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
  remoteBaseUrl,
}: {
  outputId: string;
  placeholder?: GenericNode;
  children?: React.ReactNode;
  title?: string;
  url?: string;
  remoteBaseUrl?: string;
}) {
  const { kind } = useCellExecution(outputId);
  const compute = useComputeOptions();
  const Link = useLinkProvider();
  const top = useThemeTop();
  const baseurl = useBaseurl();
  const showComputeControls =
    compute?.enabled &&
    compute?.features.figureCompute &&
    kind === SourceFileKind.Article &&
    !remoteBaseUrl;

  if (showComputeControls) {
    return (
      <div
        data-name="output-decoration-with-compute-ctrls"
        className="mb-4 shadow myst-jp-output-deco"
      >
        <div
          className="myst-jp-output-deco-header sticky z-[2] w-full bg-gray-100/80 backdrop-blur dark:bg-neutral-800/80 py-1 px-2"
          style={{ top }}
        >
          <div className="flex items-center myst-jp-output-deco-inner">
            <div className="flex items-center myst-jp-output-deco-source">
              <JupyterIcon width="1.25rem" height="1.25rem" className="inline-block" />
              <span className="ml-2 myst-jp-output-deco-label">Source:</span>
              {url && (
                <Link
                  to={withBaseurl(url, remoteBaseUrl ?? baseurl)}
                  className="ml-2 no-underline myst-jp-output-deco-link text-normal hover:underline"
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
      <div data-name="output-decoration-article">
        <div className="flex justify-end items-center text-xsmyst-jp-output-deco-light">
          <JupyterIcon width="0.75rem" height="0.75rem" className="inline-block" />
          <div className="ml-1 myst-jp-output-deco-label">Source:</div>
          {url && (
            <Link
              to={withBaseurl(url, remoteBaseUrl ?? baseurl)}
              className="ml-1 no-underline myst-jp-output-deco-link text-normal hover:underline"
            >
              {title}
            </Link>
          )}
        </div>
        <PlaceholderProvider placeholder={placeholder}>{children}</PlaceholderProvider>
      </div>
    );
  }

  // Notebook outputs do not need any decoration
  return <div data-name="output-decoration-notebook-output">{children}</div>;
}
