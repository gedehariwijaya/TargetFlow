import React from 'react';
import {
  CheckCircle2,
  Cloud,
  CloudOff,
  FileText,
  Laptop,
  Moon,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sun,
  Target,
} from 'lucide-react';
import { SyncConfig } from '../types/journal';

interface HeaderProps {
  activeTab: 'journal' | 'report' | 'sync' | 'settings';
  setActiveTab: (tab: 'journal' | 'report' | 'sync' | 'settings') => void;
  syncConfig: SyncConfig;
  onManualSync: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  hasUnsavedLocalChanges?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  syncConfig,
  onManualSync,
  isDarkMode,
  onToggleDarkMode,
  hasUnsavedLocalChanges,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Target className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                  Target<span className="text-sky-600 dark:text-sky-400">Flow</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  <ShieldCheck className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  E2E Enkripsi
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400">
                Jurnal Harian & Target Kerja Terenkripsi Awan
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'journal'
                  ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Jurnal</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'report'
                  ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Format Laporan</span>
              <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] uppercase font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded">
                Resmi
              </span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sync'
                  ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span className="hidden sm:inline">Perangkat & Awan</span>
              <span className="sm:hidden">Awan</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                activeTab === 'settings' ? 'bg-slate-100 dark:bg-slate-800 text-sky-600' : ''
              }`}
              title="Pengaturan Kop, NIP & Pengingat"
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>

          {/* Quick Actions: Sync Status, Dark Mode */}
          <div className="flex items-center gap-2">
            {/* Cloud Sync Status Pill */}
            <button
              onClick={onManualSync}
              disabled={syncConfig.syncStatus === 'syncing'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                syncConfig.syncStatus === 'syncing'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : syncConfig.syncStatus === 'synced'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title="Klik untuk sinkronisasi instan ke awan"
            >
              {syncConfig.syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                  <span>Sinkron...</span>
                </>
              ) : syncConfig.syncStatus === 'synced' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Awan Terhubung</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Sinkronisasi</span>
                </>
              )}
            </button>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
              aria-label="Ubah tema gelap atau terang"
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
