import React from 'react';
import classNames from 'classnames';
import type { PageFrontmatter } from 'myst-frontmatter';
import { OrcidIcon, EmailIcon, RorIcon, TwitterIcon } from '@scienceicons/react/24/solid';

export function Author({
  author,
  className,
}: {
  author: Required<PageFrontmatter>['authors'][0];
  className?: string;
}) {
  return (
    <span className={classNames('font-semibold text-sm', className)}>
      {author.name}
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

export function AuthorsList({ authors }: { authors: PageFrontmatter['authors'] }) {
  if (!authors || authors.length === 0) return null;
  return (
    <div>
      {authors.map((a, i) => (
        <Author
          key={a.name}
          author={a}
          className={classNames('inline-block', {
            'text-comma': i < authors.length - 1,
          })}
        />
      ))}
    </div>
  );
}

export function AuthorAndAffiliations({ authors }: { authors: PageFrontmatter['authors'] }) {
  if (!authors || authors.length === 0) return null;
  const hasAffliations = authors.reduce(
    (r, { affiliations: a }) => r || (!!a && a?.length > 0),
    false,
  );
  if (!hasAffliations) {
    return (
      <header className="mt-4 not-prose">
        <AuthorsList authors={authors} />
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
              <Author author={author} />
            </div>
            <div className="text-sm">
              {author.affiliations?.map((affil, i) => {
                if (typeof affil === 'string') {
                  return <div key={i}>{affil}</div>;
                }
                const { name, ror } = affil as unknown as {
                  name: string;
                  ror?: string;
                };
                if (ror) {
                  return (
                    <div key={i}>
                      {name}
                      <a
                        href={`https://ror.org/${ror}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="ROR (Research Organization Registry)"
                        className="text-inherit hover:text-inherit"
                      >
                        <RorIcon className="ml-2 inline-block h-[2em] w-[2em] grayscale hover:grayscale-0 -translate-y-[1px]" />
                      </a>
                    </div>
                  );
                }
                return <div key={i}>{name}</div>;
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </header>
  );
}
