import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Calendar,
  Star,
  CheckCircle2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { dashboardService, memberService } from '@/src/lib/supabase';
import { DashboardStats, Member } from '@/src/types';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/src/components/ui/Skeleton';
import { cn } from '@/src/lib/utils';
import Papa from 'papaparse';
import { useTheme } from '@/src/lib/theme-context';

const cardBase =
  'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-2xl dark:backdrop-blur-md';

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [statsData, membersData] = await Promise.all([
        dashboardService.getStats(),
        memberService.getMembers(),
      ]);
      setStats(statsData);
      setMembers(membersData);
      setRecentMembers(membersData.slice(0, 5));
      setLoading(false);
    };
    load();
  }, []);

  const groupedByAngkatan = members.reduce<Record<string, { year: string; count: number }>>((acc, member) => {
    const key = member.angkatan || 'Tidak Diketahui';
    if (!acc[key]) {
      acc[key] = { year: key, count: 0 };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  const chartData = Object.keys(groupedByAngkatan)
    .map((year) => groupedByAngkatan[year])
    .sort((a, b) => a.year.localeCompare(b.year, undefined, { numeric: true }));

  const handleExportChartCSV = () => {
    const csv = Papa.unparse(chartData.map((item) => ({ Angkatan: item.year, Jumlah: item.count })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sebaran_angkatan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tooltipStyle = theme === 'dark'
    ? { backgroundColor: '#000000', borderRadius: '8px', border: '1px solid #ffffff15', color: '#ffffff' }
    : { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#111827' };

  const gridStroke = theme === 'dark' ? '#ffffff10' : '#e5e7eb';
  const axisColor = theme === 'dark' ? '#94a3b8' : '#6b7280';

  if (loading) {
    return (
      <div className="space-y-10">
        <section>
          <p className="text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">Overview Tahunan</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Rekapitulasi Organisasi</h2>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
          <div className={cn(cardBase, 'p-8')}>
            <div className="h-64 space-y-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 animate-pulse" />
                <div className="h-12 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 animate-pulse" />
                <div className="h-12 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Anggota Terbaru</h3>
              <p className="text-sm text-gray-500 dark:text-white/50">5 pendaftaran terakhir divalidasi sistem</p>
            </div>
          </div>
          <div className={cn(cardBase, 'p-6')}>
            <TableSkeleton rows={5} columns={5} />
          </div>
        </section>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-10">
      <section>
        <p className="text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">Overview Tahunan</p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Rekapitulasi Organisasi</h2>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Anggota Aktif"
          value={stats.totalActive.toLocaleString()}
          growth={`${stats.activeGrowth > 0 ? '+' : ''}${stats.activeGrowth}%`}
          icon={TrendingUp}
          subtext="Meningkat dari periode lalu"
        />
        <StatCard
          label="Anggota Baru (Angkatan Ini)"
          value={stats.newMembers.toString()}
          badge="New"
          icon={Star}
          subtext="Target: 400 Anggota"
          variant="secondary"
        />
        <StatCard
          label="Kegiatan Bulan Ini"
          value={stats.monthlyEvents.toString()}
          icon={Calendar}
          subtext="3 Mendatang, 5 Selesai"
        />
        <StatCard
          label="Tingkat Kehadiran"
          value={`${stats.attendanceRate}%`}
          progress={stats.attendanceRate}
          subtext="Rata-rata kehadiran pleno"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn(cardBase, 'lg:col-span-2 p-8 relative overflow-hidden')}>
          <div className="hidden dark:block absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sebaran Anggota per Angkatan</h3>
              <p className="text-xs text-gray-500 dark:text-white/50">Data pertumbuhan 5 tahun terakhir</p>
            </div>
            <button
              className="text-[10px] uppercase font-bold text-green-700 dark:text-green-400 tracking-widest hover:text-green-600 dark:hover:text-green-300 hover:underline"
              onClick={handleExportChartCSV}
            >
              Download CSV
            </button>
          </div>
          <div className="h-64 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: axisColor, fontWeight: 500 }}
                  dy={10}
                />
                <Tooltip
                  cursor={{ fill: theme === 'dark' ? '#ffffff05' : '#f3f4f6' }}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: '#22c55e' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === chartData.length - 1 ? '#22c55e' : '#22c55e40'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn(cardBase, 'p-8 flex flex-col relative overflow-hidden')}>
          <div className="hidden dark:block absolute top-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] pointer-events-none" />

          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 relative z-10">Status Kepengurusan</h3>
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-tighter">Struktur Aktif</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Kabinet Reformasi 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-tighter">Masa Jabatan</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">182 Hari Tersisa</p>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-8 relative z-10">
            <Button className="w-full py-6 rounded-xl" onClick={() => navigate('/dashboard/members/new')}>
              Tambah Anggota Baru
            </Button>
          </div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Anggota Terbaru</h3>
            <p className="text-sm text-gray-500 dark:text-white/50">5 pendaftaran terakhir divalidasi sistem</p>
          </div>
          <button
            className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest hover:text-green-600 dark:hover:text-green-300 hover:underline"
            onClick={() => navigate('/dashboard/members')}
          >
            Lihat Semua Anggota
          </button>
        </div>
        <div className={cn(cardBase, 'overflow-hidden')}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-[0.2em]">Nama Lengkap</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-[0.2em]">NIM</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-[0.2em]">Jurusan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-[0.2em]">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {recentMembers.map((member) => (
                <tr key={member.id} className="hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm text-gray-900 dark:text-white">{member.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-white/70">{member.nim}</td>
                  <td className="px-6 py-4 text-xs text-gray-700 dark:text-white/80">{member.jurusan}</td>
                  <td className="px-6 py-4">
                    <Badge variant={member.status === 'AKTIF' ? 'success' : member.status === 'PENDING' ? 'warning' : 'default'}>
                      {member.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 dark:text-white/40 italic">
                    {new Date(member.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, growth, badge, icon: Icon, subtext, progress, variant = 'primary' }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(cardBase, 'p-6 relative overflow-hidden group')}
    >
      <div className={cn(
        'hidden dark:block absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] transition-all duration-500',
        variant === 'secondary' ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' : 'bg-green-500/10 group-hover:bg-green-500/20'
      )} />
      <p className="text-gray-500 dark:text-white/50 font-bold uppercase tracking-widest text-[10px] mb-4 relative z-10">{label}</p>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</span>
        {growth && <span className="text-green-600 dark:text-green-400 text-[11px] font-bold">{growth}</span>}
        {badge && <Badge variant="secondary">{badge}</Badge>}
      </div>
      {progress !== undefined && (
        <div className="mt-4 w-full bg-gray-200 dark:bg-white/10 h-1 rounded-full overflow-hidden relative z-10">
          <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="mt-4 flex items-center gap-2 relative z-10">
        {Icon && <Icon className={cn('w-3.5 h-3.5', variant === 'secondary' ? 'text-emerald-600 dark:text-emerald-400' : 'text-green-600 dark:text-green-400')} />}
        <span className="text-[10px] text-gray-500 dark:text-white/50">{subtext}</span>
      </div>
    </motion.div>
  );
}
