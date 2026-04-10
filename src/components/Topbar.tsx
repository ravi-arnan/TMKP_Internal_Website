import { Search, Bell } from 'lucide-react';
import { Input } from './ui/Input';

interface TopbarProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function Topbar({ title, searchValue, onSearchChange }: TopbarProps) {
  return (
    <header className="flex justify-between items-center px-8 w-full h-16 sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input 
            className="pl-10 h-9 w-64 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-full text-xs focus:ring-green-500/30 focus:border-green-500/50" 
            placeholder="Cari data..." 
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
        <div className="h-8 w-[1px] bg-white/10"></div>
        <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all active:scale-95 border border-transparent hover:border-white/10 shadow-sm">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
