import { describe, expect, test } from 'vitest';
import { socialHref, socialLabel, socialLinks } from './socials';

describe('socialHref', () => {
  test.each([
    ['github', 'rowanc1', 'https://github.com/rowanc1'],
    ['github', 'jupyter-book/mystmd', 'https://github.com/jupyter-book/mystmd'],
    ['bluesky', '@mystmd.org', 'https://bsky.app/profile/mystmd.org'],
    ['mastodon', '@mystmarkdown@fosstodon.org', 'https://fosstodon.org/@mystmarkdown'],
    ['twitter', 'mystmd', 'https://x.com/mystmd'],
    ['youtube', '@jupyter', 'https://www.youtube.com/@jupyter'],
    ['email', 'ada@example.org', 'mailto:ada@example.org'],
    ['orcid', '0000-0002-1825-0097', 'https://orcid.org/0000-0002-1825-0097'],
    ['discord', 'https://discord.gg/abc', 'https://discord.gg/abc'],
  ] as const)('%s %s', (key, value, href) => {
    expect(socialHref(key, value)).toBe(href);
  });
});

describe('socialLinks', () => {
  test('keeps only social keys, in display order', () => {
    const links = socialLinks({ name: 'Ada', github: 'ada', url: 'https://ada.org', id: 'x' });
    expect(links.map((l) => l.key)).toEqual(['url', 'github']);
  });
});

describe('socialLabel', () => {
  test('drops the scheme, www and trailing slash', () => {
    expect(socialLabel('https://www.github.com/jupyter-book/mystmd/')).toBe(
      'github.com/jupyter-book/mystmd',
    );
    expect(socialLabel('@ada@example.org')).toBe('@ada@example.org');
  });
});
