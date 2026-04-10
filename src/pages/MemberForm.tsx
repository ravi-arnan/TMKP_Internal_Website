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
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { memberService } from '@/src/lib/supabase';

export default function MemberForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    angkatan: '2024',
    jurusan: 'Teknik Mesin',
    phone: '',
    address: '',
    semester: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await memberService.insertMember({
        ...formData,
        status: 'AKTIF',
        prodi: formData.jurusan,
        fakultas: 'Teknik',
      });
      setSuccess(true);
      setTimeout(() => navigate('/members'), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan data. Silakan coba lagi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tambah Data Anggota</h2>
          <p className="text-sm text-slate-500">Masukkan data anggota ke dalam database HMI TMKP</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 mb-4 group hover:border-primary hover:text-primary transition-all cursor-pointer">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Upload Foto</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">Format JPG/PNG, Maksimal 2MB. Gunakan latar belakang polos.</p>
          </div>
          
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Panduan Input Data</h4>
            <ul className="text-[11px] text-slate-600 space-y-2 list-disc pl-4">
              <li>NIM harus sesuai dengan data resmi universitas</li>
              <li>Gunakan email aktif yang dapat dihubungi</li>
              <li>Pastikan nomor WhatsApp dapat dihubungi</li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 bg-green-50 text-green-700 text-xs p-3 rounded-lg border border-green-100 mb-6">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Data anggota berhasil disimpan! Mengalihkan...</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField label="Nama Lengkap" icon={User}>
                <Input 
                  placeholder="Contoh: Ahmad Syarif" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </FormField>
              
              <FormField label="Email" icon={Mail}>
                <Input 
                  type="email" 
                  placeholder="ahmad@student.undip.ac.id" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                />
              </FormField>

              <FormField label="NIM" icon={Hash}>
                <Input 
                  placeholder="210901xxxxxx" 
                  value={formData.nim}
                  onChange={e => setFormData({...formData, nim: e.target.value})}
                  required
                />
              </FormField>

              <FormField label="No. WhatsApp" icon={Phone}>
                <Input 
                  placeholder="0812xxxxxxxx" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </FormField>

              <FormField label="Angkatan">
                <select 
                  className="w-full h-10 rounded border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  value={formData.angkatan}
                  onChange={e => setFormData({...formData, angkatan: e.target.value})}
                >
                  {['2024', '2023', '2022', '2021', '2020'].map(y => <option key={y}>{y}</option>)}
                </select>
              </FormField>

              <FormField label="Semester">
                <Input 
                  type="number" 
                  min="1" 
                  max="14" 
                  value={formData.semester}
                  onChange={e => setFormData({...formData, semester: parseInt(e.target.value)})}
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Jurusan">
                  <select 
                    className="w-full h-10 rounded border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.jurusan}
                    onChange={e => setFormData({...formData, jurusan: e.target.value})}
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
                    className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                    placeholder="Jl. Prof. Sudarto No. 13, Tembalang..."
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  ></textarea>
                </FormField>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => navigate('/members')} disabled={loading}>Batal</Button>
              <Button className="gap-2 px-8" type="submit" disabled={loading || success}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Menyimpan...' : 'Simpan Data'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, icon: Icon, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      {children}
    </div>
  );
}
