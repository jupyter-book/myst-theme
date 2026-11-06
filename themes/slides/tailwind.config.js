const mystTheme = require('@myst-theme/styles');

module.exports = {
  darkMode: 'class',
  content: mystTheme.content,
  theme: {
    extend: mystTheme.themeExtensions,
  },
  plugins: [require('@tailwindcss/typography')],
  safelist: mystTheme.safeList,
};
