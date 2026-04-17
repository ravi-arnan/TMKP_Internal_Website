import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/lib/auth-context';
import { AI_MODELS, testApiKey } from '@/src/lib/openrouter';
import { settingsService } from '@/src/lib/supabase';
import { encrypt, decrypt } from '@/src/lib/encryption';
import { Bot, Check, Sparkles, KeyRound, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedModel = localStorage.getItem('ai_model');
        if (savedModel) setSelectedModel(savedModel);

        const encryptedKey = await settingsService.getSetting('openrouter_api_key');
        if (encryptedKey) {
          const decrypted = decrypt(encryptedKey);
          if (decrypted) setApiKey(decrypted);
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSaveModel = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('ai_model', selectedModel);
      if (apiKey.trim()) {
        const isValid = await testApiKey(apiKey.trim());
        if (!isValid) {
          alert('API Key tidak valid atau diblokir oleh OpenRouter. Silakan periksa kembali.');
          setIsSaving(false);
          return;
        }
        const encryptedKey = encrypt(apiKey.trim());
        await settingsService.updateSetting('openrouter_api_key', encryptedKey);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Gagal menyimpan pengaturan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white font-headline tracking-tight">Settings</h2>
        <p className="text-gray-500 dark:text-white/50">Pengaturan akun, sesi login, dan AI Agent</p>
      </section>

      {/* Account Info */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Informasi Akun</h3>
          <Badge variant="secondary">ADMIN</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-gray-200 dark:border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50 font-semibold">Nama</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{session?.name || '-'}</p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-white/10 p-4">
            <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50 font-semibold">Email</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{session?.email || '-'}</p>
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

      {/* AI Agent Config */}
      <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 shadow-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center border border-green-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Agent</h3>
            <p className="text-xs text-gray-500 dark:text-white/50">Konfigurasi model AI untuk chatbot asisten admin</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">Pilih Model AI</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`relative rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  selectedModel === model.id
                    ? 'border-green-500/50 bg-green-500/5 ring-1 ring-green-500/20'
                    : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 hover:border-gray-300 dark:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedModel === model.id ? 'bg-green-500/20 text-green-400' : 'bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white/50'
                    }`}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{model.name}</p>
                      <p className="text-[10px] text-gray-400 dark:text-white/40 mt-0.5">{model.description}</p>
                    </div>
                  </div>
                  {selectedModel === model.id && (
                    <div className="w-5 h-5 rounded-full bg-green-500 text-black flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-gray-300 dark:text-white/30 font-mono mt-2 truncate">{model.id}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-white/10 mt-4">
          <p className="text-[10px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-widest">OpenRouter API Key</p>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className="h-4 w-4 text-gray-400 dark:text-white/40" />
            </div>
            <Input
              type="password"
              placeholder="sk-or-v1-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-white/40">Kunci API akan dienkripsi sebelum disimpan ke dalam database untuk alasan keamanan.</p>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-gray-500 dark:text-white/50">Powered by OpenRouter</span>
          </div>
          <Button onClick={handleSaveModel} className="gap-2">
            {saved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {saved ? 'Tersimpan!' : 'Simpan Konfigurasi'}
          </Button>
        </div>
      </div>
    </div>
  );
}
