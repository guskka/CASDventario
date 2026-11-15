import { MoonIcon, SunIcon } from '@phosphor-icons/react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTimeout(() => {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }, 300);
  };

  return (
    <Button variant="theme" size="icon" onClick={toggleTheme}>
      <SunIcon
        weight="regular"
        className={`absolute group-hover:hidden h-[1.2rem] w-[1.2rem] scale-100 rotate-0 duration-500 transition-all dark:scale-0 dark:-rotate-90`}
      />
      <SunIcon
        weight="fill"
        className={`absolute hidden group-hover:block h-[1.2rem] w-[1.2rem] scale-100 rotate-0 duration-500 transition-all dark:scale-0 dark:-rotate-90`}
      />
      <MoonIcon
        weight="regular"
        className={`absolute group-hover:hidden h-[1.2rem] w-[1.2rem] scale-0 rotate-90 duration-500 transition-all dark:scale-100 dark:rotate-0`}
      />
      <MoonIcon
        weight="fill"
        className={`absolute hidden group-hover:block h-[1.2rem] w-[1.2rem] scale-0 rotate-90 duration-500 transition-all dark:scale-100 dark:rotate-0`}
      />
    </Button>
  );
}
