import { Search, Bell, Sun, Moon } from 'lucide-react';
import { Input } from './ui/Input';
import { useTheme } from '@/src/lib/theme-context';

interface TopbarProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function Topbar({ title, searchValue, onSearchChange }: TopbarProps) {
  const { theme, toggle } = useTheme();

  return (
    <header className="flex justify-between items-center px-8 w-full h-16 sticky top-0 z-40 bg-white border-b border-gray-200 dark:bg-black/40 dark:border-white/10 dark:backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/50" />
          <Input
            className="pl-10 h-9 w-64 rounded-full text-xs"
            placeholder="Cari data..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
        <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10"></div>
        <button
          onClick={toggle}
          title="Ubah Tema"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition-all active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-white/10"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-white/60 dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition-all active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-white/10 shadow-sm">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
