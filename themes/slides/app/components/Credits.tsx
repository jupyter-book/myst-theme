import type { FunctionComponent, SVGProps } from 'react';
import type { PageLoader } from '@myst-theme/common';
import type { GenericParent } from 'myst-common';
import { MyST } from 'myst-to-react';
import {
  BlueskyIcon,
  DiscordIcon,
  DiscourseIcon,
  EmailIcon,
  GithubIcon,
  LinkedinIcon,
  MastodonIcon,
  OrcidIcon,
  SlackIcon,
  WebsiteIcon,
  XIcon,
  YoutubeIcon,
} from '@scienceicons/react/24/solid';
import { socialLinks, type SocialKey, type SocialLink } from '../socials';

const ICONS: Partial<Record<SocialKey, FunctionComponent<SVGProps<SVGSVGElement>>>> = {
  email: EmailIcon,
  orcid: OrcidIcon,
  github: GithubIcon,
  bluesky: BlueskyIcon,
  mastodon: MastodonIcon,
  linkedin: LinkedinIcon,
  twitter: XIcon,
  youtube: YoutubeIcon,
  discourse: DiscourseIcon,
  discord: DiscordIcon,
  slack: SlackIcon,
};

function SocialIcons({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;
  return (
    <ul className="myst-credits-socials not-prose">
      {links.map(({ key, href, label }) => {
        const Icon = ICONS[key] ?? WebsiteIcon;
        return (
          <li key={key}>
            <a href={href} title={label} aria-label={`${key}: ${label}`}>
              <Icon width="1em" height="1em" />
              <span>{label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** True when the page has something to show on the credit slide. */
export function hasCredits(article: PageLoader, part?: GenericParent): boolean {
  const { authors } = article.frontmatter;
  return (
    !!part ||
    socialLinks(article.frontmatter).length > 0 ||
    !!authors?.some((author) => socialLinks(author).length > 0)
  );
}

/** Authors, their social links, the page links and the `credits` part. */
export function Credits({ article, part }: { article: PageLoader; part?: GenericParent }) {
  const { authors, affiliations } = article.frontmatter;
  const affiliationName = (id: string) => affiliations?.find((a) => a.id === id)?.name ?? id;
  return (
    <>
      {part ? <MyST ast={part.children} /> : <h2>Thank you</h2>}
      {!!authors?.length && (
        <div className="myst-credits-authors">
          {authors.map((author) => (
            <div key={author.id ?? author.name} className="myst-credits-author">
              <div className="myst-credits-name">{author.name}</div>
              {!!author.affiliations?.length && (
                <div className="myst-credits-affiliations">
                  {author.affiliations.map(affiliationName).join(', ')}
                </div>
              )}
              <SocialIcons links={socialLinks(author)} />
            </div>
          ))}
        </div>
      )}
      <SocialIcons links={socialLinks(article.frontmatter)} />
    </>
  );
}
