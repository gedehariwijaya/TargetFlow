export type JournalStatus = 'tuntas' | 'belum_tuntas';

export interface JournalEntry {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  dayName: string; // e.g. "Senin"
  formattedDate: string; // e.g. "Senin, 5 Okt 2026"
  target: string; // Target / Kegiatan
  status: JournalStatus; // tuntas / belum tuntas
  notes?: string; // Catatan tambahan / kendala / tindak lanjut
  category?: string; // e.g. "Pembelajaran", "Administrasi", "Bimbingan Siswa", "Tugas Tambahan"
  createdAt: string;
  updatedAt: string;
}

export interface SchoolSettings {
  provinceName: string;
  serviceName: string;
  schoolName: string;
  address: string;
  website: string;
  email: string;
  npsn: string;
  nss: string;
  phone: string;
  postalCode: string;
  reportTitle: string;
  reportNote: string;
  
  // Signature info
  place: string;
  signDate: string;
  signTitle1: string;
  signTitle2: string;
  principalName: string;
  principalNip: string;
  
  // Teacher/User profile
  teacherName: string;
  teacherNip: string;
  teacherRole: string;
}

export interface SyncConfig {
  syncKey: string;
  passphrase: string;
  autoSync: boolean;
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  errorMessage?: string;
  deviceId: string;
  connectedDevices?: number;
  realtimeStatus?: 'connected' | 'connecting' | 'disconnected';
  userEmail?: string;
  lastSyncSource?: 'local' | 'remote' | 'cloud';
}

export interface NotificationSettings {
  enabled: boolean;
  time: string; // e.g. "16:00"
  sound: boolean;
  lastNotifiedDate?: string;
}
