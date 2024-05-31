import { ErrorStatus } from '@myst-theme/common';
import { serverOnly$ } from "vite-env-only/macros"


function _responseNoSite(): Response {
  // note: error boundary logic is dependent on the string sent here
  return new Response(ErrorStatus.noSite, {
    status: 404,
    statusText: ErrorStatus.noSite,
  });
}
export const responseNoSite = serverOnly$(_responseNoSite);

export function _responseNoArticle() {
  // note: error boundary logic is dependent on the string sent here
  return new Response(ErrorStatus.noArticle, {
    status: 404,
    statusText: ErrorStatus.noArticle,
  });
}
export const responseNoArticle = serverOnly$(_responseNoArticle);
