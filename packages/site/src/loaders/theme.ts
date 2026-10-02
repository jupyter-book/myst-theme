import { createCookieSessionStorage, data } from 'react-router';
import { isTheme } from '@myst-theme/providers';
import type { Theme } from '@myst-theme/providers';
import type { ActionFunction } from 'react-router';
import { serverOnly$ } from 'vite-env-only/macros';

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

async function serverGetThemeSession(request: Request) {
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

const serverSetThemeAPI: ActionFunction = async ({ request }) => {
  const themeSession = await serverGetThemeSession(request);
  const { theme } = (await request.json()) ?? {};
  if (!isTheme(theme)) {
    return {
      success: false,
      message: `Invalid theme: "${theme}".`,
    };
  }
  themeSession.setTheme(theme as Theme);
  return data(
    { success: true, theme },
    {
      headers: { 'Set-Cookie': await themeSession.commit() },
    },
  );
};

export const getThemeSession = serverOnly$(serverGetThemeSession);
export const setThemeApi = serverOnly$(serverSetThemeAPI);
