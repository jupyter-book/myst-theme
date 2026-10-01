import { useMemo } from 'react';
import { Deck as RevealDeck, Slide, Stack } from '@revealjs/react';
import RevealNotes from 'reveal.js/plugin/notes';
import type { PageLoader } from '@myst-theme/common';
import { ArticleProvider, useSiteManifest } from '@myst-theme/providers';
import { FrontmatterBlock } from '@myst-theme/frontmatter';
import { Bibliography } from '@myst-theme/site';
import { BusyScopeProvider, ExecuteScopeProvider } from '@myst-theme/jupyter';
import { copyNode, type GenericParent } from 'myst-common';
import { MyST } from 'myst-to-react';
import { splitSlides, type Slide as SlideData } from '../slides';
import type { TemplateOptions } from '../types';

const PLUGINS = [RevealNotes];
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

export function Deck({ article }: { article: PageLoader }) {
  const opts = useTemplateOptions(article);
  const columns = useMemo(
    () => splitSlides(copyNode(article.mdast) as GenericParent, { slideLevel: opts.slide_level }),
    [article.mdast, opts.slide_level],
  );
  const config = useMemo(
    () => ({
      hash: true,
      transition: opts.transition,
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

  return (
    <ArticleProvider
      kind={article.kind}
      references={{ ...article.references, article: article.mdast }}
      frontmatter={article.frontmatter}
    >
      <BusyScopeProvider>
        <ExecuteScopeProvider enable={false} contents={article}>
          <RevealDeck config={config} plugins={PLUGINS} className="myst-slides">
            {!opts.hide_title_slide && title && (
              <Slide className={`${SLIDE_CLASS} myst-title-slide`}>
                <FrontmatterBlock frontmatter={{ title, subtitle, authors, date }} hideBadges />
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
            {hasCitations && (
              <Slide className={`${SLIDE_CLASS} myst-references-slide`}>
                <Bibliography hideLongBibliography={false} />
              </Slide>
            )}
          </RevealDeck>
        </ExecuteScopeProvider>
      </BusyScopeProvider>
    </ArticleProvider>
  );
}
