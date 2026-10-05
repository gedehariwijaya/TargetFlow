import React from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, Sparkles, X } from 'lucide-react';
import { JournalEntry } from '../types/journal';
import { getTodayISODate } from '../utils/dateUtils';

interface NotificationBannerProps {
  entries: JournalEntry[];
  onOpenReport: () => void;
  onOpenSettings: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  entries,
  onOpenReport,
  onOpenSettings,
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  const today = getTodayISODate();
  const todayEntries = entries.filter((e) => e.date === today);
  const pendingToday = todayEntries.filter((e) => e.status === 'belum_tuntas');

  if (dismissed) return null;

  if (todayEntries.length === 0) {
    return (
      <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-sky-500/10 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              Mulai Target Harian Anda Hari Ini
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              Belum ada target yang dicatat untuk hari ini. Masukkan target kegiatan Anda untuk menjaga konsistensi kerja.
            </span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (pendingToday.length > 0) {
    return (
      <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200 block text-sm">
              Ada {pendingToday.length} Target Belum Tuntas Hari Ini
            </span>
            <span className="text-amber-700 dark:text-amber-300/90">
              Periksa dan klik tombol status di tabel untuk mengubah menjadi "Tuntas" saat target terlaksana.
            </span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-sm">
            Kerja Luar Biasa! Semua Target Hari Ini Telah Tuntas
          </span>
          <span className="text-emerald-700 dark:text-emerald-300/90">
            Laporan Anda siap diekspor ke Microsoft Word (.docx) atau dicetak resmi kapan saja.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenReport}
          className="inline-flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-300 hover:underline shrink-0"
        >
          <span>Buka Laporan</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-200 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
