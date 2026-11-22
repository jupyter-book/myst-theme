import type { BinderHubOptions } from 'myst-frontmatter';

const GITHUB_USERNAME_REPO_REGEX =
  /^(?:https?:\/\/github.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:.git)?\/?$/;

/**
 * Make a Google Colab url for a notebook in a GitHub repository
 *
 * Colab can only open notebooks (`.ipynb` files) hosted on GitHub
 *
 * @param options BinderOptions
 * @param location path of the notebook within the repository
 * @returns a Colab compatible url
 */
export function makeColabURL(options: BinderHubOptions, location: string): string | undefined {
  if (!options.repo || options.provider !== 'github' || !location.endsWith('.ipynb')) {
    return undefined;
  }
  const [, org, repo] = options.repo.match(GITHUB_USERNAME_REPO_REGEX) ?? [];
  if (!org) {
    return undefined;
  }
  const ref = options.ref || 'HEAD';
  const path = location.replace(/^\/+/, '').split('/').map(encodeURIComponent).join('/');
  return `https://colab.research.google.com/github/${org}/${repo}/blob/${encodeURIComponent(ref)}/${path}`;
}
