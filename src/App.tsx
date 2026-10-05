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
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
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
import { generateRandomSyncKey } from './services/crypto';
import {
  pushEncryptedDataToCloud,
  pullEncryptedDataFromCloud,
} from './services/cloudSync';
import {
  playReminderSound,
  sendBrowserNotification,
} from './services/notifications';

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
      deviceId: 'device-' + Math.random().toString(36).slice(2, 9),
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

  // Sync debounce ref
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save entries to localStorage
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

  // Cloud Sync Handler
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

  // Auto-sync whenever entries or settings change
  useEffect(() => {
    if (!syncConfig.autoSync) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce push by 1.5 seconds so rapid edits are grouped
    syncTimeoutRef.current = setTimeout(() => {
      handlePushToCloud().catch(() => {});
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [entries, settings, syncConfig.autoSync, handlePushToCloud]);

  // Pull from cloud on connecting other device
  const handlePullFromCloud = async (customKey: string, customPass: string) => {
    setSyncConfig((prev) => ({ ...prev, syncStatus: 'syncing' }));
    try {
      const { bundle, updatedAt } = await pullEncryptedDataFromCloud(customKey, customPass);
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
    } catch (err) {
      setSyncConfig((prev) => ({ ...prev, syncStatus: 'error' }));
      throw err;
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
    // Attempt push on first load if never synced
    if (!syncConfig.lastSyncedAt && syncConfig.autoSync) {
      handlePushToCloud().catch(() => {});
    }
  }, []);

  // Journal CRUD operations
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Daily Motivation & Target Status Banner */}
        <NotificationBanner
          entries={entries}
          onOpenReport={() => setActiveTab('report')}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* View Switcher: Journal vs Official Report */}
        {activeTab === 'journal' ? (
          <div className="space-y-6">
            {/* Quick Input Form */}
            <JournalForm onAddEntry={handleAddEntry} />

            {/* Interactive Journal Records Table */}
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

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              TargetFlow
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Lock className="w-3.5 h-3.5" /> Enkripsi Klien Aktif (AES-GCM-256)
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Status Sinkronisasi: {syncConfig.syncKey}</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              Pengaturan Kop & Pengingat
            </button>
          </div>
        </div>
      </footer>

      {/* Sync / Multi-Device Pairing Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncConfig={syncConfig}
        onUpdateSyncConfig={(updated) => setSyncConfig((prev) => ({ ...prev, ...updated }))}
        onTriggerSyncNow={handlePushToCloud}
        onPullFromCloudNow={handlePullFromCloud}
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
