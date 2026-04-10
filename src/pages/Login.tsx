import * as React from 'react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login gagal. Periksa email dan password Anda.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-primary p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz2sOk9_ctAmla970vbrCqaDFX9RhIsD2SCR1SNgEwybn27NjHZQi8oLivg5RY-0s_Q8FGVQku7gskayuEy5NOQ1Sx13PXEoaXHx9Ioe6shCdi8fCPJDv9SIdLcjoBfILCYsFGSl_GIM-dyDY0Lr6lAdk9IIhpbE5f03q5iILyl3-BbvIT6V8vSxZbKzF2v-arEzndCzRhM56Q9MjBmZZ5oEy860bCWh4zTN5XFmHgH1Um3szGP1CF_z4RAUET6YA9h9kEaGJTPYE"
                alt="HMI Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-widest font-headline">HMI TMKP</h1>
            <p className="text-primary-foreground/70 text-sm mt-1">Administrative Excellence</p>
          </div>

          <div className="p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Masuk ke Dashboard</h2>
              <p className="text-sm text-slate-500 mt-1">Gunakan akun admin HMI TMKP Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="admin@hmitmkp.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full gap-2 py-3 mt-2" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2025 HMI TMKP. Sistem khusus pengurus.
        </p>
      </div>
    </div>
  );
}
