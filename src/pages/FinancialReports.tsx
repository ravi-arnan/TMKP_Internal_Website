import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
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

export default function FinancialReports() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    const data = await financialService.getRecords();
    setRecords(data);
    setLoading(false);
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
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-extrabold text-slate-900 font-headline tracking-tight">Laporan Keuangan</h2>
        <p className="text-slate-500">Kelola arus kas masuk dan keluar organisasi</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard 
          label="Total Pemasukan" 
          value={`Rp ${totalIncome.toLocaleString()}`} 
          icon={TrendingUp} 
          trend="+5.2%"
          variant="success"
        />
        <FinanceCard 
          label="Total Pengeluaran" 
          value={`Rp ${totalExpense.toLocaleString()}`} 
          icon={TrendingDown} 
          trend="-2.1%"
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Cari transaksi..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              className="text-xs text-slate-600 outline-none bg-transparent"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-slate-300">-</span>
            <input 
              type="date" 
              className="text-xs text-slate-600 outline-none bg-transparent"
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
          <Button variant="outline" className="gap-2" onClick={() => setIsImportModalOpen(true)}>
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import CSV</span>
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            <span>Tambah Transaksi</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Deskripsi</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Kategori</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Jumlah</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center">Tipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{record.description}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">{record.category}</Badge>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">Tidak ada data transaksi ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FinanceImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={fetchRecords} 
      />
    </div>
  );
}

function FinanceCard({ label, value, icon: Icon, trend, variant = 'primary' }: any) {
  const styles = {
    primary: "bg-primary/5 text-primary border-primary/10",
    success: "bg-green-50 text-green-600 border-green-100",
    danger: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
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
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 font-headline">{value}</p>
      </div>
    </div>
  );
}
