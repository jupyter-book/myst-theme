import classNames from 'classnames';
import { HashLink } from 'myst-to-react';

export function Keywords({
  keywords,
  hideKeywords,
  className,
}: {
  keywords?: string[];
  hideKeywords?: boolean;
  className?: string;
}) {
  if (hideKeywords || !keywords || keywords.length === 0) return null;
  return (
    <div className={classNames('mb-10 group', className)}>
      <span className="mr-2 font-semibold">Keywords:</span>
      {keywords.map((k, i) => (
        <span
          key={k}
          className={classNames({
            "after:content-[','] after:mr-1": i < keywords.length - 1,
          })}
        >
          {k}
        </span>
      ))}
      <HashLink id="keywords" title="Link to Keywords" hover className="ml-2" />
    </div>
  );
}
