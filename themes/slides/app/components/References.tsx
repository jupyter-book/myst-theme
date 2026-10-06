import { useReferences } from '@myst-theme/providers';

/** The cited works of the page, as one slide. */
export function References() {
  const { order, data } = useReferences()?.cite ?? {};
  const labels = order?.filter((label) => data?.[label]);
  if (!labels?.length || !data) return null;
  return (
    <>
      <h2 id="references">References</h2>
      <ol className="myst-references-list">
        {labels.map((label) => (
          <li
            key={label}
            id={`cite-${label}`}
            dangerouslySetInnerHTML={{ __html: data[label].html ?? '' }}
          />
        ))}
      </ol>
    </>
  );
}
