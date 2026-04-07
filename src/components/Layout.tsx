import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { cn } from '@/src/lib/utils';

export default function Layout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/members': return 'Data Anggota';
      case '/verification': return 'Verifikasi';
      case '/organization': return 'Kepengurusan';
      case '/events': return 'Kegiatan';
      case '/reports': return 'Laporan Keuangan';
      default: return 'HMI TMKP';
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        collapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <main 
        className={cn(
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out flex-1",
          isSidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <Topbar 
          title={getTitle()} 
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <div className="p-8 flex-1">
          <Outlet context={{ searchQuery }} />
        </div>
        <footer className="w-full py-6 mt-auto bg-white border-t border-primary/15">
          <div className="flex justify-between items-center px-10">
            <p className="text-xs text-slate-500">© 2025 HMI TMKP. All Rights Reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-slate-500 hover:text-accent-gold transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-slate-500 hover:text-accent-gold transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-slate-500 hover:text-accent-gold transition-colors">Contact Support</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
