import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import type { PageFrontmatter } from 'myst-frontmatter';
import { Affiliation } from './Affiliations.js';

type Author = Required<PageFrontmatter>['authors'][0];
type Affiliations = Required<PageFrontmatter>['affiliations'];

function Definition({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className="text-sm font-medium leading-6 text-gray-900">{title}</dt>
      <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  );
}

export const AuthorPopover = ({
  author,
  affiliations,
  children,
}: {
  author?: Author;
  affiliations?: Affiliations;
  children: React.ReactNode;
}) => {
  if (!author) return <>{children}</>;
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className="focus:shadow-[0_0_0_2px] focus:shadow-black outline-none hover:underline"
          aria-label="Author Details"
        >
          {children}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="hover-card-content rounded p-5 w-[400px] bg-white shadow"
          sideOffset={5}
        >
          <div className="flex flex-col gap-2.5">
            <p className="text-mauve12 text-[15px] leading-[19px] font-medium mb-2.5">
              {author.name}
            </p>
            <p className="text-mauve12 text-[15px] leading-[19px] font-medium mb-2.5">
              {author.affiliations?.map((affiliationId) => (
                <Affiliation
                  key={affiliationId}
                  affiliations={affiliations}
                  affiliationId={affiliationId}
                />
              ))}
            </p>
            <dl className="divide-y divide-gray-100">
              {author.email && (
                <Definition title="Email">
                  <a
                    className="ml-1"
                    href={`mailto:${author.email}`}
                    title={`${author.name} <${author.email}>`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {author.email}
                  </a>
                </Definition>
              )}
              {author.orcid && (
                <Definition title="ORCID">
                  <a
                    className="ml-1"
                    href={`https://orcid.org/${author.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="ORCID (Open Researcher and Contributor ID)"
                  >
                    {author.orcid}
                  </a>
                </Definition>
              )}
              {author.github && (
                <Definition title="GitHub">
                  <a
                    className="ml-1"
                    href={`https://github.com/${author.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`GitHub: ${author.github}`}
                  >
                    @{author.github}
                  </a>
                </Definition>
              )}
              {author.twitter && (
                <Definition title="Twitter">
                  <a
                    className="ml-1"
                    href={`https://twitter.com/${author.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Twitter: ${author.twitter}`}
                  >
                    @{author.twitter}
                  </a>
                </Definition>
              )}
              {author.url && (
                <Definition title="Website">
                  <a
                    className="ml-1"
                    href={author.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Author Website`}
                  >
                    {author.url}
                  </a>
                </Definition>
              )}
              {author.roles && <Definition title="Roles">{author.roles.join(', ')}</Definition>}
            </dl>
          </div>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
