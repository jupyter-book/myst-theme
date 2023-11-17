import type { GenericParent } from 'myst-common';
import { ContentBlocks } from './ContentBlocks.js';
import { HashLink } from 'myst-to-react';
import type { KnownParts } from '../utils.js';

export function BackmatterParts({ parts }: { parts: KnownParts }) {
  return (
    <>
      <Backmatter title="Acknowledgments" id="acknowledgments" content={parts.acknowledgments} />
      <Backmatter
        title="Data Availability"
        id="data-availability"
        content={parts.data_availability}
      />
    </>
  );
}

export function Backmatter({
  title,
  id,
  content,
}: {
  title: string;
  id: string;
  content?: GenericParent;
}) {
  if (!content) return null;
  return (
    <div className="flex flex-col w-full md:flex-row">
      <h2
        id={id}
        className="mt-5 text-base font-semibold group md:w-[200px] self-start md:flex-none opacity-90"
      >
        {title}
        <HashLink id={id} title={`Link to ${title}`} hover className="ml-2" />
      </h2>
      <div className="grow">
        <ContentBlocks mdast={content} className="opacity-80 col-screen" />
      </div>
    </div>
  );
}
