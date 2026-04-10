import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  User, 
  Mail, 
  Hash, 
  MapPin, 
  Phone,
  Loader2
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Badge } from '@/src/components/ui/Badge';
import { memberService } from '@/src/lib/supabase';
import { Member } from '@/src/types';
import { useToast } from '@/src/lib/toast-context';

export default function MemberEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [member, setMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nim: '',
    angkatan: '',
    jurusan: '',
    phone: '',
    address: '',
    semester: 1,
    fakultas: '',
    prodi: '',
    tempat_tanggal_lahir: '',
    tahun_lk1: '',
    tahun_lk2: '',
    tahun_lk3: '',
    status: 'AKTIF' as Member['status'],
  });

  useEffect(() => {
    if (!id) {
      navigate('/dashboard/members');
      return;
    }

    const loadMember = async () => {
      setLoading(true);
      try {
        const data = await memberService.getMemberById(id);
        if (!data) {
          setErrorMessage('Anggota tidak ditemukan');
          return;
        }
        setMember(data);
        setFormData({
          name: data.name,
          email: data.email,
          nim: data.nim,
          angkatan: data.angkatan,
          jurusan: data.jurusan,
          phone: data.phone || '',
          address: data.address || '',
          semester: data.semester || 1,
          fakultas: data.fakultas || '',
          prodi: data.prodi || data.jurusan,
          tempat_tanggal_lahir: data.tempat_tanggal_lahir || '',
          tahun_lk1: data.tahun_lk1 || '',
          tahun_lk2: data.tahun_lk2 || '',
          tahun_lk3: data.tahun_lk3 || '',
          status: data.status,
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Gagal memuat data anggota');
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSaving(true);
    setErrorMessage('');
    try {
      await memberService.updateMember(id, formData);
      toast.success('Perubahan tersimpan', `Data ${formData.name} berhasil diperbarui`);
      navigate('/dashboard/members');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan perubahan.';
      setErrorMessage(msg);
      toast.error('Gagal menyimpan', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-green-400" />
      </div>
    );
  }

  if (errorMessage && !member) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{errorMessage}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/members')}>
            Kembali ke Daftar Anggota
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/dashboard/members')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-white tracking-tight">Edit Anggota</h2>
          <p className="text-sm text-white/50">Perbarui data anggota HMI TMKP</p>
        </div>
        <Badge variant={formData.status === 'AKTIF' ? 'success' : formData.status === 'ALUMNI' ? 'info' : 'default'}>
          {formData.status}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-2xl flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-2xl bg-green-500/10 text-green-400 shadow-lg border-2 border-white/10 flex items-center justify-center text-2xl font-bold mb-4">
              {member?.photo_url ? (
                <img src={member.photo_url} alt={formData.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                formData.name.split(' ').map(n => n[0]).join('').slice(0, 2)
              )}
            </div>
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Status Keanggotaan</p>
            <select
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as Member['status']})}
            >
              <option value="PENDING">Pending</option>
              <option value="AKTIF">Aktif</option>
              <option value="NON-AKTIF">Non-Aktif</option>
              <option value="ALUMNI">Alumni</option>
            </select>
          </div>
          
          <div className="bg-green-500/5 p-6 rounded-xl border border-green-500/10">
            <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3">Informasi Perkaderan</h4>
            <div className="space-y-3">
              <FormField label="Tahun LK 1">
                <Input 
                  placeholder="2021" 
                  value={formData.tahun_lk1}
                  onChange={e => setFormData({...formData, tahun_lk1: e.target.value})}
                />
              </FormField>
              <FormField label="Tahun LK 2">
                <Input 
                  placeholder="2022" 
                  value={formData.tahun_lk2}
                  onChange={e => setFormData({...formData, tahun_lk2: e.target.value})}
                />
              </FormField>
              <FormField label="Tahun LK 3">
                <Input 
                  placeholder="2023" 
                  value={formData.tahun_lk3}
                  onChange={e => setFormData({...formData, tahun_lk3: e.target.value})}
                />
              </FormField>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 shadow-2xl">
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
                <Input 
                  placeholder="2024" 
                  value={formData.angkatan}
                  onChange={e => setFormData({...formData, angkatan: e.target.value})}
                  required
                />
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

              <FormField label="Fakultas">
                <Input 
                  placeholder="Teknik" 
                  value={formData.fakultas}
                  onChange={e => setFormData({...formData, fakultas: e.target.value})}
                />
              </FormField>

              <FormField label="Program Studi">
                <select 
                  className="w-full h-10 rounded border border-white/10 bg-white/5 px-3 text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                  value={formData.prodi || formData.jurusan}
                  onChange={e => setFormData({...formData, prodi: e.target.value, jurusan: e.target.value})}
                >
                  <option>Teknik Mesin</option>
                  <option>Teknik Perkapalan</option>
                  <option>Sistem Perkapalan</option>
                </select>
              </FormField>

              <div className="md:col-span-2">
                <FormField label="Tempat, Tanggal Lahir">
                  <Input 
                    placeholder="Semarang, 1 Januari 2000" 
                    value={formData.tempat_tanggal_lahir}
                    onChange={e => setFormData({...formData, tempat_tanggal_lahir: e.target.value})}
                  />
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField label="Alamat Domisili" icon={MapPin}>
                  <textarea 
                    className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500/20 min-h-[100px]"
                    placeholder="Jl. Prof. Sudarto No. 13, Tembalang..."
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  ></textarea>
                </FormField>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
              {errorMessage && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}
              <div className="ml-auto flex gap-3">
                <Button variant="outline" type="button" onClick={() => navigate('/dashboard/members')} disabled={isSaving}>
                  Batal
                </Button>
                <Button className="gap-2 px-8" type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
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
      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      {children}
    </div>
  );
}
