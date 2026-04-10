import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Papa from 'papaparse';
import { 
  Search, 
  Filter, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight,
  Edit3,
  Eye,
  PieChart,
  GraduationCap,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { memberService } from '@/src/lib/supabase';
import { Member } from '@/src/types';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { cn } from '@/src/lib/utils';
import CSVImportModal from '@/src/components/CSVImportModal';
import ConfirmationModal from '@/src/components/ConfirmationModal';
import { 
  MapPin, 
  BookOpen, 
  Clock,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';

export default function MemberList() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Member | 'name';
    direction: 'asc' | 'desc' | null;
  }>({
    key: 'name',
    direction: null,
  });

  // Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'primary';
  }>({
    title: '',
    message: '',
    onConfirm: async () => {},
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map(m => m.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    setConfirmConfig({
      title: 'Hapus Anggota Terpilih',
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} anggota yang dipilih? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Permanen',
      variant: 'danger',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          await memberService.bulkDeleteMembers(selectedIds);
          setMembers(prev => prev.filter(m => !selectedIds.includes(m.id)));
          setSelectedIds([]);
          setIsConfirmModalOpen(false);
        } catch (err) {
          console.error('Failed to delete members:', err);
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleDeleteMember = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmConfig({
      title: 'Hapus Anggota',
      message: `Apakah Anda yakin ingin menghapus ${name}? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Permanen',
      variant: 'danger',
      onConfirm: async () => {
        setIsConfirmLoading(true);
        try {
          await memberService.deleteMember(id);
          setMembers(prev => prev.filter(m => m.id !== id));
          setSelectedIds(prev => prev.filter(i => i !== id));
          setIsConfirmModalOpen(false);
        } catch (err) {
          console.error('Failed to delete member:', err);
        } finally {
          setIsConfirmLoading(false);
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handleBatchStatusUpdate = async (status: Member['status']) => {
    try {
      await memberService.bulkUpdateMemberStatus(selectedIds, status);
      setMembers(prev => prev.map(m => 
        selectedIds.includes(m.id) ? { ...m, status } : m
      ));
      setSelectedIds([]);
    } catch (err) {
      console.error('Failed to update member statuses:', err);
    }
  };

  const handleSort = (key: keyof Member | 'name') => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const filteredMembers = members.filter(member => {
    const query = (searchQuery || '').toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.nim.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    );
  }).sort((a, b) => {
    if (!sortConfig.direction) return 0;

    const aValue = a[sortConfig.key as keyof Member];
    const bValue = b[sortConfig.key as keyof Member];

    if (aValue === bValue) return 0;

    const comparison = String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: 'base' });
    
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  const handleExportCSV = () => {
    const exportData = filteredMembers.map(member => ({
      'Nama Lengkap': member.name,
      'NIM': member.nim,
      'Angkatan': member.angkatan,
      'Prodi': member.prodi || member.jurusan,
      'Email Address': member.email,
      'Nomor WA': member.phone,
      'Domisili': member.address,
      'Fakultas': member.fakultas,
      'Tempat, tanggal lahir': member.tempat_tanggal_lahir,
      'Tahun LK 1': member.tahun_lk1,
      'Tahun LK 2': member.tahun_lk2,
      'Tahun LK 3': member.tahun_lk3,
      'Status': member.status,
      'Timestamp': new Date().toISOString()
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data_anggota_hmi_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchMembers = () => {
    setLoading(true);
    memberService.getMembers().then(data => {
      setMembers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <FilterGroup label="Angkatan" options={['Semua', '2023', '2022', '2021', '2020']} />
          <FilterGroup label="Jurusan" options={['Semua Jurusan', 'Teknik Mesin', 'Teknik Perkapalan', 'Sistem Perkapalan']} />
          <FilterGroup label="Status" options={['Semua Status', 'Aktif', 'Alumni', 'Non-Aktif']} />
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 px-5 py-2.5 text-slate-600 hover:text-primary hover:border-primary"
            onClick={() => setIsImportModalOpen(true)}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import CSV</span>
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 px-5 py-2.5 text-slate-600 hover:text-primary hover:border-primary"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Link to="/members/new">
            <Button className="gap-2 px-5 py-2.5">
              <UserPlus className="w-4 h-4" />
              <span>Tambah Anggota</span>
            </Button>
          </Link>
        </div>
      </div>

      <CSVImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={fetchMembers}
      />

      <ConfirmationModal 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        {...confirmConfig}
        onConfirm={confirmConfig.onConfirm}
        isLoading={isConfirmLoading}
      />

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-white/10">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm">
                {selectedIds.length}
              </div>
              <p className="text-sm font-medium whitespace-nowrap">Anggota Terpilih</p>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/10 gap-2"
                onClick={() => handleBatchStatusUpdate('AKTIF')}
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Aktifkan</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/10 gap-2"
                onClick={() => handleBatchStatusUpdate('NON-AKTIF')}
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>Non-Aktifkan</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-red-500/20 hover:text-red-400 gap-2"
                onClick={handleBatchDelete}
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </Button>
            </div>

            <button 
              onClick={() => setSelectedIds([])}
              className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <XCircle className="w-5 h-5 opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="pl-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                    checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Foto & Nama Lengkap
                    <SortIcon column="name" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => handleSort('nim')}
                  >
                    NIM
                    <SortIcon column="nim" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    <SortIcon column="email" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">No. HP</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => handleSort('angkatan')}
                  >
                    Angkatan
                    <SortIcon column="angkatan" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => handleSort('jurusan')}
                  >
                    Jurusan
                    <SortIcon column="jurusan" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    <SortIcon column="status" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <React.Fragment key={member.id}>
                  <tr 
                    className={cn(
                      "hover:bg-slate-50/80 transition-colors group cursor-pointer",
                      expandedId === member.id && "bg-slate-50",
                      selectedIds.includes(member.id) && "bg-primary/5"
                    )}
                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                  >
                    <td className="pl-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                        checked={selectedIds.includes(member.id)}
                        onChange={(e) => {
                          const id = member.id;
                          setSelectedIds(prev => 
                            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                          );
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                          <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">{member.name}</p>
                            {expandedId === member.id ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                          </div>
                          <p className="text-[11px] text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{member.nim}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{member.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{member.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{member.angkatan}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{member.jurusan}</td>
                    <td className="px-6 py-4">
                      <Badge variant={member.status === 'AKTIF' ? 'success' : member.status === 'ALUMNI' ? 'info' : 'default'}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="icon" className="w-8 h-8 hover:text-primary" onClick={(e) => e.stopPropagation()}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="w-8 h-8 hover:text-accent-gold" onClick={(e) => e.stopPropagation()}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="w-8 h-8 hover:text-red-500 hover:border-red-200" 
                          onClick={(e) => handleDeleteMember(member.id, member.name, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedId === member.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={9} className="px-6 py-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="py-6 grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-slate-100">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <MapPin className="w-3 h-3" />
                                  Domisili
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">
                                  {member.address || 'Alamat belum diatur'}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <GraduationCap className="w-3 h-3" />
                                  Fakultas / Prodi
                                </div>
                                <p className="text-sm text-slate-700">
                                  {member.fakultas || '-'} / {member.prodi || '-'}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <User className="w-3 h-3" />
                                  Tempat, Tgl Lahir
                                </div>
                                <p className="text-sm text-slate-700">
                                  {member.tempat_tanggal_lahir || '-'}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  <TrendingUp className="w-3 h-3" />
                                  Perkaderan (LK)
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-[10px]">LK1: {member.tahun_lk1 || '-'}</Badge>
                                  <Badge variant="outline" className="text-[10px]">LK2: {member.tahun_lk2 || '-'}</Badge>
                                  <Badge variant="outline" className="text-[10px]">LK3: {member.tahun_lk3 || '-'}</Badge>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Menampilkan <span className="text-slate-900 font-semibold">1-10</span> dari <span className="text-slate-900 font-semibold">142</span> anggota
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" className="w-8 h-8 p-0">1</Button>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">2</Button>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">3</Button>
            <span className="text-slate-400 px-1">...</span>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0">15</Button>
            <Button variant="outline" size="icon" className="w-8 h-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard label="Rasio Aktif" value="84.2%" icon={PieChart} />
        <InsightCard label="Total Alumni" value="2,840" icon={GraduationCap} variant="secondary" />
        <InsightCard label="Pertumbuhan" value="+12%" icon={TrendingUp} />
      </div>
    </div>
  );
}

function FilterGroup({ label, options }: { label: string, options: string[] }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-1">{label}</label>
      <select className="bg-white border border-slate-200 text-sm text-slate-900 rounded px-4 py-2 focus:ring-2 focus:ring-primary/20 appearance-none min-w-[120px] cursor-pointer outline-none">
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function InsightCard({ label, value, icon: Icon, variant = 'primary' }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</p>
        <p className={cn("text-2xl font-black font-headline", variant === 'secondary' ? "text-accent-gold" : "text-primary")}>{value}</p>
      </div>
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", variant === 'secondary' ? "bg-accent-gold/5 text-accent-gold" : "bg-primary/5 text-primary")}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function SortIcon({ column, currentConfig }: { column: string, currentConfig: any }) {
  if (currentConfig.key !== column || !currentConfig.direction) {
    return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  }
  return currentConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
}
