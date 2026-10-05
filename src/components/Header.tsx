import React from 'react';
import {
  CheckCircle2,
  Cloud,
  FileText,
  Laptop,
  Moon,
  RefreshCw,
  Settings,
  Sun,
  Target,
} from 'lucide-react';
import { SyncConfig } from '../types/journal';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'journal' | 'report' | 'sync' | 'settings';
  setActiveTab: (tab: 'journal' | 'report' | 'sync' | 'settings') => void;
  syncConfig: SyncConfig;
  onManualSync: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  syncConfig,
  onManualSync,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Brand Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans block">
                Target<span className="text-sky-600 dark:text-sky-400">Flow</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Hidden on Mobile, handled by Bottom Nav) */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'journal'
                  ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Jurnal</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Format Laporan</span>
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'sync'
                  ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Perangkat & Awan</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                activeTab === 'settings' ? 'bg-slate-100 dark:bg-slate-800 text-sky-600' : ''
              }`}
              title="Pengaturan Kop, NIP & Pengingat"
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>

          {/* Quick Actions Bar (Touch-friendly minimum 44px targets) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Install PWA Button */}
            <PWAInstallButton variant="header" />

            {/* Cloud Real-Time Indicator */}
            <button
              onClick={onManualSync}
              disabled={syncConfig.syncStatus === 'syncing'}
              className="min-h-[44px] px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Status Sinkronisasi Awan & Perangkat"
            >
              {syncConfig.realtimeStatus === 'connected' ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="hidden sm:inline">Real-Time</span>
                </>
              ) : syncConfig.syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  <span className="hidden sm:inline">Sinkron...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="hidden sm:inline">Awan</span>
                </>
              )}
            </button>

            {/* Theme Toggle (44x44px target) */}
            <button
              onClick={onToggleDarkMode}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Ubah tema gelap atau terang"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
