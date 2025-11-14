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
    <div className={classNames('myst-keywords mb-10 group', className)}>
      <span className="myst-keywords-label mr-2 font-semibold">Keywords:</span>
      <span className="myst-keywords-list">
        {keywords.map((k, i) => (
          <span
            key={k}
            className={classNames('myst-keywords-item', {
              "after:content-[','] after:mr-1": i < keywords.length - 1,
            })}
          >
            {k}
          </span>
        ))}
      </span>
      <HashLink id="keywords" title="Link to Keywords" hover className="ml-2" />
    </div>
  );
}
