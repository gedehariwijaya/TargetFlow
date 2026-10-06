/**
 * TargetFlow - Aplikasi Web Jurnal Harian & Target Kerja dengan Firebase Realtime
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Lock,
  Radio,
  Settings,
  Target,
  WifiOff,
} from 'lucide-react';
import {
  JournalEntry,
  SchoolSettings,
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
import { SettingsModal } from './components/SettingsModal';
import { NotificationBanner } from './components/NotificationBanner';
import {
  subscribeJournalEntries,
  saveJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  subscribeSchoolSettings,
  saveSchoolSettings,
} from './services/firebase';
import {
  playReminderSound,
  sendBrowserNotification,
} from './services/notifications';

const STORAGE_KEYS = {
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

  // Main state from Firebase Realtime
  const [entries, setEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);
  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);

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

  // Navigation tab & Modals (Jurnal, Laporan, Pengaturan)
  const [activeTab, setActiveTab] = useState<'journal' | 'report' | 'settings'>('journal');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Save notificationSettings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notificationSettings));
    } catch (e) {
      console.error('Error saving notifs to local storage:', e);
    }
  }, [notificationSettings]);

  // -------------------------------------------------------------
  // Firebase Real-Time Synchronization (Zero manual sync needed)
  // -------------------------------------------------------------
  useEffect(() => {
    let isInitialFetch = true;

    // 1. Subscribe to journal entries collection
    const unsubscribeEntries = subscribeJournalEntries(
      (realtimeEntries) => {
        if (realtimeEntries.length === 0 && isInitialFetch) {
          // Seed default entries into Firestore if empty
          INITIAL_JOURNAL_ENTRIES.forEach((entry) => {
            saveJournalEntry(entry).catch(console.error);
          });
        } else {
          setEntries(realtimeEntries);
        }
        setIsFirebaseLoaded(true);
        isInitialFetch = false;
      },
      (error) => {
        console.warn('Firebase sync offline or loading:', error);
      }
    );

    // 2. Subscribe to school settings document
    const unsubscribeSettings = subscribeSchoolSettings((realtimeSettings) => {
      if (realtimeSettings && realtimeSettings.schoolName) {
        setSettings(realtimeSettings);
      }
    });

    return () => {
      unsubscribeEntries();
      unsubscribeSettings();
    };
  }, []);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
        playReminderSound();
        sendBrowserNotification('Pengingat Target Harian TargetFlow', {
          body: 'Waktunya memeriksa target kerja Anda hari ini. Pastikan capaian tuntas tercatat!',
        });

        setNotificationSettings((prev) => ({
          ...prev,
          lastNotifiedDate: todayISO,
        }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [notificationSettings]);

  // -------------------------------------------------------------
  // Real-time CRUD Operations (Instantly reflected on all devices)
  // -------------------------------------------------------------
  const handleAddEntry = async (newEntry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const timestamp = new Date().toISOString();
    const entryWithId: JournalEntry = {
      ...newEntry,
      id: 'entry-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Optimistically update local view immediately
    setEntries((prev) => [entryWithId, ...prev]);

    // Save directly to Firebase Firestore
    try {
      await saveJournalEntry(entryWithId);
    } catch (err) {
      console.error('Failed to save to Firebase:', err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const targetEntry = entries.find((e) => e.id === id);
    if (!targetEntry) return;

    const nextStatus = targetEntry.status === 'tuntas' ? 'belum_tuntas' : 'tuntas';
    const updatedAt = new Date().toISOString();

    // Optimistic local update
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: nextStatus, updatedAt } : e))
    );

    // Save directly to Firebase Firestore
    try {
      await updateJournalEntry(id, { status: nextStatus, updatedAt });
    } catch (err) {
      console.error('Failed to update status in Firebase:', err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    // Optimistic local update
    setEntries((prev) => prev.filter((entry) => entry.id !== id));

    // Delete in Firebase Firestore
    try {
      await deleteJournalEntry(id);
    } catch (err) {
      console.error('Failed to delete in Firebase:', err);
    }
  };

  const handleUpdateEntry = async (id: string, updated: Partial<JournalEntry>) => {
    const updatedAt = new Date().toISOString();

    // Optimistic local update
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated, updatedAt } : e))
    );

    // Update in Firebase Firestore
    try {
      await updateJournalEntry(id, { ...updated, updatedAt });
    } catch (err) {
      console.error('Failed to update in Firebase:', err);
    }
  };

  const handleSaveSettings = async (newSettings: SchoolSettings) => {
    setSettings(newSettings);
    try {
      await saveSchoolSettings(newSettings);
    } catch (err) {
      console.error('Failed to save settings in Firebase:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-700">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isFirebaseConnected={isFirebaseLoaded}
      />

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-center gap-2 font-medium">
          <WifiOff className="w-4 h-4" />
          <span>Mode Offline: Data tersimpan secara lokal di perangkat dan otomatis terhubung ke Firebase saat online.</span>
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

      {/* Footer (Simplified & clean) */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 sm:py-6 text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 print:hidden hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              TargetFlow
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Firebase Realtime Terhubung
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
            >
              Pengaturan Kop & Pengingat
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar (Clean 3-Tab Thumb Zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 items-center h-16 px-2 shadow-lg pb-safe">
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
          <span className="text-[11px]">Jurnal</span>
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
          <span className="text-[11px]">Laporan</span>
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="min-h-[48px] flex flex-col items-center justify-center h-full gap-0.5 cursor-pointer transition-colors text-slate-500 dark:text-slate-400 hover:text-sky-600"
          aria-label="Menu Pengaturan Kop dan Pengingat"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px]">Pengaturan</span>
        </button>
      </nav>

      {/* Settings Modal (Kop Surat, NIP, Daily Reminder) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        notificationSettings={notificationSettings}
        onSaveNotificationSettings={(newNotif) => setNotificationSettings(newNotif)}
      />
    </div>
  );
}
