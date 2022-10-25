import { useTheme } from '@curvenote/ui-providers';
import { MoonIcon } from '@heroicons/react/24/solid';
import { SunIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';

export function ThemeButton({ className = 'mx-3 h-8 w-8' }: { className?: string }) {
  const { isDark, nextTheme } = useTheme();
  return (
    <button
      className={classNames(
        'theme rounded-full border border-white border-solid overflow-hidden text-white hover:text-stone-500 hover:bg-white',
        className,
      )}
      title={`Change theme to ${isDark ? 'light' : 'dark'} mode.`}
      aria-label={`Change theme to ${isDark ? 'light' : 'dark'} mode.`}
      onClick={nextTheme}
    >
      {isDark ? (
        <MoonIcon className="h-full w-full p-0.5" />
      ) : (
        <SunIcon className="h-full w-full p-0.5" />
      )}
    </button>
  );
}
