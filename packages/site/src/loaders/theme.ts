import { createCookieSessionStorage, json } from '@remix-run/node';
import { isTheme, Theme } from '@myst-theme/providers';
import type { ActionFunction } from '@remix-run/node';
import { serverOnly$ } from "vite-env-only/macros"

export const themeStorage = serverOnly$(createCookieSessionStorage({
  cookie: {
    name: 'theme',
    secure: true,
    secrets: ['secret'],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
  },
}));

async function _getThemeSession(request: Request) {
  const session = await themeStorage!.getSession(request.headers.get('Cookie'));
  return {
    getTheme: () => {
      const themeValue = session.get('theme');
      return isTheme(themeValue) ? themeValue : Theme.light;
    },
    setTheme: (theme: Theme) => session.set('theme', theme),
    commit: () => themeStorage!.commitSession(session, { expires: new Date('2100-01-01') }),
  };
}

export const getThemeSession = serverOnly$(_getThemeSession);

const _setThemeAPI: ActionFunction = async ({ request }) => {
  const themeSession = await _getThemeSession(request);
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

export const setThemeAPI = serverOnly$(_setThemeAPI);
