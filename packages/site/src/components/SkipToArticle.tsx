import { useCallback } from 'react';

function makeSkipClickHander(hash: string) {
  return (e: React.UIEvent<HTMLElement, Event>) => {
    e.preventDefault();
    const el = document.querySelector(`#${hash}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth' });
    history.replaceState(undefined, '', `#${hash}`);
    (el.nextSibling as HTMLElement).focus({ preventScroll: true });
    (e.target as HTMLElement).blur();
  };
}

export function SkipToArticle({
  frontmatter = true,
  article = true,
}: {
  frontmatter?: boolean;
  article?: boolean;
}) {
  const fm = 'skip-to-frontmatter';
  const art = 'skip-to-article';

  const frontmatterHander = useCallback(() => makeSkipClickHander(fm), [frontmatter]);
  const articleHandler = useCallback(() => makeSkipClickHander(art), [article]);
  return (
    <div
      className="fixed top-1 left-1 h-[0px] w-[0px] focus-within:z-40 focus-within:h-auto focus-within:w-auto bg-white overflow-hidden focus-within:p-2 focus-within:ring-1"
      aria-label="skip to content options"
    >
      {frontmatter && (
        <a
          href={`#${fm}`}
          className="block px-2 py-1 text-black underline"
          onClick={frontmatterHander}
        >
          Skip to frontmatter
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
