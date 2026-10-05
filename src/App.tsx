/**
 * TargetFlow - Aplikasi Web Jurnal Harian & Target Kerja Terenkripsi Awan
 * @license Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Calendar,
  CheckCircle2,
  Cloud,
  FileCheck,
  FileText,
  Laptop,
  Lock,
  Plus,
  Radio,
  RefreshCw,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  WifiOff,
} from 'lucide-react';
import {
  JournalEntry,
  SchoolSettings,
  SyncConfig,
  NotificationSettings,
} from './types/journal';
import {
  DEFAULT_SCHOOL_SETTINGS,
  INITIAL_JOURNAL_ENTRIES,
} from './constants/defaultData';
import { Header } from './components/Header';
import { JournalForm } from './components/JournalForm';
import { JournalTable } from './components/JournalTable';
import { OfficialReportView } from './components/OfficialReportView';
import { SyncModal } from './components/SyncModal';
import { SettingsModal } from './components/SettingsModal';
import { NotificationBanner } from './components/NotificationBanner';
import { generateRandomSyncKey, encryptData, decryptData, EncryptedPayload } from './services/crypto';
import {
  pushEncryptedDataToCloud,
  pullEncryptedDataFromCloud,
  CloudPayloadBundle,
} from './services/cloudSync';
import {
  playReminderSound,
  sendBrowserNotification,
} from './services/notifications';
import { RealtimeSyncManager } from './services/realtimeSocket';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  ENTRIES: 'targetflow_entries_v1',
  SETTINGS: 'targetflow_settings_v1',
  SYNC: 'targetflow_sync_v1',
  NOTIFS: 'targetflow_notifs_v1',
  DARK_MODE: 'targetflow_dark_v1',
};

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to html document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDarkMode));
  }, [isDarkMode]);

  // Main state
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved entries:', e);
    }
    return INITIAL_JOURNAL_ENTRIES;
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved settings:', e);
    }
    return DEFAULT_SCHOOL_SETTINGS;
  });

  const [syncConfig, setSyncConfig] = useState<SyncConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYNC);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved sync config:', e);
    }
    return {
      syncKey: generateRandomSyncKey(),
      passphrase: 'targetflow-aman-2026',
      autoSync: true,
      lastSyncedAt: null,
      syncStatus: 'idle',
      deviceId: 'dev-' + Math.random().toString(36).slice(2, 9),
      connectedDevices: 1,
      realtimeStatus: 'connecting',
    };
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load notification settings:', e);
    }
    return {
      enabled: true,
      time: '16:00',
      sound: true,
    };
  });

  // Navigation tab & Modals
  const [activeTab, setActiveTab] = useState<'journal' | 'report' | 'sync' | 'settings'>('journal');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Real-time synchronization manager reference
  const realtimeRef = useRef<RealtimeSyncManager | null>(null);
  // Flag to guard against infinite loops from remote updates
  const isApplyingRemoteMutation = useRef<boolean>(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save entries to localStorage (Optimistic UI)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error('Error saving entries to local storage:', e);
    }
  }, [entries]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to local storage:', e);
    }
  }, [settings]);

  // Save syncConfig to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC, JSON.stringify(syncConfig));
    } catch (e) {
      console.error('Error saving sync config to local storage:', e);
    }
  }, [syncConfig]);

  // Save notificationSettings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notificationSettings));
    } catch (e) {
      console.error('Error saving notifs to local storage:', e);
    }
  }, [notificationSettings]);

  // Cloud HTTP Sync Handler
  const handlePushToCloud = useCallback(async () => {
    if (!syncConfig.syncKey || !syncConfig.passphrase) return;

    setSyncConfig((prev) => ({ ...prev, syncStatus: 'syncing' }));
    try {
      const result = await pushEncryptedDataToCloud(
        entries,
        settings,
        syncConfig.syncKey,
        syncConfig.passphrase,
        syncConfig.deviceId
      );

      setSyncConfig((prev) => ({
        ...prev,
        syncStatus: 'synced',
        lastSyncedAt: result.updatedAt,
      }));
    } catch (err) {
      console.warn('Sync error:', err);
      setSyncConfig((prev) => ({
        ...prev,
        syncStatus: 'error',
        errorMessage: err instanceof Error ? err.message : String(err),
      }));
      throw err;
    }
  }, [entries, settings, syncConfig.syncKey, syncConfig.passphrase, syncConfig.deviceId]);

  // Broadcast Real-Time Mutation via WebSocket
  const broadcastRealtimeMutation = useCallback(
    async (updatedEntries: JournalEntry[], updatedSettings: SchoolSettings) => {
      if (!syncConfig.autoSync || !syncConfig.passphrase) return;

      try {
        const bundle: CloudPayloadBundle = {
          entries: updatedEntries,
          settings: updatedSettings,
          lastUpdated: new Date().toISOString(),
        };

        const encrypted = await encryptData(bundle, syncConfig.passphrase);

        if (realtimeRef.current) {
          const sent = realtimeRef.current.pushMutation(encrypted, bundle.lastUpdated);
          if (sent) {
            setSyncConfig((prev) => ({
              ...prev,
              syncStatus: 'synced',
              lastSyncedAt: bundle.lastUpdated,
            }));
          }
        }
      } catch (err) {
        console.warn('Real-time push failed:', err);
      }
    },
    [syncConfig.autoSync, syncConfig.passphrase]
  );

  // Initialize Real-time WebSocket listener
  useEffect(() => {
    const manager = new RealtimeSyncManager(syncConfig.syncKey, syncConfig.deviceId);
    realtimeRef.current = manager;

    manager.onStatusChangeCallback = (status) => {
      setSyncConfig((prev) => ({ ...prev, realtimeStatus: status }));
    };

    manager.onPresenceChangeCallback = (count) => {
      setSyncConfig((prev) => ({ ...prev, connectedDevices: count }));
    };

    // Remote mutation callback: received when another device mutates data
    manager.onRemoteMutationCallback = async (payload, fromDeviceId, updatedAt) => {
      if (fromDeviceId === syncConfig.deviceId) return; // ignore self
      if (!syncConfig.passphrase) return;

      try {
        const decrypted = await decryptData<CloudPayloadBundle>(payload, syncConfig.passphrase);
        if (decrypted && decrypted.entries) {
          isApplyingRemoteMutation.current = true;
          setEntries(decrypted.entries);
          if (decrypted.settings) {
            setSettings(decrypted.settings);
          }
          setSyncConfig((prev) => ({
            ...prev,
            lastSyncedAt: updatedAt,
            syncStatus: 'synced',
          }));

          // Notify user visually
          setRealtimeNotification('Data jurnal & target diperbarui otomatis secara real-time dari perangkat lain.');
          setTimeout(() => setRealtimeNotification(null), 4000);
        }
      } catch (err) {
        console.warn('Failed to decrypt remote mutation:', err);
      }
    };

    manager.connect();

    return () => {
      manager.disconnect();
    };
  }, [syncConfig.syncKey, syncConfig.deviceId, syncConfig.passphrase]);

  // Auto-sync whenever entries or settings change locally (debounced)
  useEffect(() => {
    // If this update was triggered by a remote mutation, don't echo back!
    if (isApplyingRemoteMutation.current) {
      isApplyingRemoteMutation.current = false;
      return;
    }

    if (!syncConfig.autoSync) return;

    // Immediately push via WebSocket for instantaneous sync on other devices
    broadcastRealtimeMutation(entries, settings).catch(() => {});

    // Also debounced push via HTTP REST for persistence
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      handlePushToCloud().catch(() => {});
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [entries, settings, syncConfig.autoSync, broadcastRealtimeMutation, handlePushToCloud]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (realtimeRef.current) {
        realtimeRef.current.connect();
      }
      handlePushToCloud().catch(() => {});
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncConfig((prev) => ({ ...prev, syncStatus: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handlePushToCloud]);

  // Pull from cloud on connecting other device
  const handlePullFromCloud = async (customKey: string, customPass: string) => {
    setSyncConfig((prev) => ({ ...prev, syncStatus: 'syncing' }));
    try {
      const { bundle, updatedAt } = await pullEncryptedDataFromCloud(customKey, customPass);
      isApplyingRemoteMutation.current = true;
      if (bundle.entries) {
        setEntries(bundle.entries);
      }
      if (bundle.settings) {
        setSettings(bundle.settings);
      }
      setSyncConfig((prev) => ({
        ...prev,
        syncKey: customKey,
        passphrase: customPass,
        syncStatus: 'synced',
        lastSyncedAt: updatedAt,
      }));

      // Reconnect realtime WebSocket to new room
      if (realtimeRef.current) {
        realtimeRef.current.updateCredentials(customKey, syncConfig.deviceId);
      }
    } catch (err) {
      setSyncConfig((prev) => ({ ...prev, syncStatus: 'error' }));
      throw err;
    }
  };

  // Account Login Success Handler
  const handleAccountLoginSuccess = (
    email: string,
    syncId: string,
    passphrase: string,
    bundle?: CloudPayloadBundle
  ) => {
    isApplyingRemoteMutation.current = true;
    if (bundle) {
      if (bundle.entries) setEntries(bundle.entries);
      if (bundle.settings) setSettings(bundle.settings);
    }
    setSyncConfig((prev) => ({
      ...prev,
      userEmail: email,
      syncKey: syncId,
      passphrase,
      syncStatus: 'synced',
      lastSyncedAt: bundle ? bundle.lastUpdated : prev.lastSyncedAt,
    }));

    if (realtimeRef.current) {
      realtimeRef.current.updateCredentials(syncId, syncConfig.deviceId);
    }
  };

  // Daily Reminder Timer Check
  useEffect(() => {
    if (!notificationSettings.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayISO = now.toISOString().split('T')[0];

      if (
        currentTimeStr === notificationSettings.time &&
        notificationSettings.lastNotifiedDate !== todayISO
      ) {
        // Trigger notification
        playReminderSound();
        sendBrowserNotification('Pengingat Target Harian TargetFlow', {
          body: 'Waktunya memeriksa target kerja Anda hari ini. Pastikan capaian tuntas tercatat!',
        });

        setNotificationSettings((prev) => ({
          ...prev,
          lastNotifiedDate: todayISO,
        }));
      }
    }, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [notificationSettings]);

  // Initial cloud check or silent sync on mount
  useEffect(() => {
    if (!syncConfig.lastSyncedAt && syncConfig.autoSync) {
      handlePushToCloud().catch(() => {});
    }
  }, []);

  // Journal CRUD operations (Optimistic UI)
  const handleAddEntry = (newEntry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const entryWithId: JournalEntry = {
      ...newEntry,
      id: 'entry-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setEntries((prev) => [entryWithId, ...prev]);
  };

  const handleToggleStatus = (id: string) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          const nextStatus = entry.status === 'tuntas' ? 'belum_tuntas' : 'tuntas';
          return {
            ...entry,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return entry;
      })
    );
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleUpdateEntry = (id: string, updated: Partial<JournalEntry>) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          return {
            ...entry,
            ...updated,
            updatedAt: new Date().toISOString(),
          };
        }
        return entry;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-700">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'sync') {
            setIsSyncModalOpen(true);
          } else if (tab === 'settings') {
            setIsSettingsModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        syncConfig={syncConfig}
        onManualSync={() => setIsSyncModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Floating Real-Time Synchronization Toast */}
      {realtimeNotification && (
        <div className="fixed top-20 right-4 z-40 max-w-sm bg-emerald-600 text-white p-3.5 rounded-2xl shadow-xl border border-emerald-400 flex items-center gap-3 text-xs animate-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex-1">
            <span className="font-bold block">Sinkronisasi Real-Time</span>
            <span>{realtimeNotification}</span>
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-center gap-2 font-medium">
          <WifiOff className="w-4 h-4" />
          <span>Mode Offline: Anda tetap dapat menambah/mengubah jurnal secara lokal. Data otomatis tersinkronisasi saat terhubung internet kembali.</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-4 sm:space-y-6 pb-24 md:pb-8">
        {/* Daily Motivation & Target Status Banner */}
        <NotificationBanner
          entries={entries}
          onOpenReport={() => setActiveTab('report')}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* View Switcher: Journal vs Official Report */}
        {activeTab === 'journal' ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Input Form */}
            <JournalForm onAddEntry={handleAddEntry} />

            {/* Interactive Journal Records */}
            <JournalTable
              entries={entries}
              onToggleStatus={handleToggleStatus}
              onDeleteEntry={handleDeleteEntry}
              onUpdateEntry={handleUpdateEntry}
              onOpenReportView={() => setActiveTab('report')}
            />
          </div>
        ) : (
          /* Official Report View (matching exact uploaded photo) */
          <OfficialReportView
            entries={entries}
            settings={settings}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}
      </main>

      {/* Footer (Simplified for mobile) */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 sm:py-6 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 print:hidden hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              TargetFlow
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Lock className="w-3.5 h-3.5" /> Enkripsi Klien (AES-256)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
              <Radio className="w-3 h-3" /> Real-Time Aktif
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>
                {syncConfig.userEmail
                  ? `Akun: ${syncConfig.userEmail}`
                  : `Sync Key: ${syncConfig.syncKey}`}
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar (Natural Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 items-center h-16 px-1 shadow-lg pb-safe">
        <button
          onClick={() => setActiveTab('journal')}
          className={`min-h-[48px] flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors ${
            activeTab === 'journal'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Menu Jurnal"
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px]">Jurnal</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`min-h-[48px] flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors ${
            activeTab === 'report'
              ? 'text-sky-600 dark:text-sky-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-label="Menu Format Laporan"
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">Laporan</span>
        </button>

        <button
          onClick={() => setIsSyncModalOpen(true)}
          className="min-h-[48px] flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors text-slate-500 dark:text-slate-400 hover:text-sky-600"
          aria-label="Menu Awan dan Sinkronisasi HP"
        >
          <Laptop className="w-5 h-5" />
          <span className="text-[10px]">Awan</span>
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="min-h-[48px] flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors text-slate-500 dark:text-slate-400 hover:text-sky-600"
          aria-label="Menu Pengaturan Kop dan Pengingat"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Pengaturan</span>
        </button>
      </nav>

      {/* Sync / Multi-Device Pairing Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncConfig={syncConfig}
        onUpdateSyncConfig={(updated) => setSyncConfig((prev) => ({ ...prev, ...updated }))}
        onTriggerSyncNow={handlePushToCloud}
        onPullFromCloudNow={handlePullFromCloud}
        onAccountLoginSuccess={handleAccountLoginSuccess}
      />

      {/* Settings Modal (Kop Surat, NIP, Daily Reminder) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        notificationSettings={notificationSettings}
        onSaveNotificationSettings={(newNotif) => setNotificationSettings(newNotif)}
      />
    </div>
  );
}
