import { NavLink, useNavigate } from "react-router-dom";
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
  Sun,
  PackageOpen,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";
import { useAuth } from "@/src/lib/auth-context";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Data Anggota", path: "/dashboard/members" },
  { icon: UserCheck, label: "Verifikasi", path: "/dashboard/verification" },
  { icon: PackageOpen, label: "Peminjaman", path: "/dashboard/borrowing" },
  { icon: Network, label: "Kepengurusan", path: "/dashboard/organization" },
  { icon: CalendarDays, label: "Kegiatan", path: "/dashboard/events" },
  { icon: FileText, label: "Laporan Keuangan", path: "/dashboard/reports" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItemBase =
  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition overflow-hidden";

const inactiveNav =
  "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white";

const activeNav =
  "text-green-700 bg-green-50 border-l-2 border-green-600 dark:text-green-400 dark:bg-green-500/10 dark:border-green-400";

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col py-6 px-4 gap-2 transition-all duration-300 ease-in-out",
        "bg-white border-r border-gray-200 dark:bg-black/40 dark:border-white/10 dark:backdrop-blur-xl dark:shadow-2xl",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex items-center mb-8 transition-all",
          collapsed ? "flex-col gap-4" : "justify-between pl-2 pr-1",
        )}
      >
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center shrink-0 dark:bg-green-500/15 dark:border dark:border-green-500/30">
                <Sun className="w-5 h-5 text-white dark:text-green-400" />
              </div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-base font-bold text-gray-900 dark:text-white">
                  HMI TMKP
                </h1>
              </motion.div>
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-700 dark:text-white/40 dark:hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 group"
              title="Collapse Sidebar"
            >
              <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.9 }}>
                <ArrowLeftToLine className="w-5 h-5" />
              </motion.div>
            </button>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center shrink-0 dark:bg-green-500/15 dark:border dark:border-green-500/30 mb-2">
              <Sun className="w-5 h-5 text-white dark:text-green-400" />
            </div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-700 dark:text-white/40 dark:hover:text-white transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 mb-2 group"
              title="Expand Sidebar"
            >
              <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.9 }}>
                <ArrowRightToLine className="w-5 h-5" />
              </motion.div>
            </button>
          </>
        )}
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            title={collapsed ? item.label : ""}
            className={({ isActive }) =>
              cn(
                navItemBase,
                isActive ? activeNav : inactiveNav,
                collapsed && "justify-center px-0",
              )
            }
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

      <div className="mt-auto flex flex-col gap-1 pt-3 border-t border-gray-200 dark:border-white/10">
        <NavLink
          to="/dashboard/settings"
          title={collapsed ? "Settings" : ""}
          className={({ isActive }) =>
            cn(
              navItemBase,
              isActive ? activeNav : inactiveNav,
              collapsed && "justify-center px-0",
            )
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Pengaturan</span>}
        </NavLink>

        <button
          title={collapsed ? "Logout" : ""}
          className={cn(
            navItemBase,
            "text-gray-700 hover:text-red-600 hover:bg-red-50 dark:text-white/60 dark:hover:text-red-400 dark:hover:bg-red-500/10",
            collapsed && "justify-center px-0",
          )}
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <div
          className={cn(
            navItemBase,
            inactiveNav,
            "cursor-default",
            collapsed && "justify-center px-0",
          )}
        >
          <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 shrink-0 flex items-center justify-center text-xs font-bold">
            {(session?.name || 'AT').split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden flex-1 flex items-center justify-between min-w-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                  {session?.name || 'Admin TMKP'}
                </p>
                <p className="text-xs text-gray-500 dark:text-white/50 truncate leading-tight">
                  Admin Panel
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 dark:text-white/40 shrink-0" />
            </motion.div>
          )}
        </div>
      </div>
    </aside>
  );
}
