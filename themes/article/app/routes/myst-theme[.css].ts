import { type LoaderFunction } from '@remix-run/node';
import { type ThemeCssOptions, themeCSS, cssResponse } from '@myst-theme/site';
import { getConfig } from '~/utils/loaders.server';

export const loader: LoaderFunction = async (): Promise<Response> => {
  const site = await getConfig();
  return cssResponse(themeCSS(site?.options as ThemeCssOptions));
};
