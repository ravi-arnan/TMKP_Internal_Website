import * as React from 'react';
import { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import Papa from 'papaparse';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { financialService } from '../lib/supabase';
import { FinancialRecord } from '../types';

interface FinanceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FinanceImportModal({ isOpen, onClose, onSuccess }: FinanceImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    setIsParsing(true);
    setErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false);
        if (results.errors.length > 0) {
          setErrors(results.errors.map(err => err.message));
        } else {
          const requiredFields = ['Tanggal', 'Deskripsi', 'Kategori', 'Jumlah', 'Tipe'];
          const headers = Object.keys(results.data[0] || {});
          const missingFields = requiredFields.filter(f => !headers.includes(f));

          if (missingFields.length > 0) {
            setErrors([`Kolom wajib tidak ditemukan: ${missingFields.join(', ')}`]);
          } else {
            setData(results.data);
          }
        }
      },
      error: (error) => {
        setIsParsing(false);
        setErrors([error.message]);
      }
    });
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const recordsToInsert: Partial<FinancialRecord>[] = data.map(row => ({
        date: row['Tanggal'],
        description: row['Deskripsi'],
        category: row['Kategori'],
        amount: parseFloat(row['Jumlah']),
        type: row['Tipe'].toUpperCase() as 'INCOME' | 'EXPENSE',
      }));

      await financialService.bulkInsertRecords(recordsToInsert);
      onSuccess();
      onClose();
    } catch (error) {
      setErrors(['Gagal mengimpor data. Silakan coba lagi.']);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['Tanggal', 'Deskripsi', 'Kategori', 'Jumlah', 'Tipe'];
    const example = ['2024-03-01', 'Iuran Anggota', 'Iuran', '500000', 'INCOME'];
    const template = `${headers.join(',')}\n${example.join(',')}`;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'template_keuangan.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Import Laporan Keuangan (CSV)</h3>
            <p className="text-xs text-slate-500">Unggah file CSV untuk pencatatan massal</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto space-y-6">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-900">Klik atau seret file CSV di sini</p>
                <p className="text-xs text-slate-500 mt-1">Pastikan format kolom sesuai dengan template</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
              <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}>
                <Download className="w-4 h-4" />
                Unduh Template
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{file.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setData([]); setErrors([]); }} className="text-xs font-bold text-red-500 hover:underline">Ganti File</button>
              </div>

              {isParsing ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm text-slate-500">Memproses file...</p>
                </div>
              ) : errors.length > 0 ? (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm font-bold">Terjadi Kesalahan</p>
                  </div>
                  <ul className="text-xs text-red-500 list-disc pl-5 space-y-1">
                    {errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preview Data ({data.length} Baris)</h4>
                    <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" />Valid</Badge>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-64">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="sticky top-0 bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2 font-bold text-slate-600">Tanggal</th>
                            <th className="px-4 py-2 font-bold text-slate-600">Deskripsi</th>
                            <th className="px-4 py-2 font-bold text-slate-600">Jumlah</th>
                            <th className="px-4 py-2 font-bold text-slate-600">Tipe</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.slice(0, 10).map((row, i) => (
                            <tr key={i}>
                              <td className="px-4 py-2">{row['Tanggal']}</td>
                              <td className="px-4 py-2">{row['Deskripsi']}</td>
                              <td className="px-4 py-2">Rp {parseFloat(row['Jumlah']).toLocaleString()}</td>
                              <td className="px-4 py-2">
                                <Badge variant={row['Tipe'].toUpperCase() === 'INCOME' ? 'success' : 'destructive'}>
                                  {row['Tipe']}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isImporting}>Batal</Button>
          <Button onClick={handleImport} disabled={!data.length || errors.length > 0 || isImporting} className="gap-2 px-8">
            {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isImporting ? 'Mengimpor...' : 'Konfirmasi Import'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
