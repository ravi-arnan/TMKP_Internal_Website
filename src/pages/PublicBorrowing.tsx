import { type ComponentType, type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ChevronDown,
  Hash,
  Loader2,
  Mail,
  Package,
  Phone,
  Save,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { borrowingService, inventoryService } from '@/src/lib/supabase';
import { InventoryItem } from '@/src/types';
import { useToast } from '@/src/lib/toast-context';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

type ValidationErrors = Record<string, string>;

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function PublicBorrowing() {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [formData, setFormData] = useState({
    requester_name: '',
    requester_email: '',
    requester_phone: '',
    requester_affiliation: '',
    item_id: '',
    item_name: '',
    quantity: 1,
    purpose: '',
    borrow_date: todayIso(),
    return_date: todayIso(),
    notes: '',
  });

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await inventoryService.getItems();
        setInventoryItems(data);
      } catch {
        // graceful — still allow freetext fallback
      } finally {
        setLoadingItems(false);
      }
    };
    void fetchItems();
  }, []);

  const selectedItem = inventoryItems.find(i => i.id === formData.item_id);

  const handleFieldChange = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (validationErrors[key as string]) {
      setValidationErrors((prev) => ({ ...prev, [key as string]: '' }));
    }
  };

  const handleItemSelect = (itemId: string) => {
    const item = inventoryItems.find(i => i.id === itemId);
    setFormData(prev => ({
      ...prev,
      item_id: itemId,
      item_name: item?.name ?? '',
      quantity: 1,
    }));
    setValidationErrors(prev => ({ ...prev, item_id: '', quantity: '' }));
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.requester_name.trim()) errors.requester_name = 'Nama wajib diisi';
    else if (formData.requester_name.trim().length < 3) errors.requester_name = 'Nama minimal 3 karakter';

    if (!formData.requester_email.trim()) errors.requester_email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requester_email))
      errors.requester_email = 'Format email tidak valid';

    if (!formData.item_id && inventoryItems.length > 0) errors.item_id = 'Pilih barang yang ingin dipinjam';
    if (!formData.item_name.trim()) errors.item_id = 'Pilih barang yang ingin dipinjam';
    if (!formData.purpose.trim()) errors.purpose = 'Keperluan wajib diisi';
    if (!formData.quantity || formData.quantity < 1) errors.quantity = 'Jumlah minimal 1';

    if (selectedItem && formData.quantity > selectedItem.available_stock) {
      errors.quantity = `Stok tersedia hanya ${selectedItem.available_stock}`;
    }
    if (selectedItem && selectedItem.available_stock === 0) {
      errors.item_id = 'Barang ini sedang tidak tersedia (stok habis)';
    }

    if (!formData.borrow_date) errors.borrow_date = 'Tanggal pinjam wajib diisi';
    if (!formData.return_date) errors.return_date = 'Tanggal kembali wajib diisi';
    if (formData.borrow_date && formData.return_date && formData.return_date < formData.borrow_date) {
      errors.return_date = 'Tanggal kembali harus setelah tanggal pinjam';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      toast.error('Formulir belum lengkap', 'Mohon periksa kembali data yang diisi.');
      return;
    }

    setIsSaving(true);
    try {
      await borrowingService.createRequest({
        ...formData,
        item_id: formData.item_id || undefined,
        status: 'PENDING',
      });
      toast.success('Permintaan terkirim', 'Admin akan meninjau permintaan peminjaman Anda.');
      setIsSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim data.';
      setErrorMessage(message);
      toast.error('Pengiriman gagal', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white font-['Instrument_Sans',sans-serif] selection:bg-green-500/30">
      <div className="hidden dark:block fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="hidden dark:block fixed bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

      <nav className="relative z-50 px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white dark:border-white/5 dark:bg-black/40 dark:backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 group">
          <Sun className="w-6 h-6 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-bold tracking-wide text-gray-900 dark:text-white">HMI TMKP</span>
        </Link>
        <Link to="/">
          <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-white/70 dark:hover:text-white transition-colors duration-300 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
        </Link>
      </nav>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24">
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-10 text-center shadow-sm"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-500/15 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Permintaan Terkirim</h2>
            <p className="text-gray-600 dark:text-white/60 mb-8">
              Terima kasih. Permintaan peminjaman Anda sudah masuk dan akan ditinjau oleh admin komisariat.
              Anda akan dihubungi melalui kontak yang diberikan.
            </p>
            <Link to="/">
              <Button className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-center space-y-8"
            >
              <div>
                <p className="text-green-600 dark:text-green-400 font-bold tracking-[0.25em] text-xs uppercase mb-4">
                  Inventaris Komisariat
                </p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Instrument_Serif',serif] italic leading-tight text-gray-900 dark:text-white mb-6">
                  Formulir <br /> Peminjaman Barang
                </h1>
                <p className="text-gray-600 dark:text-white/60 text-lg leading-relaxed max-w-md">
                  Ajukan peminjaman barang atau peralatan komisariat HMI TMKP. Isi data dengan lengkap — admin akan
                  meninjau dan menghubungi Anda untuk konfirmasi.
                </p>
              </div>

              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm p-6 md:p-8 max-w-sm space-y-5">
                <InfoRow icon={ClipboardList} title="Data yang dibutuhkan">
                  Nama, kontak, barang yang dipinjam, keperluan, dan rentang tanggal.
                </InfoRow>
                <InfoRow icon={ShieldCheck} title="Validasi Admin">
                  Setiap permintaan ditinjau admin sebelum barang dapat diambil.
                </InfoRow>
                <InfoRow icon={CalendarDays} title="Pengembalian">
                  Pastikan barang dikembalikan tepat waktu sesuai tanggal yang diajukan.
                </InfoRow>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-2xl dark:backdrop-blur-xl relative overflow-hidden">
                <div className="hidden dark:block absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />

                <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Nama Lengkap" icon={User} error={validationErrors.requester_name}>
                      <Input
                        placeholder="Cth: Ravi Arnan"
                        value={formData.requester_name}
                        onChange={(e) => handleFieldChange('requester_name', e.target.value)}
                        className={cn(validationErrors.requester_name && 'border-red-500/50')}
                        required
                      />
                    </FormField>

                    <FormField label="Email" icon={Mail} error={validationErrors.requester_email}>
                      <Input
                        type="email"
                        placeholder="nama@example.com"
                        value={formData.requester_email}
                        onChange={(e) => handleFieldChange('requester_email', e.target.value)}
                        className={cn(validationErrors.requester_email && 'border-red-500/50')}
                        required
                      />
                    </FormField>

                    <FormField label="Nomor WhatsApp" icon={Phone} error={validationErrors.requester_phone}>
                      <Input
                        placeholder="081234567890"
                        value={formData.requester_phone}
                        onChange={(e) => handleFieldChange('requester_phone', e.target.value)}
                      />
                    </FormField>

                    <FormField label="Afiliasi / Angkatan / Jabatan">
                      <Input
                        placeholder="Cth: Angkatan 2023 — Dept. Advokasi"
                        value={formData.requester_affiliation}
                        onChange={(e) => handleFieldChange('requester_affiliation', e.target.value)}
                      />
                    </FormField>

                    {/* Item Picker */}
                    <div className="md:col-span-2">
                      <FormField label="Pilih Barang" icon={Package} error={validationErrors.item_id}>
                        {loadingItems ? (
                          <div className="flex items-center gap-2 px-3 py-3 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" /> Memuat daftar barang...
                          </div>
                        ) : inventoryItems.length === 0 ? (
                          <Input
                            placeholder="Cth: Proyektor, Sound System, Kursi"
                            value={formData.item_name}
                            onChange={(e) => handleFieldChange('item_name', e.target.value)}
                            className={cn(validationErrors.item_id && 'border-red-500/50')}
                            required
                          />
                        ) : (
                          <div className="relative">
                            <select
                              className={cn(
                                'w-full appearance-none rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition-all',
                                'bg-white border-gray-200 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
                                'dark:bg-white/5 dark:border-white/10 dark:text-white dark:focus:border-green-500/50',
                                validationErrors.item_id && 'border-red-500/50',
                              )}
                              value={formData.item_id}
                              onChange={e => handleItemSelect(e.target.value)}
                            >
                              <option value="">— Pilih barang yang ingin dipinjam —</option>
                              {inventoryItems.map(item => (
                                <option
                                  key={item.id}
                                  value={item.id}
                                  disabled={item.available_stock === 0}
                                >
                                  {item.name}
                                  {item.category ? ` (${item.category})` : ''}
                                  {' — '}
                                  {item.available_stock === 0
                                    ? 'Stok Habis'
                                    : `${item.available_stock} tersedia`}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        )}

                        {/* Selected item info card */}
                        {selectedItem && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg"
                          >
                            <div className="text-xs text-green-700 dark:text-green-400">
                              <span className="font-bold">{selectedItem.name}</span>
                              {selectedItem.description && <span className="ml-2 opacity-70">— {selectedItem.description}</span>}
                            </div>
                            <div className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full',
                              selectedItem.available_stock === 0
                                ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                            )}>
                              {selectedItem.available_stock} / {selectedItem.total_stock} tersedia
                            </div>
                          </motion.div>
                        )}
                      </FormField>
                    </div>

                    <FormField label="Jumlah" icon={Hash} error={validationErrors.quantity}>
                      <Input
                        type="number"
                        min={1}
                        max={selectedItem?.available_stock ?? undefined}
                        value={formData.quantity}
                        onChange={(e) => handleFieldChange('quantity', Number(e.target.value))}
                        className={cn(validationErrors.quantity && 'border-red-500/50')}
                        required
                      />
                    </FormField>

                    <FormField label="Tanggal Pinjam" error={validationErrors.borrow_date}>
                      <Input
                        type="date"
                        value={formData.borrow_date}
                        onChange={(e) => handleFieldChange('borrow_date', e.target.value)}
                        className={cn(validationErrors.borrow_date && 'border-red-500/50')}
                        required
                      />
                    </FormField>

                    <FormField label="Tanggal Kembali" error={validationErrors.return_date}>
                      <Input
                        type="date"
                        value={formData.return_date}
                        onChange={(e) => handleFieldChange('return_date', e.target.value)}
                        className={cn(validationErrors.return_date && 'border-red-500/50')}
                        required
                      />
                    </FormField>

                    <div className="md:col-span-2">
                      <FormField label="Keperluan / Tujuan" icon={ClipboardList} error={validationErrors.purpose}>
                        <textarea
                          className={cn(
                            'w-full rounded-lg border px-3 py-3 text-sm outline-none min-h-[100px] resize-y transition-all',
                            'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
                            'dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-green-500/50',
                            validationErrors.purpose && 'border-red-500/50',
                          )}
                          placeholder="Cth: Kegiatan seminar internal — perlu proyektor..."
                          value={formData.purpose}
                          onChange={(e) => handleFieldChange('purpose', e.target.value)}
                          required
                        />
                      </FormField>
                    </div>

                    <div className="md:col-span-2">
                      <FormField label="Catatan Tambahan (opsional)">
                        <textarea
                          className="w-full rounded-lg border px-3 py-3 text-sm outline-none min-h-[80px] resize-y transition-all bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/40 dark:focus:border-green-500/50"
                          placeholder="Kondisi khusus, permintaan penyediaan, dll."
                          value={formData.notes}
                          onChange={(e) => handleFieldChange('notes', e.target.value)}
                        />
                      </FormField>
                    </div>
                  </div>

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30 rounded-xl flex items-start gap-4"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-300">Terjadi Kesalahan</p>
                        <p className="text-sm text-red-700/80 dark:text-red-300/80 mt-1">{errorMessage}</p>
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-4 flex items-center justify-between border-t border-gray-200 dark:border-white/10">
                    <p className="text-xs text-gray-500 dark:text-white/40 hidden sm:block">
                      Pastikan informasi yang diisi valid.
                    </p>
                    <Button type="submit" disabled={isSaving} className="gap-2 px-6 py-3 rounded-full">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving ? 'Menyimpan...' : 'Kirim Permintaan'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}

function InfoRow({ icon: Icon, title, children }: { icon: ComponentType<{ className?: string }>; title: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 flex items-center justify-center shrink-0 border border-green-200 dark:border-green-500/20">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-white/60 mt-1 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  children,
  error,
}: {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-green-600 dark:text-green-500/70" />}
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-1.5 font-medium"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
