/** MyST social link keys, in display order. */
export const SOCIAL_KEYS = [
  'url',
  'email',
  'orcid',
  'github',
  'bluesky',
  'mastodon',
  'linkedin',
  'twitter',
  'threads',
  'youtube',
  'discourse',
  'discord',
  'slack',
  'facebook',
  'telegram',
] as const;

export type SocialKey = (typeof SOCIAL_KEYS)[number];

export type SocialLink = { key: SocialKey; href: string; label: string };

const strip = (value: string) => value.replace(/^@/, '');

/** Convert a validated MyST social value to a link. */
export function socialHref(key: SocialKey, value: string): string {
  if (/^https?:\/\//.test(value)) return value;
  switch (key) {
    case 'email':
      return `mailto:${value}`;
    case 'orcid':
      return `https://orcid.org/${value}`;
    case 'github':
      return `https://github.com/${strip(value)}`;
    case 'bluesky':
      return `https://bsky.app/profile/${strip(value)}`;
    case 'mastodon': {
      const [user, host] = strip(value).split('@');
      return `https://${host}/@${user}`;
    }
    case 'twitter':
      return `https://x.com/${strip(value)}`;
    case 'threads':
      return `https://www.threads.net/@${strip(value)}`;
    case 'youtube':
      return `https://www.youtube.com/@${strip(value)}`;
    case 'telegram':
      return `https://t.me/${strip(value)}`;
    default:
      return value;
  }
}

/** Show a URL without its scheme, `www.` or trailing slash. */
export function socialLabel(value: string): string {
  return value.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

/** List the social links set on an author or on the page frontmatter. */
export function socialLinks(source?: Record<string, any>): SocialLink[] {
  if (!source) return [];
  return SOCIAL_KEYS.filter((key) => typeof source[key] === 'string' && source[key]).map((key) => ({
    key,
    href: socialHref(key, source[key]),
    label: socialLabel(source[key]),
  }));
}
