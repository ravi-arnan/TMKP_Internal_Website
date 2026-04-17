import { useState, useEffect } from 'react';
import { 
  ExternalLink,
  UserCheck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { verificationService } from '@/src/lib/supabase';
import { VerificationRequest } from '@/src/types';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';

export default function Verification() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const data = await verificationService.getRequests();
      setRequests(data);
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => req.status === activeTab);
  const counts = {
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingId(id);
    await verificationService.updateStatus(id, status);
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    setSelectedRequest(null);
    setUpdatingId(null);
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-headline tracking-tight">Verifikasi Pendataan</h2>
        <p className="text-gray-500 dark:text-white/50">Tinjau dan setujui pendataan anggota baru</p>
      </section>

      <div className="flex gap-8 mb-6 border-b border-gray-200 dark:border-white/10">
        <button 
          onClick={() => setActiveTab('PENDING')}
          className={cn(
            "pb-3 px-2 border-b-2 font-bold text-sm flex items-center gap-2 transition-all",
            activeTab === 'PENDING' ? "border-green-400 text-green-400" : "border-transparent text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white"
          )}
        >
          Menunggu
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            activeTab === 'PENDING' ? "bg-green-500/20 text-green-400" : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/60"
          )}>
            {counts.PENDING}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('APPROVED')}
          className={cn(
            "pb-3 px-2 border-b-2 font-bold text-sm flex items-center gap-2 transition-all",
            activeTab === 'APPROVED' ? "border-green-400 text-green-400" : "border-transparent text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white"
          )}
        >
          Disetujui
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            activeTab === 'APPROVED' ? "bg-green-500/20 text-green-400" : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/60"
          )}>
            {counts.APPROVED}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('REJECTED')}
          className={cn(
            "pb-3 px-2 border-b-2 font-bold text-sm flex items-center gap-2 transition-all",
            activeTab === 'REJECTED' ? "border-red-400 text-red-400" : "border-transparent text-gray-500 dark:text-white/50 hover:text-gray-900 dark:text-white"
          )}
        >
          Ditolak
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            activeTab === 'REJECTED' ? "bg-red-500/20 text-red-400" : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-white/60"
          )}>
            {counts.REJECTED}
          </span>
        </button>
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex-1 bg-white dark:bg-white dark:bg-white/5 dark:backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Nama</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">NIM</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Jurusan</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest text-center">Angkatan</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Dokumen</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-white/50 italic">
                    Memuat data verifikasi...
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    className={cn(
                      "hover:bg-green-500/10 transition-colors cursor-pointer group",
                      selectedRequest?.id === req.id && "bg-green-500/10"
                    )}
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 font-bold text-xs">
                          {req.member.name?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-semibold text-sm text-gray-900 dark:text-white">{req.member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">{req.member.nim}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">{req.member.jurusan}</td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700 dark:text-white/70">{req.member.angkatan}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border-gray-300 dark:border-white/20">Bukti {req.document_type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-green-400 font-bold text-xs uppercase hover:underline">Lihat Detail</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-white/50 italic">
                    Tidak ada permintaan verifikasi dengan status ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {selectedRequest && (
            <motion.aside 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-[400px] bg-white dark:bg-black/60 shadow-2xl rounded-2xl flex flex-col h-[calc(100vh-200px)] sticky top-24 overflow-hidden border border-gray-200 dark:border-white/10 backdrop-blur-xl"
            >
              <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                <div className="relative z-10">
                  <h3 className="font-headline font-bold text-gray-900 dark:text-white">Detail Pendataan</h3>
                  <Badge 
                    variant={selectedRequest.status === 'PENDING' ? 'warning' : selectedRequest.status === 'APPROVED' ? 'success' : 'destructive'} 
                    className={cn(
                      "mt-1 border-none",
                      selectedRequest.status === 'PENDING' && "bg-yellow-500/20 text-yellow-400",
                      selectedRequest.status === 'APPROVED' && "bg-green-500/20 text-green-400",
                      selectedRequest.status === 'REJECTED' && "bg-red-500/20 text-red-400"
                    )}
                  >
                    {selectedRequest.status === 'PENDING' ? 'MENUNGGU VERIFIKASI' : selectedRequest.status === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'}
                  </Badge>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 dark:text-white/40 hover:text-red-400 transition-colors relative z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    {selectedRequest.member.photo_url ? (
                      <img 
                        src={selectedRequest.member.photo_url}
                        alt="Profile" 
                        className="w-24 h-24 rounded-2xl object-cover shadow-2xl border-4 border-gray-200 dark:border-white/10" 
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-green-500/10 text-green-400 shadow-2xl border-4 border-gray-200 dark:border-white/10 flex items-center justify-center text-xl font-bold">
                        {(selectedRequest.member.name || '?')
                          .split(' ')
                          .map((name) => name[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-lg text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold font-headline text-gray-900 dark:text-white">{selectedRequest.member.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-white/50">{selectedRequest.member.nim}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <DetailItem label="Fakultas" value={selectedRequest.member.fakultas || '-'} />
                  <DetailItem label="Jurusan" value={selectedRequest.member.jurusan || ''} />
                  <DetailItem label="Angkatan" value={selectedRequest.member.angkatan || ''} />
                  <DetailItem label="Tempat, Tgl Lahir" value={selectedRequest.member.tempat_tanggal_lahir || '-'} />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-3">
                    Dokumen Pendukung (Bukti {selectedRequest.document_type})
                  </label>
                  <div className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-white dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center">
                    <img 
                      src={selectedRequest.document_url} 
                      alt="Document Preview" 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" 
                    />
                    <div className="absolute inset-0 bg-white dark:bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                      <a href={selectedRequest.document_url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                        <Button variant="outline" className="bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border-gray-300 dark:border-white/20 hover:bg-white/20 gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Buka di Tab Baru
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequest.status === 'PENDING' && (
                <div className="p-4 bg-white dark:bg-white/5 border-t border-gray-200 dark:border-white/10 grid grid-cols-2 gap-3 relative z-10 backdrop-blur-xl">
                    <Button 
                      variant="outline" 
                      className="text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30"
                      disabled={updatingId === selectedRequest.id}
                      onClick={() => void handleUpdateStatus(selectedRequest.id, 'REJECTED')}
                    >
                      Tolak
                    </Button>
                    <Button 
                      className="bg-green-500 hover:bg-green-400 text-black border-none shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all font-bold"
                      disabled={updatingId === selectedRequest.id}
                      onClick={() => void handleUpdateStatus(selectedRequest.id, 'APPROVED')}
                    >
                      Setujui
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

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest block mb-1">{label}</label>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}
