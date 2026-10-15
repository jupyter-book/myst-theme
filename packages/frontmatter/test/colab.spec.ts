import { describe, expect, test } from 'vitest';
import { makeColabURL } from '../src/colab';

describe('makeColabURL', () => {
  test('builds a Colab URL for a GitHub notebook', () => {
    expect(
      makeColabURL(
        { provider: 'github', repo: 'executablebooks/thebe', ref: 'main' },
        '/docs/my notebook.ipynb',
      ),
    ).toBe(
      'https://colab.research.google.com/github/executablebooks/thebe/blob/main/docs/my%20notebook.ipynb',
    );
  });
  test('accepts a full GitHub URL and defaults the ref', () => {
    expect(
      makeColabURL({ provider: 'github', repo: 'https://github.com/org/repo' }, 'nb.ipynb'),
    ).toBe('https://colab.research.google.com/github/org/repo/blob/HEAD/nb.ipynb');
  });
  test('encodes refs containing slashes', () => {
    expect(makeColabURL({ provider: 'github', repo: 'org/repo', ref: 'feat/x' }, '/nb.ipynb')).toBe(
      'https://colab.research.google.com/github/org/repo/blob/feat%2Fx/nb.ipynb',
    );
  });
  test.each([
    [{ provider: 'gitlab', repo: 'org/repo' }, '/nb.ipynb'],
    [{ provider: 'github', repo: 'org/repo' }, '/page.md'],
    [{ provider: 'github' }, '/nb.ipynb'],
  ])('returns undefined for unsupported options %#', (options, location) => {
    expect(makeColabURL(options as any, location)).toBeUndefined();
  });
});
