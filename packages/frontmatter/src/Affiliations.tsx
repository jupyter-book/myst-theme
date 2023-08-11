import { RorIcon } from '@scienceicons/react/24/solid';
import type { PageFrontmatter } from 'myst-frontmatter';

type Affiliations = Required<PageFrontmatter>['affiliations'];
type Affiliation = Affiliations[0];

export function Affiliation({
  affiliations,
  affiliationId,
}: {
  affiliationId: string;
  affiliations?: Affiliations;
}) {
  if (!affiliations || affiliations.length === 0) return null;
  const affiliationsLookup = Object.fromEntries(
    affiliations?.map(({ id, ...rest }: any) => [id, rest]) ?? [],
  );
  const affiliation = affiliationsLookup[affiliationId] ?? { name: affiliationId };
  return (
    <>
      {affiliation.name || affiliation.institution}{' '}
      {affiliation.ror && (
        <a
          className="ml-1"
          href={`https://ror.org/${affiliation.ror.replace(/(https?:\/\/)?ror\.org\//, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Research Organization Registry"
        >
          <RorIcon width="1rem" height="1rem" className="inline-block" />
        </a>
      )}
    </>
  );
}
