/**
 * Navbar icon links for social media and external resources.
 * Configured via site.options.navbar_icons in myst.yml.
 */
import type { NavbarIcon } from '@myst-theme/common';
import {
  GithubIcon,
  XIcon,
  BlueskyIcon,
  DiscordIcon,
  MastodonIcon,
  LinkedinIcon,
  YoutubeIcon,
  SlackIcon,
  EmailIcon,
  WebsiteIcon,
} from '@scienceicons/react/24/solid';
import { RssIcon } from '@heroicons/react/24/solid';

// Maps icon name strings to icon components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  twitter: XIcon,
  x: XIcon,
  bluesky: BlueskyIcon,
  discord: DiscordIcon,
  mastodon: MastodonIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
  slack: SlackIcon,
  email: EmailIcon,
  rss: RssIcon,
  link: WebsiteIcon,
  website: WebsiteIcon,
};

// Default tooltip text for each icon type
const DEFAULT_TITLES: Record<string, string> = {
  github: 'GitHub',
  twitter: 'X (Twitter)',
  x: 'X (Twitter)',
  bluesky: 'Bluesky',
  discord: 'Discord',
  mastodon: 'Mastodon',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  slack: 'Slack',
  email: 'Email',
  rss: 'RSS Feed',
  link: 'Website',
  website: 'Website',
};

/** Single icon link that opens in a new tab */
export function NavbarIconLink({ icon, url, title }: NavbarIcon) {
  const IconComponent = ICON_MAP[icon.toLowerCase()] ?? WebsiteIcon;
  const displayTitle = title ?? DEFAULT_TITLES[icon.toLowerCase()] ?? icon;

  return (
    <a
      href={url}
      title={displayTitle}
      target="_blank"
      rel="noopener noreferrer"
      className="myst-navbar-icon inline-flex items-center justify-center p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
    >
      <IconComponent className="w-5 h-5" />
      <span className="sr-only">{displayTitle}</span>
    </a>
  );
}

/** Container for multiple navbar icon links */
export function NavbarIcons({ icons, className }: { icons?: NavbarIcon[]; className?: string }) {
  if (!icons || icons.length === 0) return null;

  return (
    <div className={`myst-navbar-icons flex items-center ${className ?? ''}`}>
      {icons.map((iconConfig, index) => (
        <NavbarIconLink key={iconConfig.url || index} {...iconConfig} />
      ))}
    </div>
  );
}
