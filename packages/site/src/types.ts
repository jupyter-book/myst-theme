import type { KINDS } from '@curvenote/blocks';
import type { Root } from 'mdast';
import type { References } from 'myst-common';
import type { SiteManifest } from 'myst-config';
import type { PageFrontmatter } from 'myst-frontmatter';
import type { Theme } from '@curvenote/ui-providers';

export type Heading = {
  slug?: string;
  path?: string;
  title: string;
  level: number | 'index';
  group?: string;
};

export type SiteLoader = {
  theme: Theme;
  config?: SiteManifest;
  CONTENT_CDN_PORT?: string | number;
};

export type NavigationLink = {
  group?: string;
  title: string;
  url: string;
};

export type FooterLinks = {
  navigation?: {
    prev?: NavigationLink;
    next?: NavigationLink;
  };
};

export type PageLoader = {
  kind: KINDS;
  file: string;
  sha256: string;
  slug: string;
  domain: string; // This is written in at render time in the site
  frontmatter: PageFrontmatter;
  mdast: Root;
  references: References;
  footer?: FooterLinks;
};
