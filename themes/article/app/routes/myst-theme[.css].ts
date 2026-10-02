import { type LoaderFunction } from 'react-router';
import { type ThemeCssOptions, themeCSS, cssResponse } from '@myst-theme/site';
import { getConfig, getCustomStyleSheet } from '~/utils/loaders.server';

export const loader: LoaderFunction = async (): Promise<Response> => {
  const site = await getConfig();
  const css = await getCustomStyleSheet();
  return cssResponse(themeCSS(site?.options as ThemeCssOptions, css));
};
