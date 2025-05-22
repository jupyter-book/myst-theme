import { create } from '@storybook/theming';

export default create({
  base: 'light',
  brandTitle: '@myst-theme',
  brandUrl: './', // On github pages, this is a non-bare URL
  brandImage: 'logo.svg',
  brandTarget: '_self',
});
