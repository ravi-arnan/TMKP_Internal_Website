import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  GraduationCap, 
  Calendar,
  ArrowUpRight,
  Star,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
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
import { cn } from '@/src/lib/utils';

const chartData = [
  { year: '2020', count: 180 },
  { year: '2021', count: 245 },
  { year: '2022', count: 310 },
  { year: '2023', count: 280 },
  { year: '2024', count: 312 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentMembers, setRecentMembers] = useState<Member[]>([]);

  useEffect(() => {
    dashboardService.getStats().then(setStats);
    memberService.getMembers().then(members => setRecentMembers(members.slice(0, 5)));
  }, []);

  if (!stats) return null;

  return (
    <div className="space-y-10">
      <section>
        <p className="text-accent-gold font-bold text-xs uppercase tracking-[0.2em] mb-1">Overview Tahunan</p>
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tighter">Rekapitulasi Organisasi</h2>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Anggota Aktif" 
          value={stats.totalActive.toLocaleString()} 
          growth={`+${stats.activeGrowth}%`}
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
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sebaran Anggota per Angkatan</h3>
              <p className="text-xs text-slate-500">Data pertumbuhan 5 tahun terakhir</p>
            </div>
            <button className="text-[10px] uppercase font-bold text-primary tracking-widest hover:underline">Download CSV</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === chartData.length - 1 ? '#1a6b3c' : '#1a6b3c20'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl flex flex-col border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Status Kepengurusan</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-tighter">Struktur Aktif</p>
                <p className="text-sm font-bold">Kabinet Reformasi 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-gold/5 flex items-center justify-center text-accent-gold border border-accent-gold/10">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-tighter">Masa Jabatan</p>
                <p className="text-sm font-bold">182 Hari Tersisa</p>
              </div>
            </div>
          </div>
          <div className="mt-auto pt-8">
            <Button className="w-full py-6 uppercase tracking-widest text-xs" onClick={() => navigate('/members/new')}>
              Tambah Anggota Baru
            </Button>
          </div>
        </div>
      </div>

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Anggota Terbaru</h3>
            <p className="text-sm text-slate-500">5 pendaftaran terakhir divalidasi sistem</p>
          </div>
          <button className="text-xs font-bold text-accent-gold uppercase tracking-widest hover:underline">Lihat Semua Anggota</button>
        </div>
        <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nama Lengkap</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">NIM</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Jurusan</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentMembers.map((member) => (
                <tr key={member.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4 font-bold text-sm">{member.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{member.nim}</td>
                  <td className="px-6 py-4 text-xs">{member.jurusan}</td>
                  <td className="px-6 py-4">
                    <Badge variant={member.status === 'AKTIF' ? 'success' : member.status === 'PENDING' ? 'warning' : 'default'}>
                      {member.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 italic">22 Mei 2025</td>
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
        "bg-white p-6 rounded-xl relative overflow-hidden group border border-slate-200 shadow-sm",
        variant === 'secondary' && "border-b-2 border-accent-gold/50"
      )}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
      <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px] mb-4">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-slate-900 tracking-tighter">{value}</span>
        {growth && <span className="text-primary text-[11px] font-bold">{growth}</span>}
        {badge && <Badge variant="secondary">{badge}</Badge>}
      </div>
      {progress !== undefined && (
        <div className="mt-4 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      <div className="mt-4 flex items-center gap-2">
        {Icon && <Icon className={cn("w-3.5 h-3.5", variant === 'secondary' ? "text-accent-gold" : "text-primary")} />}
        <span className="text-[10px] text-slate-500">{subtext}</span>
      </div>
    </motion.div>
  );
}
