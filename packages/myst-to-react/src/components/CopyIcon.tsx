import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import classNames from 'classnames';

export function CopyIcon({ text, className }: { text: string; className?: string }) {
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
        'inline-flex items-center opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 active:opacity-100 cursor-pointer ml-2',
        'transition-color duration-200 ease-in-out',
        {
          'text-blue-400 hover:text-blue-500': !copied,
          'text-green-500 hover:text-green-500': copied,
        },
        className,
      )}
      onClick={onClick}
      aria-pressed={copied ? 'true' : 'false'}
      aria-label="Copy code to clipboard"
    >
      {copied ? (
        <CheckIcon width={24} height={24} className="text-success" />
      ) : (
        <DocumentDuplicateIcon width={24} height={24} />
      )}
    </button>
  );
}
