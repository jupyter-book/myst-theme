import React, { useCallback } from 'react';

function makeSkipClickHandler(hash: string) {
  return (e: React.UIEvent<HTMLElement, Event>) => {
    e.preventDefault();
    const el = document.querySelector(`#${hash}`);
    if (!el) return;
    (el.nextSibling as HTMLElement).focus();
    history.replaceState(undefined, '', `#${hash}`);
  };
}

/**
 * @deprecated use `SkipTo` instead with a list of targets
 *
 */
export function SkipToArticle({
  frontmatter = true,
  article = true,
}: {
  frontmatter?: boolean;
  article?: boolean;
}) {
  const fm = 'skip-to-frontmatter';
  const art = 'skip-to-article';

  const frontmatterHandler = useCallback(() => makeSkipClickHandler(fm), [frontmatter]);
  const articleHandler = useCallback(() => makeSkipClickHandler(art), [article]);
  return (
    <div
      className="fixed top-1 left-1 h-[0px] w-[0px] focus-within:z-40 focus-within:h-auto focus-within:w-auto bg-white overflow-hidden focus-within:p-2 focus-within:ring-1"
      aria-label="skip to content options"
    >
      {frontmatter && (
        <a
          href={`#${fm}`}
          className="block px-2 py-1 text-black underline"
          onClick={frontmatterHandler}
        >
          Skip to article frontmatter
        </a>
      )}
      {article && (
        <a
          href={`#${art}`}
          className="block px-2 py-1 text-black underline"
          onClick={articleHandler}
        >
          Skip to article content
        </a>
      )}
    </div>
  );
}

/**
 * Add a skip navigation unit with links based on a list of targets
 */
export const SkipTo = React.memo(({ targets }: { targets: { id: string; title: string }[] }) => {
  return (
    <div
      className="fixed top-1 left-1 h-[0px] w-[0px] focus-within:z-40 focus-within:h-auto focus-within:w-auto bg-white overflow-hidden focus-within:p-2 focus-within:ring-1"
      aria-label="skip to content options"
    >
      {targets.map(({ id, title }) => (
        <a
          key={id}
          href={`#${id}`}
          className="block px-2 py-1 text-black underline"
          onClick={makeSkipClickHandler(id)}
        >
          {title}
        </a>
      ))}
    </div>
  );
});
