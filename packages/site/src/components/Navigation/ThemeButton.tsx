import { useThemeSwitcher } from '@myst-theme/providers';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';
import classNames from 'classnames';

export function ThemeButton({ className = 'w-10 h-10 mx-3' }: { className?: string }) {
  const { nextTheme } = useThemeSwitcher();
  return (
    <button
      className={classNames(
        'myst-theme-button theme shrink-0 rounded-full border border-myst-border-strong hover:bg-myst-surface border-solid overflow-hidden text-myst-text-secondary',
        className,
      )}
      title={`Toggle theme between light and dark mode`}
      aria-label={`Toggle theme between light and dark mode`}
      onClick={nextTheme}
    >
      <MoonIcon className="myst-theme-moon-icon h-full w-full p-[18%] hidden dark:block" />
      <SunIcon className="myst-theme-sun-icon h-full w-full p-[18%] dark:hidden" />
    </button>
  );
}
