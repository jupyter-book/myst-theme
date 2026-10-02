import type { FunctionComponent, SVGProps } from 'react';
import type { PageLoader } from '@myst-theme/common';
import type { NodeRenderer } from '@myst-theme/providers';
import { useFrontmatter } from '@myst-theme/providers';
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

type Frontmatter = PageLoader['frontmatter'];

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
    <ul className="myst-slides-socials not-prose">
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

/** The authors of the page, each with affiliations and, optionally, social links. */
export function AuthorList({
  frontmatter,
  socials,
}: {
  frontmatter?: Frontmatter;
  socials?: boolean;
}) {
  const { authors, affiliations } = frontmatter ?? {};
  if (!authors?.length) return null;
  const affiliationName = (id: string) => affiliations?.find((a) => a.id === id)?.name ?? id;
  return (
    <div className="myst-slides-authors">
      {authors.map((author) => (
        <div key={author.id ?? author.name} className="myst-slides-author">
          <div className="myst-slides-author-name">{author.name}</div>
          {!!author.affiliations?.length && (
            <div className="myst-slides-author-affiliations">
              {author.affiliations.map(affiliationName).join(', ')}
            </div>
          )}
          {socials && <SocialIcons links={socialLinks(author)} />}
        </div>
      ))}
    </div>
  );
}

const SlideAuthors: NodeRenderer = ({ node }) => {
  const frontmatter = useFrontmatter();
  return <AuthorList frontmatter={frontmatter} socials={node.socials} />;
};

const SlideSocials: NodeRenderer = () => {
  const frontmatter = useFrontmatter();
  return <SocialIcons links={socialLinks(frontmatter)} />;
};

/** Renderers for the nodes of the `{slide-authors}` and `{slide-socials}` directives. */
export const CREDIT_RENDERERS: Record<string, NodeRenderer> = {
  slideAuthors: SlideAuthors,
  slideSocials: SlideSocials,
};

/** The default credit slide: a heading, the authors with their links, and the page links. */
export function Credits({ frontmatter }: { frontmatter: Frontmatter }) {
  return (
    <>
      <h2>Thank you</h2>
      <AuthorList frontmatter={frontmatter} socials />
      <SocialIcons links={socialLinks(frontmatter)} />
    </>
  );
}
