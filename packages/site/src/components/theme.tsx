import { THEME_LOCALSTORAGE_KEY } from '../hooks/theme.js';
const PREFERS_LIGHT_MQ = '(prefers-color-scheme: light)';

/**
 * A blocking element that runs on the client before hydration to update the <html> preferred class
 * This ensures that the hydrated state matches the non-hydrated state (by updating the DOM on the
 * client between SSR on the server and hydration on the client)
 */
export function BlockingThemeLoader({ useLocalStorage }: { useLocalStorage: boolean }) {
  const LOCAL_STORAGE_SOURCE = `localStorage.getItem(${JSON.stringify(THEME_LOCALSTORAGE_KEY)})`;
  const CLIENT_THEME_SOURCE = `
  const savedTheme = ${useLocalStorage ? LOCAL_STORAGE_SOURCE : 'null'};
  const theme = window.matchMedia(${JSON.stringify(PREFERS_LIGHT_MQ)}).matches ? 'light' : 'dark';
  const classes = document.documentElement.classList;
  const hasAnyTheme = classes.contains('light') || classes.contains('dark');
  if (!hasAnyTheme) classes.add(savedTheme ?? theme);
`;

  return <script dangerouslySetInnerHTML={{ __html: CLIENT_THEME_SOURCE }} />;
}
