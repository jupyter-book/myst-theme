import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { normalizeBaseURL, resolveBaseURL } from '@myst-theme/common';

// Static builds with `relative_urls` have a relative router basename (e.g. `../../`)
const context = (window as any).__reactRouterContext;
if (context?.basename) {
  context.basename = `${resolveBaseURL(normalizeBaseURL(context.basename))}/`;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
