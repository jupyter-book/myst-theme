import { useMemo } from 'react';
import { Deck as RevealDeck, Slide, Stack } from '@revealjs/react';
import RevealNotes from 'reveal.js/plugin/notes';
import type { PageLoader } from '@myst-theme/common';
import { ArticleProvider, useBaseurl, useSiteManifest } from '@myst-theme/providers';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { ThemeButton } from '@myst-theme/site';
import {
  BusyScopeProvider,
  ComputeOptionsProvider,
  ConnectionStatusTray,
  ErrorTray,
  ExecuteScopeProvider,
  NotebookToolbar,
  ThebeLoaderAndServer,
  useComputeOptions,
} from '@myst-theme/jupyter';
import { SourceFileKind } from 'myst-spec-ext';
import { copyNode, extractPart, type GenericParent } from 'myst-common';
import { MyST } from 'myst-to-react';
import { splitSlides, type Slide as SlideData } from '../slides';
import { Credits, hasCredits } from './Credits';
import { References } from './References';
import type { TemplateOptions } from '../types';

const PLUGINS = [RevealNotes];

/** While a widget or form control has focus, keys go to it, not to slide navigation. */
function keyboardCondition(event: KeyboardEvent) {
  const target = event.target as Element | null;
  return !target?.closest?.(
    'input, select, textarea, [contenteditable], .jupyter-widgets, .myst-anywidget',
  );
}
const SLIDE_CLASS = 'prose';

function SlideView({ slide }: { slide: SlideData }) {
  return (
    <Slide {...slide.attrs} className={SLIDE_CLASS}>
      <MyST ast={slide.children} />
      {slide.notes.length > 0 && (
        <aside className="notes">
          <MyST ast={slide.notes} />
        </aside>
      )}
    </Slide>
  );
}

/** Page options override site options. */
export function useTemplateOptions(article: PageLoader): TemplateOptions {
  const site = useSiteManifest()?.options as TemplateOptions | undefined;
  const page = (article.frontmatter as any)?.site as TemplateOptions | undefined;
  return { ...site, ...page };
}

/** Code runs live when the project sets `jupyter` (a server, Binder or JupyterLite). */
export function Deck({ article }: { article: PageLoader }) {
  const baseurl = useBaseurl();
  return (
    <ComputeOptionsProvider
      features={{ notebookCompute: true, figureCompute: true, launchBinder: false }}
    >
      <ThebeLoaderAndServer baseurl={baseurl ?? ''}>
        <DeckSlides article={article} />
      </ThebeLoaderAndServer>
    </ComputeOptionsProvider>
  );
}

function DeckSlides({ article }: { article: PageLoader }) {
  const opts = useTemplateOptions(article);
  const compute = useComputeOptions();
  const live = !!compute?.enabled && article.kind === SourceFileKind.Notebook;
  const { columns, creditsPart } = useMemo(() => {
    const tree = copyNode(article.mdast) as GenericParent;
    // The `credits` part goes on the credit slide, not in the main slides.
    const creditsPart = extractPart(tree, 'credits', {
      requireExplicitPart: true,
      frontmatterParts: (article.frontmatter as any).parts,
    });
    return { columns: splitSlides(tree, { slideLevel: opts.slide_level }), creditsPart };
  }, [article.mdast, article.frontmatter, opts.slide_level]);
  const config = useMemo(
    () => ({
      hash: true,
      keyboardCondition,
      transition: opts.transition,
      // Without slide transitions, backgrounds also change at once.
      backgroundTransition: opts.transition === 'none' ? ('none' as const) : ('fade' as const),
      slideNumber: !!opts.slide_number,
      controls: !opts.hide_controls,
      progress: !opts.hide_progress,
      center: !opts.align_top,
      width: opts.width ?? 1280,
      height: opts.height ?? 720,
    }),
    [
      opts.transition,
      opts.slide_number,
      opts.hide_controls,
      opts.hide_progress,
      opts.align_top,
      opts.width,
      opts.height,
    ],
  );
  const { title, subtitle, authors, date } = article.frontmatter;
  const hasCitations = !!article.references?.cite?.order?.length;
  const showCredits = !opts.hide_credit_slide && hasCredits(article, creditsPart);

  return (
    <ArticleProvider
      kind={article.kind}
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider enable={!!compute?.enabled} contents={article}>
          <RevealDeck config={config} plugins={PLUGINS} className="myst-slides">
            {!opts.hide_title_slide && title && (
              <Slide className={`${SLIDE_CLASS} myst-title-slide`}>
                <FrontmatterBlock
                  frontmatter={{ title, subtitle, authors, date }}
                  authorStyle="list"
                  hideBadges
                />
              </Slide>
            )}
            {columns.map((column, i) =>
              column.length === 1 ? (
                <SlideView key={i} slide={column[0]} />
              ) : (
                <Stack key={i}>
                  {column.map((slide, j) => (
                    <SlideView key={j} slide={slide} />
                  ))}
                </Stack>
              ),
            )}
            {showCredits && (
              <Slide className={`${SLIDE_CLASS} myst-credits-slide`}>
                <Credits article={article} part={creditsPart} />
              </Slide>
            )}
            {hasCitations && (
              <Slide className={`${SLIDE_CLASS} myst-references-slide`}>
                <References />
              </Slide>
            )}
          </RevealDeck>
          <div className="myst-slides-corner">
            {live && <NotebookToolbar />}
            {!opts.hide_theme_toggle && <ThemeButton className="myst-slides-theme-button" />}
          </div>
          {live && <ErrorTray pageSlug={article.slug} />}
          {live && <ConnectionStatusTray />}
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ArticleProvider>
  );
}
