import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Network, 
  CalendarDays, 
  FileText,
  Settings,
  LogOut,
  ArrowLeftToLine,
  ArrowRightToLine,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { useAuth } from '@/src/contexts/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Data Anggota', path: '/members' },
  { icon: UserCheck, label: 'Verifikasi', path: '/verification' },
  { icon: Network, label: 'Kepengurusan', path: '/organization' },
  { icon: CalendarDays, label: 'Kegiatan', path: '/events' },
  { icon: FileText, label: 'Laporan Keuangan', path: '/reports' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const userEmail = user?.email || '';
  const displayName = user?.user_metadata?.full_name || userEmail.split('@')[0] || 'Admin';
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen z-50 bg-slate-50/80 backdrop-blur-md flex flex-col py-6 px-4 gap-2 border-r border-slate-200 transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("flex items-center mb-8 transition-all", collapsed ? "flex-col gap-4" : "justify-between pl-2 pr-1")}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz2sOk9_ctAmla970vbrCqaDFX9RhIsD2SCR1SNgEwybn27NjHZQi8oLivg5RY-0s_Q8FGVQku7gskayuEy5NOQ1Sx13PXEoaXHx9Ioe6shCdi8fCPJDv9SIdLcjoBfILCYsFGSl_GIM-dyDY0Lr6lAdk9IIhpbE5f03q5iILyl3-BbvIT6V8vSxZbKzF2v-arEzndCzRhM56Q9MjBmZZ5oEy860bCWh4zTN5XFmHgH1Um3szGP1CF_z4RAUET6YA9h9kEaGJTPYE" 
                  alt="HMI Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-lg font-black text-primary uppercase tracking-widest font-headline">HMI TMKP</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Administrative Excellence</p>
              </motion.div>
            </div>
            <button 
              onClick={onToggle}
              className="text-slate-400 hover:text-primary transition-colors p-1.5 rounded-md hover:bg-slate-100 ml-4 group"
              title="Collapse Sidebar"
            >
              <motion.div
                whileHover={{ x: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowLeftToLine className="w-5 h-5" />
              </motion.div>
            </button>
          </>
        ) : (
          <button 
            onClick={onToggle}
            className="text-slate-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-slate-100 mb-2 group"
            title="Expand Sidebar"
          >
            <motion.div
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowRightToLine className="w-5 h-5" />
            </motion.div>
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : ""}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 transition-all font-headline uppercase tracking-wider text-[11px] font-semibold rounded-lg overflow-hidden",
              isActive 
                ? "text-primary border-l-4 border-accent-gold bg-primary/5" 
                : "text-gray-600 hover:bg-primary/10",
              collapsed && "justify-center px-0 border-l-0"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <div className={cn("p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3 overflow-hidden", collapsed && "justify-center p-2")}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden"
            >
              <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
            </motion.div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <button 
            title={collapsed ? "Settings" : ""}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-primary transition-colors font-headline uppercase tracking-wider text-[10px] font-semibold",
              collapsed && "justify-center px-0"
            )}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
          <button 
            title={collapsed ? "Logout" : ""}
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-gray-500 hover:text-red-600 transition-colors font-headline uppercase tracking-wider text-[10px] font-semibold",
              collapsed && "justify-center px-0"
            )}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
