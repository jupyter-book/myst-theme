import { createCookieSessionStorage, json } from '@remix-run/node';
import { isTheme } from '@myst-theme/providers';
import type { Theme } from '@myst-theme/providers';
import type { ActionFunction } from '@remix-run/node';
import * as sass from 'sass';

export const themeStorage = createCookieSessionStorage({
  cookie: {
    name: 'theme',
    secure: true,
    secrets: ['secret'],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
  },
});

async function getThemeSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get('Cookie'));
  return {
    getTheme: () => {
      const themeValue = session.get('theme');
      return isTheme(themeValue) ? themeValue : undefined;
    },
    setTheme: (theme: Theme) => session.set('theme', theme),
    commit: () => themeStorage.commitSession(session, { expires: new Date('2100-01-01') }),
  };
}

export { getThemeSession };

export const setThemeAPI: ActionFunction = async ({ request }) => {
  const themeSession = await getThemeSession(request);
  const data = await request.json();
  const { theme } = data ?? {};
  if (!isTheme(theme)) {
    return json({
      success: false,
      message: `Invalid theme: "${theme}".`,
    });
  }
  themeSession.setTheme(theme as Theme);
  return json(
    { success: true, theme },
    {
      headers: { 'Set-Cookie': await themeSession.commit() },
    },
  );
};

/**
 * Render SCSS/SASS to CSS if applicable
 * 
 * @param url The location of the file we're trying to render (to determine if it's SCSS)
 * @param css The contents of that file
 * @returns Rendered CSS if SCSS/SASS was found
 */
export function renderStyle(url: string | undefined, css: string): string {
  if (!url) return css;
  if (url.endsWith('.scss') || url.endsWith('.sass')) {
    try {
      return sass.compileString(css).css;
    } catch (e: any) {
      console.error(`Error compiling ${url}`, e);
      return css + `\n/* Error compiling ${url}: ${e.message} */`;
    }
  }
  return css;
}
