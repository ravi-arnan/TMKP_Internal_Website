import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  X,
  FileSpreadsheet, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Plus,
  Filter,
  Search,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import Papa from 'papaparse';
import { financialService } from '@/src/lib/supabase';
import { FinancialRecord } from '@/src/types';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { cn } from '@/src/lib/utils';
import FinanceImportModal from '@/src/components/FinanceImportModal';
import { useToast } from '@/src/lib/toast-context';
import { useAuth } from '@/src/lib/auth-context';

export default function FinancialReports() {
  const { session } = useAuth();
    const toast = useToast();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    amount: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await financialService.getRecords();
      setRecords(data);
    } catch (error) {
      toast.error('Gagal memuat data', 'Tidak dapat mengambil data laporan keuangan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const recordDate = new Date(record.date);
    // Set time to midnight for accurate date comparison
    recordDate.setHours(0, 0, 0, 0);
    
    const start = startDate ? new Date(startDate) : null;
    if (start) start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(0, 0, 0, 0);

    const matchesStartDate = start ? recordDate >= start : true;
    const matchesEndDate = end ? recordDate <= end : true;
    
    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const totalIncome = filteredRecords
    .filter(r => r.type === 'INCOME')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalExpense = filteredRecords
    .filter(r => r.type === 'EXPENSE')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const balance = totalIncome - totalExpense;

  const handleExportCSV = () => {
    const exportData = filteredRecords.map(record => ({
      'Tanggal': record.date,
      'Deskripsi': record.description,
      'Kategori': record.category,
      'Jumlah': record.amount,
      'Tipe': record.type,
      'Dibuat Pada': record.created_at
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_keuangan_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Ekspor berhasil', `${filteredRecords.length} transaksi telah diekspor`);
  };

  const resetTransactionForm = () => {
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      amount: '',
      type: 'INCOME',
    });
  };

  const handleCreateTransaction = async (event: React.FormEvent) => {
    event.preventDefault();
        const amount = Number(newTransaction.amount);

    if (!newTransaction.description.trim() || !newTransaction.category.trim() || !newTransaction.date) {
      toast.warning('Form belum lengkap', 'Tanggal, deskripsi, dan kategori wajib diisi');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.warning('Nominal tidak valid', 'Masukkan jumlah transaksi yang lebih besar dari 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await financialService.createRecord({
        date: newTransaction.date,
        description: newTransaction.description,
        category: newTransaction.category,
        amount,
        type: newTransaction.type,
      });
      toast.success('Transaksi ditambahkan', 'Data transaksi baru berhasil disimpan');
      setIsCreateModalOpen(false);
      resetTransactionForm();
      await fetchRecords();
    } catch (error) {
      toast.error('Gagal menambahkan', 'Terjadi kesalahan saat menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-extrabold text-white font-headline tracking-tight">Laporan Keuangan</h2>
        <p className="text-white/50">Kelola arus kas masuk dan keluar organisasi</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard 
          label="Total Pemasukan" 
          value={`Rp ${totalIncome.toLocaleString()}`} 
          icon={TrendingUp} 
          variant="success"
        />
        <FinanceCard 
          label="Total Pengeluaran" 
          value={`Rp ${totalExpense.toLocaleString()}`} 
          icon={TrendingDown} 
          variant="danger"
        />
        <FinanceCard 
          label="Saldo Akhir" 
          value={`Rp ${balance.toLocaleString()}`} 
          icon={Wallet} 
          variant="primary"
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input 
              placeholder="Cari transaksi..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 shadow-2xl">
            <Calendar className="w-4 h-4 text-white/40" />
            <input 
              type="date" 
              className="text-xs text-white/70 outline-none bg-transparent"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-white/30">-</span>
            <input 
              type="date" 
              className="text-xs text-white/70 outline-none bg-transparent"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-red-500 hover:text-red-600 ml-1"
              >
                Reset
              </button>
            )}
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {true && (
            <Button variant="outline" className="gap-2" onClick={() => setIsImportModalOpen(true)}>
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import CSV</span>
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          {true && (
            <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>Tambah Transaksi</span>
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[11px] font-bold text-white/50 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-[11px] font-bold text-white/50 uppercase tracking-widest">Deskripsi</th>
                <th className="px-6 py-4 text-[11px] font-bold text-white/50 uppercase tracking-widest">Kategori</th>
                <th className="px-6 py-4 text-[11px] font-bold text-white/50 uppercase tracking-widest text-right">Jumlah</th>
                <th className="px-6 py-4 text-[11px] font-bold text-white/50 uppercase tracking-widest text-center">Tipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50">Memuat data...</td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-white/40" />
                        {new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">{record.description}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-white/10 text-white/70 border-none">{record.category}</Badge>
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-sm font-black text-right",
                      record.type === 'INCOME' ? "text-green-600" : "text-red-600"
                    )}>
                      {record.type === 'INCOME' ? '+' : '-'} Rp {record.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={record.type === 'INCOME' ? 'success' : 'destructive'}>
                        {record.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50 italic">Tidak ada data transaksi ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {true && (
        <FinanceImportModal 
          isOpen={isImportModalOpen} 
          onClose={() => setIsImportModalOpen(false)} 
          onSuccess={fetchRecords} 
        />
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white/5 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/10">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Tambah Transaksi</h3>
                <p className="text-xs text-white/50">Input pemasukan atau pengeluaran baru</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/40 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Tanggal</label>
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={(event) => setNewTransaction((prev) => ({ ...prev, date: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Tipe</label>
                  <select
                    className="w-full h-10 rounded border border-white/10 bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                    value={newTransaction.type}
                    onChange={(event) =>
                      setNewTransaction((prev) => ({ ...prev, type: event.target.value as 'INCOME' | 'EXPENSE' }))
                    }
                  >
                    <option value="INCOME">Pemasukan</option>
                    <option value="EXPENSE">Pengeluaran</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Deskripsi</label>
                <Input
                  placeholder="Contoh: Iuran Anggota"
                  value={newTransaction.description}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, description: event.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Kategori</label>
                <Input
                  placeholder="Contoh: Iuran"
                  value={newTransaction.category}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, category: event.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Jumlah</label>
                <Input
                  type="number"
                  min="1"
                  step="1000"
                  placeholder="500000"
                  value={newTransaction.amount}
                  onChange={(event) => setNewTransaction((prev) => ({ ...prev, amount: event.target.value }))}
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FinanceCard({ label, value, icon: Icon, trend, variant = 'primary' }: any) {
  const styles = {
    primary: "bg-green-500/5 text-green-400 border-green-500/10",
    success: "bg-green-50 text-green-600 border-green-100",
    danger: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", styles[variant as keyof typeof styles])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            trend.startsWith('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-white font-headline">{value}</p>
      </div>
    </div>
  );
}
