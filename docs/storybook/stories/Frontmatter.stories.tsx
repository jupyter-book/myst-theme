import type { PageFrontmatter } from 'myst-frontmatter';
import React from 'react';

import { FrontmatterBlock } from '@myst-theme/frontmatter';

export default {
  title: 'Components/Frontmatter',
  component: FrontmatterBlock,
};

const Template = (args: PageFrontmatter) => (
  <article className="prose m-auto mt-6 max-w-[80ch]">
    <FrontmatterBlock frontmatter={{ ...args }} />
  </article>
);

const frontmatter: PageFrontmatter = {
  title: 'Creating frontmatter in MyST',
  subtitle: 'Using storybook',
  github: 'https://github.com/executablebooks/mystjs',
  authors: [
    { name: 'An Author', affiliations: ['Executable Books'], orcid: '0000-0000-0000-0000' },
    { name: 'Some One Else', affiliations: ['MyST Tools'], orcid: '0000-0000-0000-0000' },
  ],
  subject: 'Tutorial',
};

export const SingleAuthors = Template.bind({});
SingleAuthors.args = { ...frontmatter, authors: frontmatter.authors?.slice(0, 1) };

export const MultipleAuthors = Template.bind({});
MultipleAuthors.args = frontmatter;

export const NoAffiliation = Template.bind({});
NoAffiliation.args = { ...frontmatter, authors: [{ name: 'An Author' }] };

export const NoAffiliationMultipleAuthors = Template.bind({});
NoAffiliationMultipleAuthors.args = {
  ...frontmatter,
  authors: [{ name: 'An Author' }, { name: 'Some One Else' }],
};
