import { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  UserCheck,
  X,
  Loader2
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    verificationService.getRequests().then(setRequests).catch(console.error);
  }, []);

  const filteredRequests = requests.filter(req => req.status === activeTab);
  const counts = {
    PENDING: requests.filter(r => r.status === 'PENDING').length,
    APPROVED: requests.filter(r => r.status === 'APPROVED').length,
    REJECTED: requests.filter(r => r.status === 'REJECTED').length,
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setUpdatingId(id);
    try {
      await verificationService.updateStatus(id, status);
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
      setSelectedRequest(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 font-headline tracking-tight">Verifikasi Pendataan</h2>
        <p className="text-slate-500">Tinjau dan setujui pendataan anggota baru</p>
      </section>

      <div className="flex gap-8 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('PENDING')}
          className={cn(
            "pb-3 px-2 border-b-2 font-bold text-sm flex items-center gap-2 transition-all",
            activeTab === 'PENDING' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Menunggu
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            activeTab === 'PENDING' ? "bg-accent-gold text-white" : "bg-slate-200 text-slate-600"
          )}>
            {counts.PENDING}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('APPROVED')}
          className={cn(
            "pb-3 px-2 border-b-2 font-bold text-sm flex items-center gap-2 transition-all",
            activeTab === 'APPROVED' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Disetujui
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            activeTab === 'APPROVED' ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
          )}>
            {counts.APPROVED}
          </span>
        </button>
        <button 
          onClick={() => setActiveTab('REJECTED')}
          className={cn(
            "pb-3 px-2 border-b-2 font-bold text-sm flex items-center gap-2 transition-all",
            activeTab === 'REJECTED' ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-900"
          )}
        >
          Ditolak
          <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            activeTab === 'REJECTED' ? "bg-red-500 text-white" : "bg-slate-200 text-slate-600"
          )}>
            {counts.REJECTED}
          </span>
        </button>
      </div>

      <div className="flex gap-8 items-start">
        <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nama</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">NIM</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Jurusan</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Angkatan</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Dokumen</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    className={cn(
                      "hover:bg-primary/5 transition-colors cursor-pointer group",
                      selectedRequest?.id === req.id && "bg-primary/5"
                    )}
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {req.member.name?.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-semibold text-sm">{req.member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{req.member.nim}</td>
                    <td className="px-6 py-4 text-sm">{req.member.jurusan}</td>
                    <td className="px-6 py-4 text-sm text-center">{req.member.angkatan}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">Bukti {req.document_type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary font-bold text-xs uppercase hover:underline">Lihat Detail</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
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
              className="w-[400px] bg-white shadow-2xl rounded-xl flex flex-col h-[calc(100vh-200px)] sticky top-24 overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-headline font-bold text-slate-900">Detail Pendataan</h3>
                  <Badge 
                    variant={selectedRequest.status === 'PENDING' ? 'warning' : selectedRequest.status === 'APPROVED' ? 'success' : 'danger'} 
                    className="mt-1"
                  >
                    {selectedRequest.status === 'PENDING' ? 'MENUNGGU VERIFIKASI' : selectedRequest.status === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'}
                  </Badge>
                </div>
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img 
                      src={selectedRequest.member.photo_url || `https://picsum.photos/seed/${selectedRequest.id}/200`} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white" 
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary p-1.5 rounded-lg text-white">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-lg font-bold font-headline">{selectedRequest.member.name}</h4>
                  <p className="text-sm text-slate-500">{selectedRequest.member.nim}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <DetailItem label="Fakultas" value="Teknik" />
                  <DetailItem label="Jurusan" value={selectedRequest.member.jurusan || ''} />
                  <DetailItem label="Angkatan" value={selectedRequest.member.angkatan || ''} />
                  <DetailItem label="Tempat Lahir" value="Semarang" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">
                    Dokumen Pendukung (Bukti {selectedRequest.document_type})
                  </label>
                  <div className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    <img 
                      src={selectedRequest.document_url} 
                      alt="Document Preview" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                    />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="outline" className="bg-white gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Buka di Tab Baru
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequest.status === 'PENDING' && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:bg-red-50 hover:border-red-200 gap-2"
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'REJECTED')}
                    disabled={updatingId === selectedRequest.id}
                  >
                    {updatingId === selectedRequest.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Tolak
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 gap-2"
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'APPROVED')}
                    disabled={updatingId === selectedRequest.id}
                  >
                    {updatingId === selectedRequest.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{label}</label>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
