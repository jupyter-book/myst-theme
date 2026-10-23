import { type ThemeCssOptions, themeCSS, cssResponse } from '@myst-theme/site';
import { getConfig, getCustomStyleSheet } from '~/utils/loaders.server';

export async function loader() {
  const site = await getConfig();
  const css = await getCustomStyleSheet();
  return cssResponse(themeCSS(site?.options as ThemeCssOptions, css));
}
