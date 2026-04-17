import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIChatbot from './AIChatbot';
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
      case '/dashboard/borrowing': return 'Peminjaman';
      case '/dashboard/organization': return 'Kepengurusan';
      case '/dashboard/events': return 'Kegiatan';
      case '/dashboard/reports': return 'Laporan Keuangan';
      case '/dashboard/settings': return 'Pengaturan';
      default: return 'HMI TMKP';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white flex font-['Instrument_Sans',sans-serif]">
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
      </main>
      <AIChatbot />
    </div>
  );
}
