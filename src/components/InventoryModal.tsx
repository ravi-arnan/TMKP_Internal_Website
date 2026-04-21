import { useState, useEffect } from 'react';
import { X, Package, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { inventoryService } from '@/src/lib/supabase';
import { InventoryCondition, InventoryItem } from '@/src/types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: InventoryItem) => void;
  editItem?: InventoryItem | null;
}

const CONDITIONS: { value: InventoryCondition; label: string }[] = [
  { value: 'BAIK', label: 'Baik' },
  { value: 'RUSAK RINGAN', label: 'Rusak Ringan' },
  { value: 'RUSAK BERAT', label: 'Rusak Berat' },
];

const CATEGORIES = [
  'Elektronik', 'Perabot', 'Alat Tulis', 'Sound System', 'Dokumentasi',
  'Olahraga', 'Perlengkapan Acara', 'Lainnya',
];

export default function InventoryModal({ isOpen, onClose, onSuccess, editItem }: InventoryModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    total_stock: 1,
    available_stock: 1,
    category: '',
    condition: 'BAIK' as InventoryCondition,
  });

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        description: editItem.description ?? '',
        total_stock: editItem.total_stock,
        available_stock: editItem.available_stock,
        category: editItem.category ?? '',
        condition: editItem.condition,
      });
    } else {
      setForm({ name: '', description: '', total_stock: 1, available_stock: 1, category: '', condition: 'BAIK' });
    }
    setError('');
  }, [editItem, isOpen]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Nama barang wajib diisi.'); return; }
    if (form.total_stock < 1) { setError('Total stok minimal 1.'); return; }
    if (form.available_stock < 0) { setError('Stok tersedia tidak boleh negatif.'); return; }
    if (form.available_stock > form.total_stock) { setError('Stok tersedia tidak boleh melebihi total stok.'); return; }

    setIsSaving(true);
    setError('');
    try {
      let result: InventoryItem;
      if (editItem) {
        result = await inventoryService.updateItem(editItem.id, {
          ...form,
          category: form.category || undefined,
          description: form.description || undefined,
        });
      } else {
        result = await inventoryService.createItem({
          ...form,
          category: form.category || undefined,
          description: form.description || undefined,
        });
      }
      onSuccess(result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden dark:border dark:border-white/10"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editItem ? 'Edit Barang' : 'Tambah Barang'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-white/50">Inventaris komisariat</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">
              Nama Barang *
            </label>
            <Input
              placeholder="Cth: Proyektor Epson"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">
              Deskripsi
            </label>
            <textarea
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none resize-none min-h-[80px] transition-all bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-green-500/50"
              placeholder="Spesifikasi atau keterangan tambahan..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">
                Total Stok *
              </label>
              <Input
                type="number"
                min={1}
                value={form.total_stock}
                onChange={e => {
                  const v = Number(e.target.value);
                  set('total_stock', v);
                  // if not editing, keep available = total
                  if (!editItem) set('available_stock', v);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">
                Stok Tersedia *
              </label>
              <Input
                type="number"
                min={0}
                max={form.total_stock}
                value={form.available_stock}
                onChange={e => set('available_stock', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">
                Kategori
              </label>
              <select
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all bg-white border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-green-500/50"
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                <option value="">— Pilih Kategori —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 dark:text-white/50 uppercase tracking-widest">
                Kondisi *
              </label>
              <select
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all bg-white border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-green-500/50"
                value={form.condition}
                onChange={e => set('condition', e.target.value as InventoryCondition)}
              >
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSaving}>
              Batal
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah Barang'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
