import { type ComponentType, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, Mail, Package, Phone, Undo2, User, X } from 'lucide-react';
import { borrowingService } from '@/src/lib/supabase';
import { BorrowingRequest, BorrowingStatus } from '@/src/types';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

type Tab = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';

const TAB_LABELS: Record<Tab, string> = {
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  RETURNED: 'Dikembalikan',
};

const STATUS_LABELS: Record<BorrowingStatus, string> = {
  PENDING: 'MENUNGGU TINJAUAN',
  APPROVED: 'DISETUJUI',
  REJECTED: 'DITOLAK',
  RETURNED: 'DIKEMBALIKAN',
};

const formatDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function BorrowingReview() {
  const [requests, setRequests] = useState<BorrowingRequest[]>([]);
  const [selected, setSelected] = useState<BorrowingRequest | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('PENDING');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await borrowingService.getRequests();
        setRequests(data);
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, []);

  const counts = useMemo(
    () => ({
      PENDING: requests.filter((r) => r.status === 'PENDING').length,
      APPROVED: requests.filter((r) => r.status === 'APPROVED').length,
      REJECTED: requests.filter((r) => r.status === 'REJECTED').length,
      RETURNED: requests.filter((r) => r.status === 'RETURNED').length,
    }),
    [requests],
  );

  const filtered = useMemo(() => requests.filter((r) => r.status === activeTab), [requests, activeTab]);

  const handleUpdate = async (id: string, status: BorrowingStatus) => {
    setUpdatingId(id);
    try {
      await borrowingService.updateStatus(id, status);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    } finally {
      setUpdatingId(null);
    }
  };

  const tabTint = (tab: Tab) => {
    if (tab === 'REJECTED') return 'text-red-600 dark:text-red-400 border-red-500 dark:border-red-400';
    if (tab === 'RETURNED') return 'text-blue-600 dark:text-blue-400 border-blue-500 dark:border-blue-400';
    return 'text-green-700 dark:text-green-400 border-green-600 dark:border-green-400';
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Peminjaman Barang</h2>
        <p className="text-gray-500 dark:text-white/50">Tinjau dan kelola permintaan peminjaman inventaris komisariat</p>
      </section>

      <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-white/10">
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 px-2 border-b-2 font-semibold text-sm flex items-center gap-2 transition-all',
                isActive
                  ? tabTint(tab)
                  : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-white/50 dark:hover:text-white',
              )}
            >
              {TAB_LABELS[tab]}
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/60',
                  isActive && tab === 'REJECTED' && 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
                  isActive && tab === 'RETURNED' && 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
                )}
              >
                {counts[tab]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex-1 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl dark:backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Pemohon</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Barang</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest text-center">Jumlah</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Tgl Pinjam</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Tgl Kembali</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-white/50 italic">
                    Memuat data peminjaman...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((req) => (
                  <tr
                    key={req.id}
                    className={cn(
                      'hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors cursor-pointer',
                      selected?.id === req.id && 'bg-green-50 dark:bg-green-500/10',
                    )}
                    onClick={() => setSelected(req)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-xs">
                          {req.requester_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-gray-900 dark:text-white block">{req.requester_name}</span>
                          <span className="text-xs text-gray-500 dark:text-white/50">{req.requester_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">{req.item_name}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700 dark:text-white/70">{req.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">{formatDate(req.borrow_date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">{formatDate(req.return_date)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-green-700 dark:text-green-400 font-bold text-xs uppercase hover:underline">
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-white/50 italic">
                    Tidak ada permintaan peminjaman pada status ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-[400px] bg-white dark:bg-black/60 shadow-xl dark:shadow-2xl rounded-2xl flex flex-col h-[calc(100vh-200px)] sticky top-24 overflow-hidden border border-gray-200 dark:border-white/10 dark:backdrop-blur-xl"
            >
              <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center relative overflow-hidden">
                <div className="hidden dark:block absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[40px] pointer-events-none" />
                <div className="relative z-10">
                  <h3 className="font-bold text-gray-900 dark:text-white">Detail Peminjaman</h3>
                  <Badge
                    variant={
                      selected.status === 'PENDING'
                        ? 'warning'
                        : selected.status === 'APPROVED'
                        ? 'success'
                        : selected.status === 'REJECTED'
                        ? 'destructive'
                        : 'info'
                    }
                    className="mt-1"
                  >
                    {STATUS_LABELS[selected.status]}
                  </Badge>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 transition-colors relative z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-4 border-white dark:border-white/10 shadow-sm flex items-center justify-center text-xl font-bold">
                    {selected.requester_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <h4 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">{selected.requester_name}</h4>
                  <p className="text-sm text-gray-500 dark:text-white/50">{selected.requester_affiliation || '-'}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <DetailRow icon={Mail} label="Email" value={selected.requester_email} />
                  <DetailRow icon={Phone} label="No. HP" value={selected.requester_phone || '-'} />
                  <DetailRow icon={Package} label="Barang" value={`${selected.item_name} (${selected.quantity})`} />
                  <DetailRow icon={CalendarDays} label="Tanggal Pinjam" value={formatDate(selected.borrow_date)} />
                  <DetailRow icon={CalendarDays} label="Tanggal Kembali" value={formatDate(selected.return_date)} />
                  <DetailRow icon={User} label="Diajukan" value={formatDate(selected.created_at)} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-2">
                    Keperluan
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{selected.purpose}</p>
                </div>

                {selected.notes && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-2">
                      Catatan
                    </label>
                    <p className="text-sm text-gray-700 dark:text-white/70 whitespace-pre-wrap">{selected.notes}</p>
                  </div>
                )}
              </div>

              {selected.status === 'PENDING' && (
                <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/10"
                    disabled={updatingId === selected.id}
                    onClick={() => void handleUpdate(selected.id, 'REJECTED')}
                  >
                    Tolak
                  </Button>
                  <Button disabled={updatingId === selected.id} onClick={() => void handleUpdate(selected.id, 'APPROVED')}>
                    Setujui
                  </Button>
                </div>
              )}

              {selected.status === 'APPROVED' && (
                <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-200 dark:border-white/10">
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    disabled={updatingId === selected.id}
                    onClick={() => void handleUpdate(selected.id, 'RETURNED')}
                  >
                    <Undo2 className="w-4 h-4" />
                    Tandai Dikembalikan
                  </Button>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0 text-gray-600 dark:text-white/60">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block">{label}</label>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}
