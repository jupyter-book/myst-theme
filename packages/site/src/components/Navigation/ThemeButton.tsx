import { useThemeSwitcher } from '@myst-theme/providers';
import { MoonIcon } from '@heroicons/react/24/solid';
import { SunIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';

export function ThemeButton({ className = 'w-10 h-10 mx-3' }: { className?: string }) {
  const { nextTheme } = useThemeSwitcher();
  return (
    <button
      className={classNames(
        'myst-theme-button theme rounded-full aspect-square border border-myst-border-strong hover:bg-myst-surface border-solid overflow-hidden text-myst-text-secondary',
        className,
      )}
      title={`Toggle theme between light and dark mode`}
      aria-label={`Toggle theme between light and dark mode`}
      onClick={nextTheme}
    >
      <MoonIcon className="myst-theme-moon-icon h-full w-full p-0.5 hidden dark:block" />
      <SunIcon className="myst-theme-sun-icon h-full w-full p-0.5 dark:hidden" />
    </button>
  );
}
