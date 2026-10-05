import { JournalEntry, SchoolSettings } from '../types/journal';
import { encryptData, decryptData, EncryptedPayload } from './crypto';

export interface CloudPayloadBundle {
  entries: JournalEntry[];
  settings: SchoolSettings;
  lastUpdated: string;
}

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password + ':targetflow_salt');
  const digest = await window.crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function pushEncryptedDataToCloud(
  entries: JournalEntry[],
  settings: SchoolSettings,
  syncKey: string,
  passphrase: string,
  deviceId: string
): Promise<{ success: boolean; updatedAt: string }> {
  if (!syncKey || !passphrase) {
    throw new Error('Sync Key dan Passphrase harus diisi untuk sinkronisasi');
  }

  const bundle: CloudPayloadBundle = {
    entries,
    settings,
    lastUpdated: new Date().toISOString(),
  };

  // Encrypt client-side using AES-GCM 256-bit
  const encrypted = await encryptData(bundle, passphrase);

  const res = await fetch('/api/sync/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      syncId: syncKey,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      salt: encrypted.salt,
      version: encrypted.version,
      updatedAt: bundle.lastUpdated,
      clientDeviceId: deviceId,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Gagal sinkronisasi ke awan (HTTP ${res.status})`);
  }

  const result = await res.json();
  return { success: true, updatedAt: result.updatedAt };
}

export async function pullEncryptedDataFromCloud(
  syncKey: string,
  passphrase: string
): Promise<{ bundle: CloudPayloadBundle; updatedAt: string }> {
  if (!syncKey || !passphrase) {
    throw new Error('Sync Key dan Passphrase diperlukan');
  }

  const res = await fetch(`/api/sync/pull/${encodeURIComponent(syncKey)}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Data dengan Sync Key "${syncKey}" belum ditemukan di awan.`);
    }
    throw new Error(`Gagal mengambil data dari awan (HTTP ${res.status})`);
  }

  const result = await res.json();
  const record = result.data;

  const payload: EncryptedPayload = {
    ciphertext: record.ciphertext,
    iv: record.iv,
    salt: record.salt,
    version: record.version,
  };

  // Decrypt client-side
  const decrypted = await decryptData<CloudPayloadBundle>(payload, passphrase);

  return {
    bundle: decrypted,
    updatedAt: record.updatedAt,
  };
}

export async function registerAccount(
  email: string,
  passphraseAsPassword: string,
  syncId: string
): Promise<{ success: boolean; email: string; syncId: string }> {
  const passwordHash = await hashPassword(passphraseAsPassword);

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      passwordHash,
      syncId,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal mendaftarkan akun');
  }

  return await res.json();
}

export async function loginAccount(
  email: string,
  passphraseAsPassword: string
): Promise<{ success: boolean; email: string; syncId: string; bundle?: CloudPayloadBundle }> {
  const passwordHash = await hashPassword(passphraseAsPassword);

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      passwordHash,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal masuk akun. Periksa email dan password Anda.');
  }

  const result = await res.json();

  let bundle: CloudPayloadBundle | undefined = undefined;
  if (result.vault) {
    const payload: EncryptedPayload = {
      ciphertext: result.vault.ciphertext,
      iv: result.vault.iv,
      salt: result.vault.salt,
      version: result.vault.version,
    };
    bundle = await decryptData<CloudPayloadBundle>(payload, passphraseAsPassword);
  }

  return {
    success: true,
    email: result.email,
    syncId: result.syncId,
    bundle,
  };
}

export async function checkCloudVersion(syncKey: string): Promise<{ exists: boolean; updatedAt?: string }> {
  try {
    const res = await fetch(`/api/sync/check/${encodeURIComponent(syncKey)}`);
    if (!res.ok) return { exists: false };
    return await res.json();
  } catch {
    return { exists: false };
  }
}
