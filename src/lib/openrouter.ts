export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `Kamu adalah asisten AI untuk admin organisasi HMI TMKP (Himpunan Mahasiswa Islam - Teknik Mesin, Kelautan, dan Perikanan). Jawab pertanyaan dengan ramah, singkat, dan dalam Bahasa Indonesia. Bantu admin mengelola organisasi, memberikan saran tentang kegiatan, keuangan, dan keanggotaan.`;

import { settingsService } from './supabase';
import { decrypt } from './encryption';

export async function sendChatMessage(
  messages: ChatMessage[],
  model: string = 'google/gemma-3-4b-it:free'
): Promise<string> {
  // Try fetching from DB settings first
  let apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  try {
    const encryptedKey = await settingsService.getSetting('openrouter_api_key');
    if (encryptedKey) {
      const decrypted = decrypt(encryptedKey);
      if (decrypted) apiKey = decrypted;
    }
  } catch (error) {
    console.warn('Failed to fetch/decrypt API key from settings', error);
  }
  
  if (!apiKey) {
    throw new Error('OpenRouter API key belum dikonfigurasi. Atur di menu Settings.');
  }

  const payload = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    max_tokens: 1024,
    temperature: 0.7,
  };

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'HMI TMKP Admin Dashboard',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `OpenRouter error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Tidak ada respons dari AI.';
}

export async function testApiKey(testKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${testKey}`
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

export const AI_MODELS = [
  { id: 'google/gemma-3-4b-it:free', name: 'Gemma 3 (4B)', description: 'Google Base (gratis)' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 (26B)', description: 'Google Advanced (gratis)' },
  { id: 'google/gemma-3n-e4b-it:free', name: 'Gemma 3N (e4B)', description: 'Google Efficient (gratis)' },
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 (70B)', description: 'Meta Powerful (gratis)' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air', description: 'Z-AI Smart (gratis)' },
];
