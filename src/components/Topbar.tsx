import { Search, Bell } from 'lucide-react';
import { Input } from './ui/Input';

interface TopbarProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function Topbar({ title, searchValue, onSearchChange }: TopbarProps) {
  return (
    <header className="flex justify-between items-center px-8 w-full h-16 sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-primary/15">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            className="pl-10 h-9 w-64 bg-slate-100 border-none rounded-full text-xs" 
            placeholder="Cari data..." 
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold text-primary font-headline">{title}</h2>
        <div className="h-8 w-[1px] bg-slate-200"></div>
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all active:scale-95">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
