import type { GenericParent } from 'myst-common';
import { HashLink, MyST } from 'myst-to-react';
import { getChildren, type KnownParts } from '../utils.js';
import classNames from 'classnames';

export function BackmatterParts({
  parts,
  containerClassName,
  innerClassName,
}: {
  parts: KnownParts;
  containerClassName?: string;
  innerClassName?: string;
}) {
  return (
    <div className={containerClassName}>
      <Backmatter
        className={innerClassName}
        title="Acknowledgments"
        id="acknowledgments"
        content={parts.acknowledgments}
      />
      <Backmatter
        className={innerClassName}
        title="Data Availability"
        id="data-availability"
        content={parts.data_availability}
      />
    </div>
  );
}

export function Backmatter({
  title,
  id,
  content,
  className,
}: {
  title: string;
  id: string;
  content?: GenericParent;
  className?: string;
}) {
  if (!content) return null;
  return (
    <div className={classNames('flex flex-col w-full md:flex-row group/backmatter', className)}>
      <h2
        id={id}
        className="mt-5 text-base font-semibold group md:w-[200px] self-start md:flex-none opacity-90 group-hover/backmatter:opacity-100"
      >
        {title}
        <HashLink id={id} title={`Link to ${title}`} hover className="ml-2" />
      </h2>
      <div className="grow opacity-90 group-hover/backmatter:opacity-100 col-screen">
        <MyST ast={getChildren(content)} />
      </div>
    </div>
  );
}
