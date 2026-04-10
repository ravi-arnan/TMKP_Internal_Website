import { type ComponentType, type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ClipboardList, Loader2, Mail, MapPin, Hash, Phone, Save, ShieldCheck, User, Users, Sun, Upload } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { memberService, verificationService } from '@/src/lib/supabase';
import { useToast } from '@/src/lib/toast-context';
import { motion } from 'motion/react';

type ValidationErrors = Record<string, string>;
type InfoItem = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};

const infoItems: InfoItem[] = [
  {
    icon: Users,
    title: 'Tujuan',
    description: 'Mengumpulkan data seluruh anggota agar daftar organisasi selalu akurat dan terbaru.',
  },
  {
    icon: ClipboardList,
    title: 'Data Wajib',
    description: 'Nama, NIM, kontak, angkatan, semester, jurusan, dan domisili untuk kebutuhan administrasi.',
  },
  {
    icon: ShieldCheck,
    title: 'Validasi',
    description: 'Setiap data yang masuk tetap ditinjau admin sebelum ditampilkan pada data keanggotaan.',
  },
];

const jurusanByFakultas: Record<string, string[]> = {
  Teknik: [
    'Teknik Sipil',
    'Teknik Elektro',
    'Teknik Mesin',
    'Teknik Industri',
    'Teknologi Informasi',
    'Teknik Lingkungan',
    'Arsitektur',
  ],
  MIPA: [
    'Biologi',
    'Farmasi',
    'Fisika',
    'Teknik Informatika',
    'Kimia',
    'Matematika',
    'Profesi Apoteker',
  ],
  'Kelautan dan Perikanan': [
    'Ilmu Kelautan',
    'Manajemen Sumberdaya Perairan',
  ],
};

export default function PublicSubmission() {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    angkatan: new Date().getFullYear().toString(),
    jurusan: jurusanByFakultas['Teknik'][0],
    fakultas: 'Teknik',
    phone: '',
    address: '',
    semester: 1,
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'KRS' | 'UKT'>('KRS');

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Nama lengkap wajib diisi';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Nama minimal 3 karakter';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.nim.trim()) {
      errors.nim = 'NIM wajib diisi';
    }

    if (!formData.angkatan) {
      errors.angkatan = 'Angkatan wajib diisi';
    } else if (!/^\d{4}$/.test(formData.angkatan)) {
      errors.angkatan = 'Angkatan harus format tahun (contoh: 2024)';
    }

    if (formData.semester < 1 || formData.semester > 14) {
      errors.semester = 'Semester harus antara 1-14';
    }

    if (!documentFile) {
      errors.document = 'Dokumen KRS atau UKT wajib diunggah untuk verifikasi';
    } else if (documentFile.size > 2 * 1024 * 1024) {
      errors.document = 'Ukuran berkas maksimal 2MB (PDF/JPG/PNG)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // When fakultas changes, auto-reset jurusan to the first entry for that faculty
      if (field === 'fakultas') {
        const programs = jurusanByFakultas[value as string] || [];
        next.jurusan = programs[0] || '';
      }
      return next;
    });
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      nim: '',
      angkatan: new Date().getFullYear().toString(),
      jurusan: jurusanByFakultas['Teknik'][0],
      fakultas: 'Teknik',
      phone: '',
      address: '',
      semester: 1,
    });
    setDocumentFile(null);
    setDocumentType('KRS');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      setErrorMessage('Harap perbaiki kesalahan pada form sebelum simpan.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const newMember = await memberService.createMember({
        ...formData,
        prodi: formData.jurusan,
        status: 'PENDING',
      });

      const dummyUrl = URL.createObjectURL(documentFile!);

      await verificationService.createRequest({
        member_id: newMember.id,
        document_type: documentType,
        document_url: dummyUrl,
        status: 'PENDING'
      });

      toast.success('Data & Dokumen Tersimpan', 'Data masuk antrean validasi admin.');
      resetForm();
    } catch (error) {
      if (error instanceof Error && (error.message.includes('duplicate key') || error.message.includes('unique'))) {
        if (error.message.includes('email')) {
          setValidationErrors({ email: 'Email sudah terdaftar' });
          toast.error('Email duplikat', 'Gunakan email lain atau hubungi admin.');
        } else if (error.message.includes('nim')) {
          setValidationErrors({ nim: 'NIM sudah terdaftar' });
          toast.error('NIM duplikat', 'NIM ini sudah terdaftar pada sistem.');
        }
        setErrorMessage('Data duplikat terdeteksi.');
      } else {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim data.';
        setErrorMessage(message);
        toast.error('Penyimpanan gagal', message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#000000] text-white font-['Instrument_Sans',sans-serif] selection:bg-green-500/30">
      
      {/* Decorative Gradients */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <nav className="relative z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 group">
          <Sun className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform duration-300" />
          <span className="font-bold tracking-wide text-white">HMI TMKP</span>
        </Link>
        <Link to="/">
          <button className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-300 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
        </Link>
      </nav>

      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
          
          {/* Left Column: Context */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center space-y-8"
          >
            <div>
              <p className="text-green-400 font-bold tracking-[0.25em] text-xs uppercase mb-4">Administrasi Internal</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-['Instrument_Serif',serif] italic leading-tight text-white mb-6">
                Formulir <br/> Pendataan Anggota
              </h1>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Lengkapi data profil Anda untuk diregistrasikan ke sistem administrasi HMI TMKP. Seluruh data dilindungi dan digunakan secara internal.
              </p>
            </div>
            
            <AnimatedInfoCard items={infoItems} />
          </motion.div>

          {/* Right Column: The Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Form internal subtle gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />

              <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={itemVariants}>
                    <FormField label="Nama Lengkap" icon={User} error={validationErrors.name}>
                      <Input
                        placeholder="Cth: Ahmad Syarif"
                        value={formData.name}
                        onChange={(event) => handleFieldChange('name', event.target.value)}
                        className={`bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-green-500/50 focus:ring-green-500/20 ${validationErrors.name ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}`}
                        required
                      />
                    </FormField>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField label="Alamat Email" icon={Mail} error={validationErrors.email}>
                      <Input
                        type="email"
                        placeholder="ahmad@student.undip.ac.id"
                        value={formData.email}
                        onChange={(event) => handleFieldChange('email', event.target.value)}
                        className={`bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-green-500/50 focus:ring-green-500/20 ${validationErrors.email ? 'border-red-500/50' : ''}`}
                        required
                      />
                    </FormField>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField label="Nomor Induk Mahasiswa" icon={Hash} error={validationErrors.nim}>
                      <Input
                        placeholder="21090120140001"
                        value={formData.nim}
                        onChange={(event) => handleFieldChange('nim', event.target.value)}
                        className={`bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-green-500/50 focus:ring-green-500/20 ${validationErrors.nim ? 'border-red-500/50' : ''}`}
                        required
                      />
                    </FormField>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField label="Nomor WhatsApp" icon={Phone} error={validationErrors.phone}>
                      <Input
                        placeholder="081234567890"
                        value={formData.phone}
                        onChange={(event) => handleFieldChange('phone', event.target.value)}
                        className={`bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-green-500/50 focus:ring-green-500/20 ${validationErrors.phone ? 'border-red-500/50' : ''}`}
                      />
                    </FormField>
                  </motion.div>

                  <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
                    <FormField label="Angkatan" error={validationErrors.angkatan}>
                      <Input
                        placeholder="2024"
                        value={formData.angkatan}
                        onChange={(event) => handleFieldChange('angkatan', event.target.value)}
                        className={`bg-black/40 border-white/10 text-white placeholder:text-white/40 focus:border-green-500/50 focus:ring-green-500/20 ${validationErrors.angkatan ? 'border-red-500/50' : ''}`}
                        maxLength={4}
                        required
                      />
                    </FormField>

                    <FormField label="Semester" error={validationErrors.semester}>
                      <div className="relative">
                        <select
                          className="w-full h-10 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 appearance-none transition-all"
                          value={formData.semester}
                          onChange={(event) => handleFieldChange('semester', Number(event.target.value))}
                        >
                          {Array.from({ length: 14 }, (_, i) => i + 1).map((s) => (
                            <option key={s} value={s} className="bg-[#05080f] text-white">Semester {s}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </FormField>

                    <FormField label="Fakultas">
                      <div className="relative">
                        <select
                          className="w-full h-10 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 appearance-none transition-all"
                          value={formData.fakultas}
                          onChange={(event) => handleFieldChange('fakultas', event.target.value)}
                        >
                          <option value="Teknik">Teknik</option>
                          <option value="MIPA">MIPA</option>
                          <option value="Kelautan dan Perikanan">Kelautan dan Perikanan</option>
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </FormField>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-end">
                    <div className="w-full">
                      <FormField label="Jurusan / Program Studi">
                        <div className="relative">
                          <select
                            className="w-full h-10 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 appearance-none transition-all"
                            value={formData.jurusan}
                            onChange={(event) => handleFieldChange('jurusan', event.target.value)}
                          >
                            {(jurusanByFakultas[formData.fakultas] || []).map((prodi) => (
                              <option key={prodi} value={prodi}>{prodi}</option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </div>
                        </div>
                      </FormField>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="md:col-span-2">
                    <FormField label="Alamat Domisili" icon={MapPin}>
                      <textarea
                        className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 min-h-[100px] transition-all resize-y"
                        placeholder="Jl. Prof. Sudarto No. 13, Tembalang..."
                        value={formData.address}
                        onChange={(event) => handleFieldChange('address', event.target.value)}
                      />
                    </FormField>
                  </motion.div>

                  <motion.div variants={itemVariants} className="md:col-span-2 space-y-4 pt-4 border-t border-white/10 mt-4">
                    <p className="text-sm font-bold text-white uppercase tracking-widest">Dokumen Verifikasi Keanggotaan</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-1">
                        <FormField label="Jenis Dokumen">
                          <div className="relative">
                            <select
                              className="w-full h-10 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 appearance-none transition-all"
                              value={documentType}
                              onChange={(event) => setDocumentType(event.target.value as 'KRS' | 'UKT')}
                            >
                              <option value="KRS" className="bg-[#05080f] text-white">Kartu Rencana Studi (KRS)</option>
                              <option value="UKT" className="bg-[#05080f] text-white">Bukti Pembayaran UKT</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/50">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        </FormField>
                      </div>
                      <div className="md:col-span-2">
                        <FormField label="Unggah Berkas" error={validationErrors.document}>
                          <div className="relative w-full">
                            <input 
                              type="file" 
                              id="file-upload" 
                              className="hidden" 
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setDocumentFile(e.target.files[0]);
                                  setValidationErrors(prev => ({ ...prev, document: '' }));
                                }
                              }}
                            />
                            <label 
                              htmlFor="file-upload" 
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-md border text-sm transition-all focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 cursor-pointer ${
                                validationErrors.document ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-black/40 hover:bg-white/5 text-white/70'
                              }`}
                            >
                              <span className="truncate mr-4 text-white">
                                {documentFile ? documentFile.name : 'Pilih file PDF, JPG, atau PNG maksimal 2MB...'}
                              </span>
                              <div className="shrink-0 flex items-center gap-2 bg-white/10 px-3 py-1 rounded-md border border-white/10 text-xs text-white font-semibold uppercase tracking-wider hover:bg-white/20 transition-colors">
                                <Upload className="w-3 h-3" />
                                Cari File
                              </div>
                            </label>
                            {documentFile && (
                              <p className="text-[10px] text-green-400 mt-2 font-mono flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                File tervalidasi: {(documentFile.size / 1024).toFixed(1)} KB
                              </p>
                            )}
                          </div>
                        </FormField>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-4"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-300">Terjadi Kesalahan</p>
                      <p className="text-sm text-red-300/80 mt-1">{errorMessage}</p>
                    </div>
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="pt-4 flex items-center justify-between border-t border-white/10"
                >
                  <p className="text-xs text-white/40 hidden sm:block">
                    Pastikan informasi yang diisi valid.
                  </p>
                  <Button 
                    className="gap-2 px-8 py-6 rounded-full bg-green-500 text-black hover:bg-green-400 hover:scale-105 transition-all duration-300 font-semibold w-full sm:w-auto hover:-translate-y-1 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] !text-black border-none" 
                    type="submit" 
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Menyimpan...' : 'Kirim Data'}
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function AnimatedInfoCard({ items }: { items: InfoItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    const activeItem = items[activeIndex];
    const typingDelay = 28;
    const titleDelay = 160;
    const typingStartDelay = 520;
    const pauseAfterTyping = 1400;

    let currentIndex = 0;
    let typingInterval: ReturnType<typeof setInterval> | undefined;

    setShowTitle(false);
    setTypedText('');

    const titleTimer = setTimeout(() => {
      setShowTitle(true);
    }, titleDelay);

    const typingStartTimer = setTimeout(() => {
      typingInterval = setInterval(() => {
        currentIndex += 1;
        const nextText = activeItem.description.slice(0, currentIndex);
        setTypedText(nextText);

        if (currentIndex >= activeItem.description.length && typingInterval) {
          clearInterval(typingInterval);
        }
      }, typingDelay);
    }, typingStartDelay);

    const nextItemTimer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, typingStartDelay + activeItem.description.length * typingDelay + pauseAfterTyping);

    return () => {
      clearTimeout(titleTimer);
      clearTimeout(typingStartTimer);
      clearTimeout(nextItemTimer);
      if (typingInterval) {
        clearInterval(typingInterval);
      }
    };
  }, [activeIndex, items]);

  const activeItem = items[activeIndex];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl p-6 md:p-8 backdrop-blur-md max-w-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center shrink-0 border border-green-500/20">
          <ActiveIcon className="w-6 h-6" />
        </div>
        <div className="w-full">
          <p className={`text-xl font-bold text-white transition-opacity duration-300 ${showTitle ? 'opacity-100' : 'opacity-0'}`}>
            {activeItem.title}
          </p>
          <p className="text-sm text-white/60 mt-2 leading-relaxed min-h-[60px]">
            {typedText}
            <span className="inline-block w-[1.5px] h-4 bg-green-400 align-middle ml-1 animate-pulse" />
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2">
        {items.map((item, index) => (
          <span
            key={item.title}
            className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-8 bg-green-500' : 'w-2 bg-white/20'}`}
          />
        ))}
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
      <label className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-3.5 h-3.5 text-green-500/70" />}
        {label}
      </label>
      {children}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 flex items-center gap-1.5 mt-1.5 font-medium"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
