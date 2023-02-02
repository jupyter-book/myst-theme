import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import classNames from 'classnames';

export function CopyIcon({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = () => {
    if (copied) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };
  return (
    <button
      title={copied ? 'Copied!!' : 'Copy to Clipboard'}
      className={classNames(
        'inline-flex items-center opacity-60 hover:opacity-100 active:opacity-40 cursor-pointer ml-2',
        'transition-color duration-200 ease-in-out',
        {
          'text-primary-500 border-primary-500': !copied,
          'text-success border-success ': copied,
        },
      )}
      onClick={onClick}
      aria-pressed={copied ? 'true' : 'false'}
      aria-label="Copy code to clipboard"
    >
      {copied ? (
        <CheckIcon className="w-[24px] h-[24px] text-success" />
      ) : (
        <DocumentDuplicateIcon className="w-[24px] h-[24px]" />
      )}
    </button>
  );
}
