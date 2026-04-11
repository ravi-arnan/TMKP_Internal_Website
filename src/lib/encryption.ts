import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  console.warn('VITE_ENCRYPTION_KEY is not defined in .env. Encryption will fall back to a default key (NOT SECURE FOR PRODUCTION).');
}

const getSecret = () => ENCRYPTION_KEY || 'default-secret-key-tmkp';

export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, getSecret()).toString();
};

export const decrypt = (ciphertext: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, getSecret());
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt data', error);
    return '';
  }
};
