import {
  CcByIcon,
  CcIcon,
  CcNcIcon,
  CcNdIcon,
  CcSaIcon,
  CcZeroIcon,
  OsiIcon,
} from '@scienceicons/react/24/solid';
import { ScaleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';

type License = {
  name: string;
  url: string;
  id: string;
  free?: boolean;
  CC?: boolean;
  osi?: boolean;
};

export function CreativeCommonsBadge({
  license,
  preamble = '',
  className,
}: {
  license: License;
  preamble?: string;
  className?: string;
}) {
  const match = /^([CBYSAND0-]+)(?:(?:-)([0-9].[0-9]))?$/.exec(license.id);
  if (!license.CC || !match) return null;
  const title = `${preamble}${license.name ?? (license as any).title} (${license.id})`;
  const kind = match[1].toUpperCase();
  return (
    <a
      href={license.url}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(
        'opacity-50 hover:opacity-100 text-inherit hover:text-inherit',
        className,
      )}
    >
      <CcIcon className="h-5 w-5 mx-1 inline-block" title={`${title}`} />
      {(kind.startsWith('CC0') || kind.startsWith('CC-0') || kind.includes('ZERO')) && (
        <CcZeroIcon
          className="h-5 w-5 mr-1 inline-block"
          title="CC0: Work is in the worldwide public domain"
        />
      )}
      {kind.includes('BY') && (
        <CcByIcon
          className="h-5 w-5 mr-1 inline-block"
          title="Credit must be given to the creator"
        />
      )}
      {kind.includes('NC') && (
        <CcNcIcon
          className="h-5 w-5 mr-1 inline-block"
          title="Only noncommercial uses of the work are permitted"
        />
      )}
      {kind.includes('SA') && (
        <CcSaIcon
          className="h-5 w-5 mr-1 inline-block"
          title="Adaptations must be shared under the same terms"
        />
      )}
      {kind.includes('ND') && (
        <CcNdIcon
          className="h-5 w-5 mr-1 inline-block"
          title="No derivatives or adaptations of the work are permitted"
        />
      )}
    </a>
  );
}

function SingleLicenseBadge({
  license: possibleLicense,
  preamble = '',
  className,
}: {
  license?: License | string;
  preamble?: string;
  className?: string;
}) {
  if (!possibleLicense) return null;
  const license =
    typeof possibleLicense === 'string'
      ? { name: '', url: '', id: possibleLicense }
      : possibleLicense;
  if (!license || Object.keys(license).length === 0) return null;
  if (license.CC) {
    return <CreativeCommonsBadge license={license} preamble={preamble} className={className} />;
  }
  return (
    <a
      href={license.url || undefined}
      target="_blank"
      rel="noopener noreferrer"
      title={`${preamble}${license.name ?? (license as any).title} (${license.id})`}
      className="text-inherit hover:text-inherit"
    >
      {!license.osi && (
        <ScaleIcon
          className={classNames(
            'h-5 w-5 mx-1 inline-block opacity-60 hover:opacity-100',
            className,
          )}
        />
      )}
      {license.osi && (
        <OsiIcon
          className={classNames(
            'h-5 w-5 mx-1 inline-block opacity-60 hover:opacity-100 hover:text-[#599F46]',
            className,
          )}
        />
      )}
    </a>
  );
}

export function LicenseBadges({
  license,
  className,
}: {
  license?: string | License | { code?: License | string; content?: License | string };
  className?: string;
}) {
  if (!license) return null;
  if (typeof license !== 'string' && ('code' in license || 'content' in license)) {
    return (
      <>
        <SingleLicenseBadge
          license={license.content}
          preamble="Content License: "
          className={className}
        />
        <SingleLicenseBadge
          license={license.code}
          preamble="Code License: "
          className={className}
        />
      </>
    );
  }
  return <SingleLicenseBadge license={license as License} className={className} />;
}
