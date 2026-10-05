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
}) => {
  const [dismissed, setDismissed] = React.useState(false);

  const today = getTodayISODate();
  const todayEntries = entries.filter((e) => e.date === today);
  const pendingToday = todayEntries.filter((e) => e.status === 'belum_tuntas');

  if (dismissed) return null;

  if (todayEntries.length === 0) {
    return (
      <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2.5 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white block text-sm">
              Target Hari Ini Belum Diisi
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              Mulai catat kegiatan Anda untuk hari ini.
            </span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (pendingToday.length > 0) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2.5 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200 block text-sm">
              {pendingToday.length} Target Belum Tuntas Hari Ini
            </span>
            <span className="text-amber-700 dark:text-amber-300/90">
              Ketuk tombol pada kartu untuk mengubah status saat selesai.
            </span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-amber-500 hover:text-amber-700 dark:hover:text-amber-200 rounded-xl cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-2.5 text-xs shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-sm">
            Semua Target Hari Ini Tuntas
          </span>
          <span className="text-emerald-700 dark:text-emerald-300/90">
            Capaian harian lengkap tercatat.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onOpenReport}
          className="min-h-[44px] px-2 font-semibold text-emerald-800 dark:text-emerald-300 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Laporan</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-emerald-400 hover:text-emerald-600 rounded-xl cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
