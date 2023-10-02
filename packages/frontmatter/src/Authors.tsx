import React from 'react';
import classNames from 'classnames';
import type { PageFrontmatter } from 'myst-frontmatter';
import { OrcidIcon, EmailIcon, TwitterIcon } from '@scienceicons/react/24/solid';
import { AuthorPopover } from './AuthorPopover.js';
import { Affiliation } from './Affiliations.js';

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
        <a
          className="ml-1"
          href={`mailto:${author.email}`}
          title={`${author.name} <${author.email}>`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <EmailIcon
            width="1rem"
            height="1rem"
            className="inline-block text-gray-400 hover:text-blue-400 -translate-y-[0.1em]"
          />
        </a>
      )}
      {author.orcid && (
        <a
          className="ml-1"
          href={`https://orcid.org/${author.orcid}`}
          target="_blank"
          rel="noopener noreferrer"
          title="ORCID (Open Researcher and Contributor ID)"
        >
          <OrcidIcon
            width="1rem"
            height="1rem"
            className="inline-block text-gray-400 hover:text-[#A9C751] -translate-y-[0.1em]"
          />
        </a>
      )}
      {author.twitter && (
        <a
          className="ml-1"
          href={`https://twitter.com/${author.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          title={`Twitter: ${author.twitter}`}
        >
          <TwitterIcon
            width="1rem"
            height="1rem"
            className="inline-block text-gray-400 hover:text-[#1DA1F2] -translate-y-[0.1em]"
          />
        </a>
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
