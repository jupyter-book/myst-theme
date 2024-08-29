import { useThemeSwitcher } from '@myst-theme/providers';
import { MoonIcon } from '@heroicons/react/24/solid';
import { SunIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';

export function ThemeButton({ className = 'w-8 h-8 mx-3' }: { className?: string }) {
  const { nextTheme } = useThemeSwitcher();
  return (
    <button
      className={classNames(
        'theme rounded-full border border-stone-700 dark:border-white hover:bg-neutral-100 border-solid overflow-hidden text-stone-700 dark:text-white hover:text-stone-500 dark:hover:text-neutral-800',
        className,
      )}
      title={`Toggle theme between light and dark mode.`}
      aria-label={`Toggle theme between light and dark mode.`}
      onClick={nextTheme}
    >
      <MoonIcon className="h-full w-full p-0.5 hidden dark:block" />
      <SunIcon className="h-full w-full p-0.5 dark:hidden" />
    </button>
  );
}
