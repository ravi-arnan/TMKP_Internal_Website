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
  Sun
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";
import { useAuth } from "@/src/lib/auth-context";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Data Anggota", path: "/dashboard/members" },
  { icon: UserCheck, label: "Verifikasi", path: "/dashboard/verification" },
  { icon: Network, label: "Kepengurusan", path: "/dashboard/organization" },
  { icon: CalendarDays, label: "Kegiatan", path: "/dashboard/events" },
  { icon: FileText, label: "Laporan Keuangan", path: "/dashboard/reports" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const visibleNavItems = navItems;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-50 bg-black/40 backdrop-blur-xl flex flex-col py-6 px-4 gap-2 border-r border-white/10 transition-all duration-300 ease-in-out shadow-2xl",
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
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/30">
                <Sun className="w-6 h-6 text-green-400" />
              </div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-lg font-black text-white uppercase tracking-widest font-headline">
                  HMI TMKP
                </h1>
                <p className="text-[10px] text-green-400/80 font-medium uppercase tracking-tighter">
                  Administrative Excellence
                </p>
              </motion.div>
            </div>
            <button
              onClick={onToggle}
              className="text-white/40 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10 ml-4 group"
              title="Collapse Sidebar"
            >
              <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.9 }}>
                <ArrowLeftToLine className="w-5 h-5" />
              </motion.div>
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/30 mb-2">
              <Sun className="w-6 h-6 text-green-400" />
            </div>
            <button
              onClick={onToggle}
              className="text-white/40 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 mb-2 group"
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
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            title={collapsed ? item.label : ""}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 transition-all font-headline uppercase tracking-wider text-[11px] font-semibold rounded-xl overflow-hidden",
                isActive
                  ? "text-green-400 border-l-4 border-green-400 bg-green-500/10 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center px-0 border-l-0",
              )
            }
          >
            <item.icon className={cn("w-4 h-4 shrink-0")} />
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
        <div
          className={cn(
            "p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3 overflow-hidden backdrop-blur-md",
            collapsed && "justify-center p-2",
          )}
        >
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXZiGgRrcnQ1NBprCyWvH1uEtkcfL8g1CIlXk0yC7DUEm1c63K7lQNIc2YwrUc-m6mwX7lGbCXu4LZJ-S8-f6sIlJpsNZWOp68eNomImnzamKLfjZnu3jODTYADnMNjQ8uE6N0UufABE-mPOlDl-vK5nScWX6Qwk7Z3FqZ9s4F51QbciFdeRuRb0d0MBvVVk1ooebswT60wvXNo4i60TVGIZMYGwkoNpOeytWQ1bqo0AIwuvYCe_VyKCOMqLxqESCgRQoAtjToYvE"
            alt="User Avatar"
            className="w-9 h-9 rounded-full bg-green-500/20 shrink-0 border border-green-500/20"
          />
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden"
            >
              <p className="text-xs font-bold text-white truncate">
                {session?.name || 'Admin Utama'}
              </p>
              <p className="text-[10px] text-green-400 truncate">
                Admin Panel
              </p>
            </motion.div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <NavLink
            to="/dashboard/settings"
            title={collapsed ? "Settings" : ""}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-white/50 hover:text-white transition-colors font-headline uppercase tracking-wider text-[10px] font-semibold rounded-lg hover:bg-white/5",
              collapsed && "justify-center px-0",
            )}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
          <button
            title={collapsed ? "Logout" : ""}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-headline uppercase tracking-wider text-[10px] font-semibold",
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
        </div>
      </div>
    </aside>
  );
}
