import { useNavigate } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/lib/auth-context';

export default function SettingsPage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section>
        <h2 className="text-2xl font-extrabold text-white font-headline tracking-tight">Settings</h2>
        <p className="text-white/50">Pengaturan akun dan sesi login</p>
      </section>

      <div className="bg-white/5 rounded-xl border border-white/10 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-white">Informasi Akun</h3>
          <Badge variant="secondary">ADMIN</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">Nama</p>
            <p className="text-sm font-bold text-white mt-1">{session?.name || '-'}</p>
          </div>
          <div className="rounded-lg border border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">Email</p>
            <p className="text-sm font-bold text-white mt-1">{session?.email || '-'}</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            variant="danger"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
