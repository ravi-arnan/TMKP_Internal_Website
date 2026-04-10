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
    if (location.pathname.startsWith('/dashboard/members')) return 'Data Anggota';

    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/dashboard/verification': return 'Verifikasi';
      case '/dashboard/organization': return 'Kepengurusan';
      case '/dashboard/events': return 'Kegiatan';
      case '/dashboard/reports': return 'Laporan Keuangan';
      case '/dashboard/settings': return 'Settings';
      default: return 'HMI TMKP';
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex font-['Instrument_Sans',sans-serif]">
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
        <footer className="w-full py-6 mt-auto bg-white/5 border-t border-white/10 backdrop-blur-sm">
          <div className="flex justify-between items-center px-10">
            <p className="text-xs text-white/50">© 2025 HMI TMKP. All Rights Reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-xs text-white/50 hover:text-green-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-white/50 hover:text-green-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-xs text-white/50 hover:text-green-400 transition-colors">Contact Support</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
