import type { HtmlMetaDescriptor, V2_MetaDescriptor } from '@remix-run/react';

export type SocialSite = {
  title: string;
  description?: string;
  twitter?: string;
};

export type SocialArticle = {
  origin: string;
  url: string;
  // TODO: canonical
  title: string;
  description?: string;
  image?: string | null;
  twitter?: string;
  keywords?: string[];
};

function allDefined(meta: Record<string, string | null | undefined>): HtmlMetaDescriptor {
  return Object.fromEntries(Object.entries(meta).filter(([, v]) => v)) as HtmlMetaDescriptor;
}

export function getMetaTagsForSite_V1({
  title,
  description,
  twitter,
}: SocialSite): HtmlMetaDescriptor {
  const meta = {
    title,
    description,
    'twitter:site': twitter ? `@${twitter.replace('@', '')}` : undefined,
  };
  return allDefined(meta);
}

export function getMetaTagsForSite({
  title,
  description,
  twitter,
}: SocialSite): V2_MetaDescriptor[] {
  const meta: V2_MetaDescriptor[] = [
    { title },
    { property: 'og:title', content: title },
    { name: 'generator', content: 'mystmd' },
  ];
  if (description) {
    meta.push({ name: 'description', content: description });
    meta.push({ property: 'og:description', content: description });
  }
  if (twitter) meta.push({ name: 'twitter:site', content: `@${twitter.replace('@', '')}` });
  return meta;
}

export function getMetaTagsForArticle_V1({
  origin,
  url,
  title,
  description,
  image,
  twitter,
  keywords,
}: SocialArticle): HtmlMetaDescriptor {
  const meta = {
    title,
    description,
    keywords: keywords?.join(', '),
    image,
    'og:url': origin && url ? `${origin}${url}` : undefined,
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'twitter:card': image ? 'summary_large_image' : 'summary',
    'twitter:creator': twitter ? `@${twitter.replace('@', '')}` : undefined,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
    'twitter:alt': title,
  };
  return allDefined(meta);
}

export function getMetaTagsForArticle({
  origin,
  url,
  title,
  description,
  image,
  twitter,
  keywords,
}: SocialArticle): V2_MetaDescriptor[] {
  const meta: V2_MetaDescriptor[] = [
    { title },
    { property: 'og:title', content: title },
    { name: 'generator', content: 'mystmd' },
  ];
  if (description) {
    meta.push({ name: 'description', content: description });
    meta.push({ property: 'og:description', content: description });
  }
  if (keywords) meta.push({ name: 'keywords', content: keywords.join(', ') });
  if (origin && url) meta.push({ property: 'og:url', content: `${origin}${url}` });
  if (image) {
    meta.push({ name: 'image', content: image });
    meta.push({ property: 'og:image', content: image });
  }
  if (twitter) {
    meta.push({ name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' });
    meta.push({ name: 'twitter:creator', content: `@${twitter.replace('@', '')}` });
    meta.push({ name: 'twitter:title', content: title });
    if (description) meta.push({ name: 'twitter:description', content: description });
    if (image) meta.push({ name: 'twitter:image', content: image });
    meta.push({ name: 'twitter:alt', content: title });
  }

  return meta;
}
