import { type ComponentType, useEffect, useMemo, useState } from 'react';
import { Network, UserCheck, UserX, GraduationCap, Users } from 'lucide-react';
import { memberService } from '@/src/lib/supabase';
import { Member } from '@/src/types';
import { Badge } from '@/src/components/ui/Badge';
import { cn } from '@/src/lib/utils';

const officerCore = [
  { position: 'Ketua Komisariat', name: 'Admin Utama', period: '2025 - 2026' },
  { position: 'Sekretaris Umum', name: 'Sekretariat Internal', period: '2025 - 2026' },
  { position: 'Bendahara Umum', name: 'Keuangan Komisariat', period: '2025 - 2026' },
];

export default function Organization() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      try {
        const data = await memberService.getMembers();
        setMembers(data);
      } finally {
        setLoading(false);
      }
    };

    void loadMembers();
  }, []);

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((member) => member.status === 'AKTIF').length;
    const alumni = members.filter((member) => member.status === 'ALUMNI').length;
    const nonActive = members.filter((member) => member.status === 'NON-AKTIF').length;

    return { total, active, alumni, nonActive };
  }, [members]);

  const topDepartments = useMemo(() => {
    const byDepartment = members.reduce<Record<string, number>>((acc, member) => {
      const key = member.prodi || member.jurusan || 'Belum diisi';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(byDepartment)
      .map(([name, count]) => ({ name, count: Number(count) }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 6);
  }, [members]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-extrabold text-white font-headline tracking-tight">Kepengurusan Komisariat</h2>
        <p className="text-white/50">Ringkasan struktur inti dan distribusi anggota berdasarkan program studi</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Anggota" value={stats.total} icon={Users} />
        <StatCard label="Anggota Aktif" value={stats.active} icon={UserCheck} variant="success" />
        <StatCard label="Alumni" value={stats.alumni} icon={GraduationCap} variant="secondary" />
        <StatCard label="Non-Aktif" value={stats.nonActive} icon={UserX} variant="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-green-500/5 rounded-full blur-[60px] pointer-events-none"></div>
          
          <div className="px-6 py-5 border-b border-white/10 relative z-10">
            <h3 className="text-lg font-bold text-white">Struktur Inti</h3>
            <p className="text-xs text-white/50">Pengurus utama aktif periode berjalan</p>
          </div>
          <div className="divide-y divide-white/10 relative z-10">
            {officerCore.map((officer) => (
              <div key={officer.position} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-sm font-bold text-white">{officer.position}</p>
                  <p className="text-xs text-white/50">{officer.name}</p>
                </div>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">{officer.period}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-500/5 rounded-full blur-[60px] pointer-events-none"></div>
          
          <div className="flex items-center gap-2 mb-5 relative z-10">
            <Network className="w-4 h-4 text-green-400" />
            <h3 className="text-sm font-bold text-white">Prodi Terbanyak</h3>
          </div>

          {loading ? (
            <p className="text-sm text-white/50 relative z-10">Memuat komposisi anggota...</p>
          ) : topDepartments.length === 0 ? (
            <p className="text-sm text-white/50 relative z-10">Belum ada data anggota.</p>
          ) : (
            <ul className="space-y-4 relative z-10">
              {topDepartments.map((department) => {
                const ratio = stats.total > 0 ? Math.round((department.count / stats.total) * 100) : 0;
                return (
                  <li key={department.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-white/80">{department.name}</span>
                      <span className="text-white/50">{department.count} orang</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" style={{ width: `${ratio}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'primary',
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
}) {
  return (
    <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex items-center justify-between shadow-2xl group overflow-hidden relative">
      <div className={cn(
        "absolute -right-2 -top-2 w-20 h-20 rounded-full blur-[30px] transition-all duration-500",
        variant === 'secondary' && "bg-emerald-500/10 group-hover:bg-emerald-500/20",
        variant === 'success' && "bg-green-500/10 group-hover:bg-green-500/20",
        variant === 'danger' && "bg-red-500/10 group-hover:bg-red-500/20",
        variant === 'primary' && "bg-green-500/10 group-hover:bg-green-500/20",
      )}></div>
      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-1">{label}</p>
        <p className="text-2xl font-black text-white">{value.toLocaleString()}</p>
      </div>
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center relative z-10 border',
          variant === 'secondary' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          variant === 'success' && 'bg-green-500/10 text-green-400 border-green-500/20',
          variant === 'danger' && 'bg-red-500/10 text-red-400 border-red-500/20',
          variant === 'primary' && 'bg-green-500/10 text-green-400 border-green-500/20',
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
