import { type LoaderFunction } from 'react-router';
import { type ThemeCssOptions, themeCSS, cssResponse } from '@myst-theme/site';
import { getConfig, getCustomStyleSheet } from '~/utils/loaders.server';
import { codeThemeCss } from '~/utils/codeTheme.server';

export const loader: LoaderFunction = async (): Promise<Response> => {
  const site = await getConfig();
  const options = site?.options as (ThemeCssOptions & Record<string, unknown>) | undefined;
  const code = [
    await codeThemeCss(options?.code_theme, 'light'),
    await codeThemeCss(options?.code_theme_dark, 'dark'),
  ].join('\n');
  const css = await getCustomStyleSheet();
  // The user stylesheet comes last so that it can override the code theme.
  return cssResponse(themeCSS(options, [code, css].filter(Boolean).join('\n')));
};
