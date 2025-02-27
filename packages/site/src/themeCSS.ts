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
  return `:root {\n  ${css}\n}`;
}

export function themeCSS(options?: ThemeCssOptions, css?: string): string {
  const numbered_references = !!options?.numbered_references;
  const citationCss = numbered_references
    ? { 'cite-group-open': '[', 'cite-group-close': ']' }
    : {};
  const vars = variables({ ...citationCss });
  const themeCss = vars ? `/* MyST Theme Options */\n\n${vars}` : '';
  const userCss = css
    ? `/* User Provided Stylesheet */\n\n${css}`
    : '/* No Custom Stylesheet Provided */';
  return (
    [themeCss, userCss]
      .map((s) => s.trim())
      .join('\n\n')
      .trim() + '\n'
  );
}

export function cssResponse(css: string): Response {
  return new Response(css, {
    headers: {
      'Content-Type': 'text/css',
      'Cache-Control': 'no-cache',
    },
  });
}
