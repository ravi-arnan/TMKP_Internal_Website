import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  User, 
  Mail, 
  Hash, 
  MapPin, 
  Phone,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { memberService } from '@/src/lib/supabase';
import { useToast } from '@/src/lib/toast-context';

type ValidationErrors = Record<string, string>;

export default function MemberForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    angkatan: new Date().getFullYear().toString(),
    jurusan: 'Teknik Mesin',
    phone: '',
    address: '',
    semester: 1
  });

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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setErrorMessage('Harap perbaiki kesalahan pada form');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      await memberService.createMember({
        ...formData,
        prodi: formData.jurusan,
        status: 'PENDING',
      });
      toast.success('Anggota berhasil ditambahkan', `${formData.name} telah ditambahkan ke sistem`);
      navigate('/dashboard/members');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('duplicate key') || error.message.includes('unique')) {
          if (error.message.includes('email')) {
            setValidationErrors({email: 'Email sudah terdaftar'});
            toast.error('Email duplikat', 'Email sudah digunakan oleh anggota lain');
          } else if (error.message.includes('nim')) {
            setValidationErrors({nim: 'NIM sudah terdaftar'});
            toast.error('NIM duplikat', 'NIM sudah digunakan oleh anggota lain');
          }
          setErrorMessage('Data duplikat terdeteksi');
        } else {
          setErrorMessage(error.message);
          toast.error('Gagal menyimpan', error.message);
        }
      } else {
        setErrorMessage('Gagal menyimpan anggota baru.');
        toast.error('Gagal menyimpan', 'Terjadi kesalahan saat menyimpan data');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData({...formData, [field]: value});
    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors({...validationErrors, [field]: ''});
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Formulir Anggota Baru</h2>
          <p className="text-sm text-white/50">Lengkapi data diri calon anggota HMI TMKP</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-2xl flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-2xl bg-white/10 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-white/40 mb-4 group hover:border-green-500 hover:text-green-400 transition-all cursor-pointer">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Upload Foto</span>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed">Format JPG/PNG, Maksimal 2MB. Gunakan latar belakang polos.</p>
          </div>
          
          <div className="bg-green-500/5 p-6 rounded-xl border border-green-500/10">
            <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">Panduan Pengisian</h4>
            <ul className="text-[11px] text-white/70 space-y-2 list-disc pl-4">
              <li>Pastikan NIM sesuai dengan kartu mahasiswa</li>
              <li>Gunakan email institusi jika tersedia</li>
              <li>Alamat domisili saat ini di Semarang</li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField label="Nama Lengkap" icon={User} error={validationErrors.name}>
                <Input 
                  placeholder="Contoh: Ahmad Syarif" 
                  value={formData.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                  className={validationErrors.name ? 'border-red-300 focus:ring-red-200' : ''}
                  required
                />
              </FormField>
              
              <FormField label="Email" icon={Mail} error={validationErrors.email}>
                <Input 
                  type="email" 
                  placeholder="ahmad@student.undip.ac.id" 
                  value={formData.email}
                  onChange={e => handleFieldChange('email', e.target.value)}
                  className={validationErrors.email ? 'border-red-300 focus:ring-red-200' : ''}
                  required
                />
              </FormField>

              <FormField label="NIM" icon={Hash} error={validationErrors.nim}>
                <Input 
                  placeholder="21090120140001" 
                  value={formData.nim}
                  onChange={e => handleFieldChange('nim', e.target.value)}
                  className={validationErrors.nim ? 'border-red-300 focus:ring-red-200' : ''}
                  required
                />
              </FormField>

              <FormField label="No. WhatsApp" icon={Phone} error={validationErrors.phone}>
                <Input 
                  placeholder="081234567890" 
                  value={formData.phone}
                  onChange={e => handleFieldChange('phone', e.target.value)}
                  className={validationErrors.phone ? 'border-red-300 focus:ring-red-200' : ''}
                />
              </FormField>

              <FormField label="Angkatan" error={validationErrors.angkatan}>
                <Input 
                  placeholder="2024" 
                  value={formData.angkatan}
                  onChange={e => handleFieldChange('angkatan', e.target.value)}
                  className={validationErrors.angkatan ? 'border-red-300 focus:ring-red-200' : ''}
                  maxLength={4}
                  required
                />
              </FormField>

              <FormField label="Semester" error={validationErrors.semester}>
                <Input 
                  type="number" 
                  min="1" 
                  max="14" 
                  value={formData.semester}
                  onChange={e => handleFieldChange('semester', parseInt(e.target.value))}
                  className={validationErrors.semester ? 'border-red-300 focus:ring-red-200' : ''}
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Jurusan">
                  <select 
                    className="w-full h-10 rounded border border-white/10 bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                    value={formData.jurusan}
                    onChange={e => handleFieldChange('jurusan', e.target.value)}
                  >
                    <option>Teknik Mesin</option>
                    <option>Teknik Perkapalan</option>
                    <option>Sistem Perkapalan</option>
                  </select>
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField label="Alamat Domisili" icon={MapPin}>
                  <textarea 
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20 min-h-[100px]"
                    placeholder="Jl. Prof. Sudarto No. 13, Tembalang..."
                    value={formData.address}
                    onChange={e => handleFieldChange('address', e.target.value)}
                  ></textarea>
                </FormField>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Terjadi Kesalahan</p>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => navigate('/dashboard/members')} disabled={isSaving}>Batal</Button>
                <Button className="gap-2 px-8" type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, icon: Icon, children, error }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
