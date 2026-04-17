import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Papa from 'papaparse';
import { 
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { memberService } from '@/src/lib/supabase';
import { Member } from '@/src/types';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { useToast } from '@/src/lib/toast-context';
import { useAuth } from '@/src/lib/auth-context';
import CSVImportModal from '@/src/components/CSVImportModal';
import ConfirmationModal from '@/src/components/ConfirmationModal';
import { 
  MapPin, 
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';

export default function MemberList() {
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();
  const { session } = useAuth();
  const toast = useToast();
    const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [angkatanFilter, setAngkatanFilter] = useState('Semua');
  const [jurusanFilter, setJurusanFilter] = useState('Semua Jurusan');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
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
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'primary';
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const filteredAndSortedMembers = useMemo(() => {
    const query = (searchQuery || '').toLowerCase().trim();

    const filtered = members.filter((member) => {
      const matchesQuery =
        member.name.toLowerCase().includes(query) ||
        member.nim.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);
      const matchesAngkatan = angkatanFilter === 'Semua' || member.angkatan === angkatanFilter;
      const matchesJurusan =
        jurusanFilter === 'Semua Jurusan' ||
        (member.prodi || member.jurusan).toLowerCase() === jurusanFilter.toLowerCase();
      const matchesStatus = statusFilter === 'Semua Status' || member.status === statusFilter;

      return matchesQuery && matchesAngkatan && matchesJurusan && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (!sortConfig.direction) return 0;

      const aValue = a[sortConfig.key as keyof Member];
      const bValue = b[sortConfig.key as keyof Member];

      if (aValue === bValue) return 0;

      const comparison = String(aValue).localeCompare(String(bValue), undefined, {
        numeric: true,
        sensitivity: 'base',
      });

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [angkatanFilter, jurusanFilter, members, searchQuery, sortConfig.direction, sortConfig.key, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedMembers.length / pageSize));

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedMembers.slice(start, start + pageSize);
  }, [currentPage, filteredAndSortedMembers]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedMembers.map((member) => member.id));
    }
  };

  const handleBatchDelete = () => {
    setConfirmConfig({
      title: 'Hapus Anggota Terpilih',
      message: `Apakah Anda yakin ingin menghapus ${selectedIds.length} anggota yang dipilih? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Permanen',
      variant: 'danger',
      onConfirm: () => {
        void (async () => {
          try {
            await memberService.deleteMembers(selectedIds);
            await fetchMembers();
            setSelectedIds([]);
            setIsConfirmModalOpen(false);
            toast.success('Berhasil dihapus', `${selectedIds.length} anggota telah dihapus`);
          } catch (error) {
            toast.error('Gagal menghapus', 'Terjadi kesalahan saat menghapus data');
          }
        })();
      },
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
      onConfirm: () => {
        void (async () => {
          try {
            await memberService.deleteMembers([id]);
            await fetchMembers();
            setSelectedIds(prev => prev.filter(i => i !== id));
            setIsConfirmModalOpen(false);
            toast.success('Berhasil dihapus', `${name} telah dihapus dari sistem`);
          } catch (error) {
            toast.error('Gagal menghapus', 'Terjadi kesalahan saat menghapus data');
          }
        })();
      },
    });
    setIsConfirmModalOpen(true);
  };

  const handleBatchStatusUpdate = async (status: Member['status']) => {
    try {
      await memberService.updateMembersStatus(selectedIds, status);
      await fetchMembers();
      setSelectedIds([]);
      toast.success('Status diperbarui', `${selectedIds.length} anggota berhasil diubah ke ${status}`);
    } catch (error) {
      toast.error('Gagal memperbarui', 'Terjadi kesalahan saat mengubah status');
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

  const handleExportCSV = () => {
    const exportData = filteredAndSortedMembers.map(member => ({
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
    toast.success('Ekspor berhasil', `${filteredAndSortedMembers.length} data anggota telah diekspor`);
  };

  const fetchMembers = async () => {
    setLoading(true);
    const data = await memberService.getMembers();
    setMembers(data);
    setLoading(false);
  };

  const totalMembers = members.length;
  const totalActiveMembers = members.filter(member => member.status === 'AKTIF').length;
  const totalAlumniMembers = members.filter(member => member.status === 'ALUMNI').length;
  const activeRatio = totalMembers > 0 ? ((totalActiveMembers / totalMembers) * 100).toFixed(1) : '0.0';
  const currentYear = new Date().getFullYear().toString();
  const previousYear = String(Number(currentYear) - 1);
  const currentYearMembers = members.filter(member => member.angkatan === currentYear).length;
  const previousYearMembers = members.filter(member => member.angkatan === previousYear).length;
  const growth =
    previousYearMembers === 0
      ? (currentYearMembers > 0 ? 100 : 0)
      : Math.round(((currentYearMembers - previousYearMembers) / previousYearMembers) * 100);

  useEffect(() => {
    void fetchMembers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, angkatanFilter, jurusanFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const angkatanOptions = useMemo(() => {
    const years = members
      .map((member) => member.angkatan)
      .filter((value): value is string => Boolean(value));

    const uniqueYears = [...new Set<string>(years)].sort(
      (a, b) => b.localeCompare(a, undefined, { numeric: true }),
    );
    return ['Semua', ...uniqueYears];
  }, [members]);

  const jurusanOptions = useMemo(() => {
    const departments = members
      .map((member) => member.prodi || member.jurusan)
      .filter((value): value is string => Boolean(value));

    const values = [...new Set<string>(departments)].sort(
      (a, b) => a.localeCompare(b),
    );
    return ['Semua Jurusan', ...values];
  }, [members]);

  const statusOptions = ['Semua Status', 'PENDING', 'AKTIF', 'NON-AKTIF', 'ALUMNI'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <FilterGroup
            label="Angkatan"
            value={angkatanFilter}
            options={angkatanOptions}
            onChange={setAngkatanFilter}
          />
          <FilterGroup
            label="Jurusan"
            value={jurusanFilter}
            options={jurusanOptions}
            onChange={setJurusanFilter}
          />
          <FilterGroup
            label="Status"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAngkatanFilter('Semua');
              setJurusanFilter('Semua Jurusan');
              setStatusFilter('Semua Status');
            }}
          >
            Reset Filter
          </Button>
          
        </div>
        <div className="flex items-center gap-3">
          {true && (
            <Button 
              variant="outline" 
              className="gap-2 px-5 py-2.5 text-gray-700 dark:text-white/70 hover:text-green-400 hover:border-green-500"
              onClick={() => setIsImportModalOpen(true)}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import CSV</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            className="gap-2 px-5 py-2.5 text-gray-700 dark:text-white/70 hover:text-green-400 hover:border-green-500"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          {true && (
            <Link to="/dashboard/members/new">
              <Button className="gap-2 px-5 py-2.5">
                <UserPlus className="w-4 h-4" />
                <span>Tambah Anggota</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {true && (
        <CSVImportModal 
          isOpen={isImportModalOpen} 
          onClose={() => setIsImportModalOpen(false)} 
          onSuccess={fetchMembers}
        />
      )}

      {true && (
        <ConfirmationModal 
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          {...confirmConfig}
        />
      )}

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-gray-900 dark:text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-8 border border-gray-200 dark:border-white/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-gray-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold text-sm">
                {selectedIds.length}
              </div>
              <p className="text-sm font-medium whitespace-nowrap">Anggota Terpilih</p>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-900 dark:text-white hover:bg-white dark:bg-white/5/10 gap-2"
                onClick={() => void handleBatchStatusUpdate('AKTIF')}
              >
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Aktifkan</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-900 dark:text-white hover:bg-white dark:bg-white/5/10 gap-2"
                onClick={() => void handleBatchStatusUpdate('NON-AKTIF')}
              >
                <XCircle className="w-4 h-4 text-gray-400 dark:text-white/40" />
                <span>Non-Aktifkan</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-900 dark:text-white hover:bg-red-500/20 hover:text-red-400 gap-2"
                onClick={handleBatchDelete}
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus</span>
              </Button>
            </div>

            <button 
              onClick={() => setSelectedIds([])}
              className="ml-4 p-1 hover:bg-white dark:bg-white/5/10 rounded-full transition-colors"
            >
              <XCircle className="w-5 h-5 opacity-50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                <th className="pl-6 py-4 w-10">
                  {true ? (
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-green-400 focus:ring-green-500 cursor-pointer"
                      checked={selectedIds.length === filteredAndSortedMembers.length && filteredAndSortedMembers.length > 0}
                      onChange={toggleSelectAll}
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400 dark:text-white/40 uppercase tracking-widest">No</span>
                  )}
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-green-400 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Foto & Nama Lengkap
                    <SortIcon column="name" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-green-400 transition-colors"
                    onClick={() => handleSort('nim')}
                  >
                    NIM
                    <SortIcon column="nim" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-green-400 transition-colors"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    <SortIcon column="email" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">No. HP</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-green-400 transition-colors"
                    onClick={() => handleSort('angkatan')}
                  >
                    Angkatan
                    <SortIcon column="angkatan" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-green-400 transition-colors"
                    onClick={() => handleSort('jurusan')}
                  >
                    Jurusan
                    <SortIcon column="jurusan" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">
                  <button 
                    className="flex items-center gap-1 hover:text-green-400 transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    Status
                    <SortIcon column="status" currentConfig={sortConfig} />
                  </button>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-white/50">Memuat data anggota...</td>
                </tr>
              ) : filteredAndSortedMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-white/50">Belum ada data anggota.</td>
                </tr>
              ) : paginatedMembers.map((member) => (
                <React.Fragment key={member.id}>
                  <tr 
                    className={cn(
                      "hover:bg-gray-50 dark:bg-white dark:bg-white/5/80 transition-colors group cursor-pointer",
                      expandedId === member.id && "bg-white dark:bg-white/5",
                      selectedIds.includes(member.id) && "bg-green-500/5"
                    )}
                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                  >
                    <td className="pl-6 py-4" onClick={(e) => e.stopPropagation()}>
                      {true ? (
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-green-400 focus:ring-green-500 cursor-pointer"
                          checked={selectedIds.includes(member.id)}
                          onChange={() => {
                            const id = member.id;
                            setSelectedIds(prev => 
                              prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                            );
                          }}
                        />
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-white/40">•</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 bg-green-500/10 text-green-400 flex items-center justify-center font-semibold text-xs">
                          {member.photo_url ? (
                            <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            member.name.split(' ').map((part) => part[0]).join('').slice(0, 2)
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{member.name}</p>
                            {expandedId === member.id ? <ChevronUp className="w-3 h-3 text-gray-400 dark:text-white/40" /> : <ChevronDown className="w-3 h-3 text-gray-400 dark:text-white/40" />}
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-white/50">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-white/70">{member.nim}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">{member.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">{member.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">{member.angkatan}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/70">{member.jurusan}</td>
                    <td className="px-6 py-4">
                      <Badge variant={member.status === 'AKTIF' ? 'success' : member.status === 'ALUMNI' ? 'info' : 'default'}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {true && (
                          <Link to={`/dashboard/members/${member.id}/edit`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="outline" size="icon" className="w-8 h-8 hover:text-green-400">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 hover:text-emerald-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(member.id);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {true && (
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="w-8 h-8 hover:text-red-500 hover:border-red-200" 
                            onClick={(e) => handleDeleteMember(member.id, member.name, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {expandedId === member.id && (
                      <tr className="bg-gray-50 dark:bg-white dark:bg-white/5/50">
                        <td colSpan={9} className="px-6 py-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="py-6 grid grid-cols-1 md:grid-cols-4 gap-8 border-t border-gray-100 dark:border-white/5">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest">
                                  <MapPin className="w-3 h-3" />
                                  Domisili
                                </div>
                                <p className="text-sm text-gray-700 dark:text-white/80 leading-relaxed">
                                  {member.address || 'Alamat belum diatur'}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest">
                                  <GraduationCap className="w-3 h-3" />
                                  Fakultas / Prodi
                                </div>
                                <p className="text-sm text-gray-700 dark:text-white/80">
                                  {member.fakultas || '-'} / {member.prodi || '-'}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest">
                                  <User className="w-3 h-3" />
                                  Tempat, Tgl Lahir
                                </div>
                                <p className="text-sm text-gray-700 dark:text-white/80">
                                  {member.tempat_tanggal_lahir || '-'}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest">
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

        <div className="px-6 py-4 bg-gray-50 dark:bg-white dark:bg-white/5/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 dark:border-white/10">
          <p className="text-xs text-gray-500 dark:text-white/50">
            Menampilkan halaman <span className="text-gray-900 dark:text-white font-semibold">{currentPage}</span> dari <span className="text-gray-900 dark:text-white font-semibold">{totalPages}</span> · total <span className="text-gray-900 dark:text-white font-semibold">{filteredAndSortedMembers.length}</span> hasil
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
              const pageNumber = index + 1;
              const isActive = pageNumber === currentPage;
              return (
                <Button
                  key={pageNumber}
                  variant={isActive ? 'primary' : 'outline'}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
            {totalPages > 5 && <span className="text-gray-400 dark:text-white/40 px-1">...</span>}
            {totalPages > 5 && (
              <Button
                variant={currentPage === totalPages ? 'primary' : 'outline'}
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard label="Rasio Aktif" value={`${activeRatio}%`} icon={PieChart} />
        <InsightCard label="Total Alumni" value={totalAlumniMembers.toLocaleString()} icon={GraduationCap} variant="secondary" />
        <InsightCard label="Pertumbuhan" value={`${growth > 0 ? '+' : ''}${growth}%`} icon={TrendingUp} />
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/50 font-semibold px-1">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white rounded px-4 py-2 focus:ring-2 focus:ring-green-500/20 appearance-none min-w-[120px] cursor-pointer outline-none"
      >
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function InsightCard({ label, value, icon: Icon, variant = 'primary' }: any) {
  return (
    <div className="bg-white dark:bg-white/5 p-5 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between shadow-2xl">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-white/50 font-bold mb-1">{label}</p>
        <p className={cn("text-2xl font-black font-headline", variant === 'secondary' ? "text-emerald-400" : "text-green-400")}>{value}</p>
      </div>
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", variant === 'secondary' ? "bg-emerald-500/5 text-emerald-400" : "bg-green-500/5 text-green-400")}>
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
