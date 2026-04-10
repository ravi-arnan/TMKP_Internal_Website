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
import { useAuth } from '@/src/lib/auth-context';

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
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

  if (loading) {
    return (
      <div className="space-y-10">
        <section>
          <p className="text-green-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">Overview Tahunan</p>
          <h2 className="text-4xl font-extrabold text-white tracking-tighter">Rekapitulasi Organisasi</h2>
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
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
            <div className="h-64 space-y-6">
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                <div className="h-12 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                <div className="h-12 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Anggota Terbaru</h3>
              <p className="text-sm text-white/50">5 pendaftaran terakhir divalidasi sistem</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6">
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
        <p className="text-green-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">Overview Tahunan</p>
        <h2 className="text-4xl font-extrabold text-white tracking-tighter">Rekapitulasi Organisasi</h2>
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
          value={stats.monthlyEvents.toString().padStart(2, '0')} 
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
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-white">Sebaran Anggota per Angkatan</h3>
              <p className="text-xs text-white/50">Data pertumbuhan 5 tahun terakhir</p>
            </div>
            <button
              className="text-[10px] uppercase font-bold text-green-400 tracking-widest hover:text-green-300 hover:underline"
              onClick={handleExportChartCSV}
            >
              Download CSV
            </button>
          </div>
          <div className="h-64 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#000000', borderRadius: '8px', border: '1px solid #ffffff15', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)', color: '#ffffff' }}
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

        <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl flex flex-col border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          
          <h3 className="text-lg font-bold text-white mb-6 relative z-10">Status Kepengurusan</h3>
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-tighter">Struktur Aktif</p>
                <p className="text-sm font-bold text-white">Kabinet Reformasi 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-tighter">Masa Jabatan</p>
                <p className="text-sm font-bold text-white">182 Hari Tersisa</p>
              </div>
            </div>
          </div>
          {true && (
            <div className="mt-auto pt-8 relative z-10">
              <Button className="w-full py-6 uppercase tracking-widest text-xs bg-green-500 hover:bg-green-400 text-black border-none font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all rounded-xl" onClick={() => navigate('/dashboard/members/new')}>
                Tambah Anggota Baru
              </Button>
            </div>
          )}
        </div>
      </div>

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Anggota Terbaru</h3>
            <p className="text-sm text-white/50">5 pendaftaran terakhir divalidasi sistem</p>
          </div>
          <button
            className="text-xs font-bold text-green-400 uppercase tracking-widest hover:text-green-300 hover:underline"
            onClick={() => navigate('/dashboard/members')}
          >
            Lihat Semua Anggota
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Nama Lengkap</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">NIM</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Jurusan</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentMembers.map((member) => (
                <tr key={member.id} className="hover:bg-green-500/10 transition-colors group">
                  <td className="px-6 py-4 font-bold text-sm text-white">{member.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-white/70">{member.nim}</td>
                  <td className="px-6 py-4 text-xs text-white/80">{member.jurusan}</td>
                  <td className="px-6 py-4">
                    <Badge variant={member.status === 'AKTIF' ? 'success' : member.status === 'PENDING' ? 'warning' : 'default'} className={member.status === 'AKTIF' ? 'bg-green-500/20 text-green-400 border-none' : ''}>
                      {member.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-white/40 italic">
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
      className={cn(
        "bg-white/5 backdrop-blur-md p-6 rounded-2xl relative overflow-hidden group border border-white/10 shadow-2xl",
        variant === 'secondary' && "border-b-2 border-b-green-400"
      )}
    >
      <div className={cn(
        "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] transition-all duration-500",
        variant === 'secondary' ? "bg-emerald-500/20 group-hover:bg-emerald-500/30" : "bg-green-500/10 group-hover:bg-green-500/20"
      )}></div>
      <p className="text-white/50 font-bold uppercase tracking-widest text-[10px] mb-4 relative z-10">{label}</p>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className="text-3xl font-black text-white tracking-tighter">{value}</span>
        {growth && <span className="text-green-400 text-[11px] font-bold">{growth}</span>}
        {badge && <Badge variant="secondary" className="bg-white/10 text-white border-white/20">{badge}</Badge>}
      </div>
      {progress !== undefined && (
        <div className="mt-4 w-full bg-white/10 h-1 rounded-full overflow-hidden relative z-10">
          <div className="bg-green-500 h-full shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      <div className="mt-4 flex items-center gap-2 relative z-10">
        {Icon && <Icon className={cn("w-3.5 h-3.5", variant === 'secondary' ? "text-emerald-400" : "text-green-400")} />}
        <span className="text-[10px] text-white/50">{subtext}</span>
      </div>
    </motion.div>
  );
}
