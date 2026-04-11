import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/lib/auth-context';
import { useToast } from '@/src/lib/toast-context';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const result = login({ email, password });

    if (!result.success) {
      toast.error('Login gagal', result.message);
      setIsSubmitting(false);
      return;
    }

    toast.success('Login berhasil', 'Selamat datang, Admin TMKP');
    onClose();
    navigate('/dashboard', { replace: true });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(34,197,94,0.1)] rounded-2xl overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/10 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="px-7 py-6 border-b border-white/10 flex items-center justify-between relative z-10">
              <div>
                <h2 className="text-2xl font-black text-white font-headline">Portal Admin</h2>
                <p className="text-sm text-white/50 mt-1">Sistem Terpusat HMI TMKP</p>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-7 space-y-5 relative z-10">
                <div className="flex flex-col mb-4">
                  <h2 className="text-xl font-bold tracking-tight text-white mb-2">Akses Terbatas</h2>
                </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Username</label>
                <div className="relative mt-2">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Masukkan username admin"
                    className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 pl-10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">Password</label>
                <div className="relative mt-2">
                  <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    className="w-full h-10 bg-black/40 border border-white/10 rounded-lg px-3 pl-10 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 font-medium" disabled={isSubmitting}>
                {isSubmitting ? 'Memproses...' : 'Akses Dashboard'}
              </Button>


            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
