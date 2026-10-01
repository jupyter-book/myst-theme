import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);

/**
 * Load a highlight.js style and scope it to one color mode of the deck.
 *
 * Backgrounds are `!important` to override the MyST code colors.
 */
export async function codeThemeCss(name: unknown, mode: 'light' | 'dark'): Promise<string> {
  if (typeof name !== 'string' || !/^[a-z0-9-]+$/.test(name)) return '';
  let css: string;
  try {
    css = await readFile(require.resolve(`highlight.js/styles/${name}.css`), 'utf8');
  } catch {
    console.warn(`Unknown highlight.js style: ${name}`);
    return '';
  }
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
