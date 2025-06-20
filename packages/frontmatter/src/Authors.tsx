import React from 'react';
import classNames from 'classnames';
import type { PageFrontmatter } from 'myst-frontmatter';
import { OrcidIcon, EmailIcon } from '@scienceicons/react/24/solid';
import { AuthorPopover } from './AuthorPopover.js';
import { Affiliation } from './Affiliations.js';

function AuthorIconLink({
  href,
  icon: Icon,
  title,
  className,
}: {
  href: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  title: string;
  className?: string;
}) {
  return (
    <a className="ml-1" href={href} title={title} target="_blank" rel="noopener noreferrer">
      <Icon
        width="1rem"
        height="1rem"
        className={classNames('inline-block text-gray-400 -translate-y-[0.1em]', className)}
      />
    </a>
  );
}

export function Author({
  author,
  affiliations,
  className,
}: {
  author: Required<PageFrontmatter>['authors'][0];
  affiliations: PageFrontmatter['affiliations'];
  className?: string;
}) {
  return (
    <span className={classNames('font-semibold text-sm', className)}>
      <AuthorPopover author={author} affiliations={affiliations}>
        {author.name}
      </AuthorPopover>
      {author.email && author.corresponding && (
        <AuthorIconLink
          href={`mailto:${author.email}`}
          title={`${author.name} <${author.email}>`}
          icon={EmailIcon}
          className="hover:text-blue-400"
        />
      )}
      {author.orcid && (
        <AuthorIconLink
          href={`https://orcid.org/${author.orcid}`}
          title={`ORCID: ${author.orcid}`}
          icon={OrcidIcon}
          className="hover:text-[#A9C751]"
        />
      )}
    </span>
  );
}

export function AuthorsList({
  authors,
  affiliations,
}: {
  authors: PageFrontmatter['authors'];
  affiliations: PageFrontmatter['affiliations'];
}) {
  if (!authors || authors.length === 0) return null;
  return (
    <div>
      {authors.map((a, i) => (
        <Author
          key={a.name}
          author={a}
          affiliations={affiliations}
          className={classNames('inline-block', {
            'text-comma': i < authors.length - 1,
          })}
        />
      ))}
    </div>
  );
}

export function AuthorAndAffiliations({
  authors,
  affiliations,
}: {
  authors: PageFrontmatter['authors'];
  affiliations: PageFrontmatter['affiliations'];
}) {
  if (!authors || authors.length === 0) return null;
  const hasAffliations = authors.reduce(
    (r, { affiliations: a }) => r || (!!a && a?.length > 0),
    false,
  );
  if (!hasAffliations) {
    return (
      <header className="mt-4 not-prose">
        <AuthorsList authors={authors} affiliations={affiliations} />
      </header>
    );
  }
  return (
    <header className="mt-4 not-prose">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
        {authors.length > 1 && (
          <>
            <div className="pb-2 text-xs font-thin uppercase">Authors</div>
            <div className="pb-2 text-xs font-thin uppercase">Affiliations</div>
          </>
        )}
        {authors.map((author) => (
          <React.Fragment key={author.name}>
            <div>
              <Author author={author} affiliations={affiliations} />
            </div>
            <div className="text-sm">
              {author.affiliations?.map((affiliationId) => {
                return (
                  <div key={affiliationId}>
                    <Affiliation affiliations={affiliations} affiliationId={affiliationId} />
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </header>
  );
}
