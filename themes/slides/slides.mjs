/**
 * MyST plugin for the slides theme: building blocks for credit slides.
 *
 * - `{slide-authors}` shows the page authors with their affiliations.
 *   With `:socials:`, it also shows each author's social links.
 * - `{slide-socials}` shows the social links of the page or project.
 *
 * The slides theme renders these nodes; other themes ignore them.
 */

/** @type {import('myst-common').DirectiveSpec} */
const slideAuthorsDirective = {
  name: 'slide-authors',
  doc: 'Show the page authors and their affiliations on a slide.',
  options: {
    socials: { type: Boolean, doc: 'Also show the social links of each author.' },
  },
  run(data) {
    return [{ type: 'slideAuthors', socials: !!data.options?.socials }];
  },
};

/** @type {import('myst-common').DirectiveSpec} */
const slideSocialsDirective = {
  name: 'slide-socials',
  doc: 'Show the social links of the page or project on a slide.',
  run() {
    return [{ type: 'slideSocials' }];
  },
};

/** @type {import('myst-common').MystPlugin} */
const plugin = {
  name: 'Slides theme',
  directives: [slideAuthorsDirective, slideSocialsDirective],
};

export default plugin;
