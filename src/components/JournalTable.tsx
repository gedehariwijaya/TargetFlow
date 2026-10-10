import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Search,
  Trash2,
  Check,
  X,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { JournalEntry, JournalStatus } from '../types/journal';
import confetti from 'canvas-confetti';

interface JournalTableProps {
  entries: JournalEntry[];
  onToggleStatus: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, updated: Partial<JournalEntry>) => void;
  onOpenReportView: () => void;
}

export const JournalTable: React.FC<JournalTableProps> = ({
  entries,
  onToggleStatus,
  onDeleteEntry,
  onUpdateEntry,
  onOpenReportView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'tuntas' | 'belum_tuntas'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTargetText, setEditTargetText] = useState('');
  const [editNotesText, setEditNotesText] = useState('');

  // Metrics
  const totalCount = entries.length;
  const tuntasCount = entries.filter((e) => e.status === 'tuntas').length;
  const belumTuntasCount = totalCount - tuntasCount;
  const percentage = totalCount > 0 ? Math.round((tuntasCount / totalCount) * 100) : 0;

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        entry.formattedDate.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || entry.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [entries, searchQuery, statusFilter]);

  const handleStartEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditTargetText(entry.target);
    setEditNotesText(entry.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editTargetText.trim()) return;
    onUpdateEntry(id, {
      target: editTargetText.trim(),
      notes: editNotesText.trim() || '',
    });
    setEditingId(null);
  };

  const handleStatusClick = (entry: JournalEntry) => {
    onToggleStatus(entry.id);
    if (entry.status === 'belum_tuntas') {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Metric Stats Cards (Compact 2x2 grid for mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Target */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Total Target</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-400">kegiatan</span>
          </div>
        </div>

        {/* Tuntas */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 block">Tuntas</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {tuntasCount}
            </span>
            <span className="text-[11px] text-emerald-600/80">selesai</span>
          </div>
        </div>

        {/* Belum Tuntas */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 block">Belum Tuntas</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {belumTuntasCount}
            </span>
            <span className="text-[11px] text-amber-600/80">proses</span>
          </div>
        </div>

        {/* Capaian */}
        <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-600 dark:text-sky-400">Capaian</span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 tabular-nums">{percentage}%</span>
          </div>
          <div className="mt-2.5">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Touch-friendly stacked on mobile) */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari target kegiatan..."
            className="w-full h-11 pl-10 pr-3 text-base sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
          />
        </div>

        {/* Status Filters (min 44px height for mobile fingers) */}
        <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center">
          <button
            onClick={() => setStatusFilter('all')}
            className={`min-h-[44px] px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Semua ({totalCount})
          </button>

          <button
            onClick={() => setStatusFilter('tuntas')}
            className={`min-h-[44px] px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'tuntas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            Tuntas ({tuntasCount})
          </button>

          <button
            onClick={() => setStatusFilter('belum_tuntas')}
            className={`min-h-[44px] px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'belum_tuntas'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
            }`}
          >
            Belum ({belumTuntasCount})
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE CARD VIEW (Active on mobile screens < 768px)          */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400 stroke-1" />
            <p className="text-sm font-semibold">Belum ada target</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Tidak ada yang cocok dengan pencarian.' : 'Isi formulir di atas untuk memulai.'}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry, index) => {
            const isEditing = editingId === entry.id;

            return (
              <div
                key={entry.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3"
              >
                {/* Card Header: Date & Action Triggers */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {entry.dayName}, {entry.formattedDate}
                    </span>
                    {entry.category && (
                      <>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-500 dark:text-slate-400">{entry.category}</span>
                      </>
                    )}
                  </div>

                  {/* Actions (44x44px touch targets) */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(entry)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-sky-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Edit target"
                      aria-label="Edit kegiatan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                      title="Hapus baris"
                      aria-label="Hapus kegiatan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Body: Target & Notes */}
                {isEditing ? (
                  <div className="space-y-2.5 pt-1">
                    <textarea
                      value={editTargetText}
                      onChange={(e) => setEditTargetText(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 text-base bg-slate-50 dark:bg-slate-800 border border-sky-400 rounded-xl focus:outline-hidden"
                    />
                    <input
                      type="text"
                      value={editNotesText}
                      onChange={(e) => setEditNotesText(e.target.value)}
                      placeholder="Catatan kendala / tindak lanjut"
                      className="w-full h-11 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleSaveEdit(entry.id)}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1 bg-sky-600 text-white rounded-xl text-xs font-bold"
                      >
                        <Check className="w-4 h-4" /> Simpan
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                      >
                        <X className="w-4 h-4" /> Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-slate-900 dark:text-white font-medium text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                      {entry.target}
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border-l-2 border-sky-500">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Card Footer: Full-Width Touch Status Toggle (>= 44px) */}
                <button
                  type="button"
                  onClick={() => handleStatusClick(entry)}
                  className={`w-full min-h-[48px] rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-wide transition-all shadow-xs cursor-pointer ${
                    entry.status === 'tuntas'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }`}
                >
                  {entry.status === 'tuntas' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tuntas</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Belum Tuntas (Ketuk untuk selesaikan)</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP TABLE VIEW (Shown on desktop & wide tablets >= 768px)  */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs">
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 w-40">Hari / Tgl</th>
                <th className="py-3 px-4">Target / Kegiatan</th>
                <th className="py-3 px-4 w-40 text-center">Keterangan</th>
                <th className="py-3 px-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400 stroke-1" />
                    <p className="text-sm font-medium">Belum ada jurnal kegiatan</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry, index) => {
                  const isEditing = editingId === entry.id;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3 px-3 text-center text-xs font-mono text-slate-400 font-medium align-top">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4 align-top">
                        <span className="font-semibold text-slate-900 dark:text-white block text-xs sm:text-sm">
                          {entry.dayName}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {entry.formattedDate}
                        </span>
                        {entry.category && (
                          <span className="block mt-0.5 text-[11px] text-slate-400">
                            {entry.category}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 align-top">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editTargetText}
                              onChange={(e) => setEditTargetText(e.target.value)}
                              rows={2}
                              className="w-full p-2 text-sm bg-white dark:bg-slate-800 border border-sky-400 rounded-lg focus:outline-hidden"
                            />
                            <input
                              type="text"
                              value={editNotesText}
                              onChange={(e) => setEditNotesText(e.target.value)}
                              placeholder="Catatan kendala / tindak lanjut"
                              className="w-full p-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleSaveEdit(entry.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-600 text-white rounded-md text-xs font-medium"
                              >
                                <Check className="w-3.5 h-3.5" /> Simpan
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium"
                              >
                                <X className="w-3.5 h-3.5" /> Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-slate-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">
                              {entry.target}
                            </p>
                            {entry.notes && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-lg border-l-2 border-sky-400">
                                {entry.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center align-top">
                        <button
                          type="button"
                          onClick={() => handleStatusClick(entry)}
                          className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-xs ${
                            entry.status === 'tuntas'
                              ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/80 dark:hover:bg-amber-900/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          }`}
                        >
                          {entry.status === 'tuntas' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>tuntas</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>belum tuntas</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3 text-center align-top">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleStartEdit(entry)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit target"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEntry(entry.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus baris"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
