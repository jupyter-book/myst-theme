import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';

interface Props {
  value: string;
  message?: string;
  className?: string;
}

export function InlineError({ value, message, className }: Props) {
  return (
    <span className={classNames('text-myst-warning-text', className)} title={message || value}>
      <ExclamationCircleIcon width="1rem" height="1rem" className="inline mr-1" />
      {value}
    </span>
  );
}
