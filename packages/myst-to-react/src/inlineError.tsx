import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  value: string;
  message?: string;
}

export function InlineError({ value, message }: Props) {
  return (
    <span className="text-yellow-600" title={message || value}>
      <ExclamationCircleIcon width="1rem" height="1rem" className="inline mr-1" />
      {value}
    </span>
  );
}
