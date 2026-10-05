/**
 * TargetFlow End-to-End Encryption Service
 * Implements AES-GCM 256-bit with PBKDF2 Key Derivation (100,000 rounds)
 * Zero-Knowledge encryption: Server never sees raw journal content.
 */

// Helper to convert Uint8Array to Base64
function bufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  const len = buffer.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

// Helper to convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives a 256-bit AES-GCM CryptoKey from a user passphrase and salt
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  ciphertext: string; // Base64
  iv: string; // Base64
  salt: string; // Base64
  version: number;
}

/**
 * Encrypt any JSON-serializable object
 */
export async function encryptData(data: unknown, passphrase: string): Promise<EncryptedPayload> {
  if (!passphrase || passphrase.trim() === '') {
    throw new Error('Passphrase enkripsi tidak boleh kosong');
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const jsonString = JSON.stringify(data);
  const encodedData = new TextEncoder().encode(jsonString);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as ArrayBuffer,
    },
    key,
    encodedData
  );

  return {
    ciphertext: bufferToBase64(new Uint8Array(encryptedBuffer)),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
    version: 1,
  };
}

/**
 * Decrypt payload back into original object
 */
export async function decryptData<T>(payload: EncryptedPayload, passphrase: string): Promise<T> {
  if (!passphrase || passphrase.trim() === '') {
    throw new Error('Passphrase enkripsi diperlukan untuk membuka data');
  }

  const salt = base64ToBuffer(payload.salt);
  const iv = base64ToBuffer(payload.iv);
  const ciphertextBuffer = base64ToBuffer(payload.ciphertext);

  const key = await deriveKey(passphrase, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as ArrayBuffer,
      },
      key,
      ciphertextBuffer as unknown as ArrayBuffer
    );

    const decryptedString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedString) as T;
  } catch (error) {
    throw new Error('Gagal mendekripsi data: Kunci sandi / Passphrase salah atau data korup.');
  }
}

/**
 * Generates an easy-to-remember sync pairing key
 * e.g. "TF-7489-BALI"
 */
export function generateRandomSyncKey(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TF-${randomPart}-BALI`;
}
