import { THEME_LOCALSTORAGE_KEY, PREFERS_LIGHT_MQ } from '../hooks/theme.js';

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

  // The <style> hides the page until the theme class (.light or .dark) is set on <html>.
  // The blocking <script> sets that class synchronously before the browser paints, so the
  // page is never visibly hidden — but if anything temporarily removes the class (e.g. a
  // React hydration edge case), the page goes invisible rather than flashing the wrong theme.
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'html:not(.light):not(.dark){visibility:hidden}' }} />
      <script dangerouslySetInnerHTML={{ __html: CLIENT_THEME_SOURCE }} />
    </>
  );
}
