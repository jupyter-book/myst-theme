export type ThemeCssOptions = {
  numbered_references?: boolean;
};

type MystThemeVariables = {
  'cite-group-open'?: '(' | '[' | string;
  'cite-group-close'?: ')' | ']' | string;
};

function variables(vars: MystThemeVariables) {
  const css = Object.entries(vars)
    .map(([name, value]) => `--${name}: '${value}';`)
    .join('\n  ');
  if (!css) return '';
  return `:root {\n  ${css}}`;
}

export function themeCSS(options?: ThemeCssOptions) {
  const numbered_references = !!options?.numbered_references;
  const citationCss = numbered_references
    ? { 'cite-group-open': '[', 'cite-group-close': ']' }
    : {};
  return variables({ ...citationCss });
}

export function cssResponse(css: string): Response {
  return new Response(css, {
    headers: {
      'Content-Type': 'text/css',
      'Cache-Control': 'no-cache',
    },
  });
}
