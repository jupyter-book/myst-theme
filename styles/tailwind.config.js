const mystTheme = require('@myst-theme/styles');

module.exports = {
  darkMode: 'class',
  content: [
    // Look to the actual packages too works in development
    '../packages/myst-to-react/src/**/*.{js,ts,jsx,tsx}',
    '../packages/myst-demo/src/**/*.{js,ts,jsx,tsx}',
    '../packages/site/src/**/*.{js,ts,jsx,tsx}',
    '../packages/frontmatter/src/**/*.{js,ts,jsx,tsx}',
    '../docs/stories/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: mystTheme.themeExtensions,
  plugins: [require('@tailwindcss/typography')],
};
