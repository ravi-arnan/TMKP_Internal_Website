import { type ComponentType, useMemo } from 'react';
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  audience: string;
};

const upcomingEvents: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Rapat Koordinasi Bulanan',
    date: '2026-04-15',
    time: '19:30',
    location: 'Sekretariat TMKP',
    audience: 'Pengurus Inti',
  },
  {
    id: 'evt-2',
    title: 'Diskusi Kaderisasi Lanjutan',
    date: '2026-04-22',
    time: '18:30',
    location: 'Ruang Sidang Teknik',
    audience: 'Anggota Aktif',
  },
  {
    id: 'evt-3',
    title: 'Sosialisasi Program Semester',
    date: '2026-05-03',
    time: '09:00',
    location: 'Aula Fakultas',
    audience: 'Seluruh Anggota',
  },
];

export default function Events() {
  const grouped = useMemo(() => {
    return upcomingEvents.reduce<Record<string, EventItem[]>>((acc, event) => {
      const month = new Date(event.date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(event);
      return acc;
    }, {});
  }, []);

  const totalAudience = new Set(upcomingEvents.map((event) => event.audience)).size;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-headline tracking-tight">Agenda Kegiatan</h2>
        <p className="text-gray-500 dark:text-white/50">Jadwal kegiatan internal untuk koordinasi, kaderisasi, dan konsolidasi anggota</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard label="Agenda Terjadwal" value={upcomingEvents.length.toString()} icon={CalendarDays} />
        <SummaryCard label="Kategori Audiens" value={totalAudience.toString()} icon={Users} />
        <SummaryCard
          label="Agenda Terdekat"
          value={new Date(upcomingEvents[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          icon={Clock3}
        />
      </div>

      <div className="bg-white dark:bg-white dark:bg-white/5 dark:backdrop-blur-md rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rencana Kegiatan Internal</h3>
          <p className="text-xs text-gray-500 dark:text-white/50">Daftar kegiatan terurut berdasarkan bulan pelaksanaan</p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-white/10">
          {(Object.entries(grouped) as Array<[string, EventItem[]]>).map(([month, events]) => (
            <div key={month} className="px-6 py-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-green-400">{month}</h4>
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="rounded-xl border border-gray-200 dark:border-white/10 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-white dark:bg-white/5 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{event.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-white/50">
                        <span>{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        <span>{event.time} WIB</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-green-400" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border-gray-300 dark:border-white/20">{event.audience}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-white dark:bg-white dark:bg-white/5 dark:backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-[40px] group-hover:bg-green-500/20 transition-all duration-500 pointer-events-none"></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/50 font-bold mb-1">{label}</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
