/** The highlight.js styles, bundled as strings and loaded on demand. */
const STYLES = import.meta.glob<string>('../../node_modules/highlight.js/styles/*.css', {
  query: '?raw',
  import: 'default',
});

/**
 * Load a highlight.js style and scope it to one color mode of the deck.
 *
 * Backgrounds are `!important` to override the MyST code colors.
 */
export async function codeThemeCss(name: unknown, mode: 'light' | 'dark'): Promise<string> {
  if (typeof name !== 'string' || !/^[a-z0-9-]+$/.test(name)) return '';
  const load = STYLES[`../../node_modules/highlight.js/styles/${name}.css`];
  if (!load) {
    console.warn(`Unknown highlight.js style: ${name}`);
    return '';
  }
  const css = await load();
  const scope = mode === 'dark' ? 'html.dark .myst-slides' : 'html:not(.dark) .myst-slides';
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/([^{}]+)\{/g, (_, selectors: string) => {
      const scoped = selectors
        .split(',')
        .map((s) => `${scope} ${s.trim()}`)
        .join(', ');
      return `${scoped} {`;
    })
    .replace(/(background(?:-color)?\s*:[^;}!]+)/g, '$1 !important');
}
