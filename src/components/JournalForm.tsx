import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Sparkles,
  Tag,
} from 'lucide-react';
import { JournalEntry, JournalStatus } from '../types/journal';
import { getTodayISODate, parseDayName, formatDateID } from '../utils/dateUtils';
import { QUICK_TARGET_SUGGESTIONS } from '../constants/defaultData';
import confetti from 'canvas-confetti';

interface JournalFormProps {
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const JournalForm: React.FC<JournalFormProps> = ({ onAddEntry }) => {
  const [target, setTarget] = useState('');
  const [status, setStatus] = useState<JournalStatus>('tuntas');
  const [date, setDate] = useState<string>(getTodayISODate());
  const [category, setCategory] = useState<string>('Pembelajaran');
  const [notes, setNotes] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target.trim()) return;

    const dayName = parseDayName(date) || 'Hari Ini';
    const formattedDate = formatDateID(date, true);

    onAddEntry({
      date,
      dayName,
      formattedDate,
      target: target.trim(),
      status,
      category,
      notes: notes.trim() || undefined,
    });

    if (status === 'tuntas') {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 },
      });
    }

    // Reset target input but keep date for convenience
    setTarget('');
    setNotes('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Isi Jurnal & Target Kegiatan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cukup isi Target/Kegiatan dan pilih status Tuntas / Belum Tuntas
            </p>
          </div>
        </div>

        {/* Quick Suggestion Toggle */}
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showSuggestions ? 'Tutup Saran' : 'Contoh Kegiatan'}</span>
        </button>
      </div>

      {/* Suggestion Chips */}
      {showSuggestions && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            Klik untuk memilih target siap pakai:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TARGET_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTarget(item);
                  setShowSuggestions(false);
                }}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 text-slate-700 dark:text-slate-200 text-left transition-all text-[11px]"
              >
                + {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Hari / Tanggal */}
          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Hari & Tanggal
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white transition-colors"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
              {formatDateID(date)}
            </span>
          </div>

          {/* Keterangan: Tuntas / Belum Tuntas Toggle Buttons */}
          <div className="sm:col-span-7">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Keterangan Capaian
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('tuntas')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  status === 'tuntas'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Tuntas</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('belum_tuntas')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  status === 'belum_tuntas'
                    ? 'bg-amber-600 border-amber-600 text-white shadow-sm shadow-amber-500/20'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Belum Tuntas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Target / Kegiatan Input */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Target / Kegiatan <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
            rows={2}
            placeholder="Contoh: Melaksanakan pembelajaran Fisika Bab Termodinamika di kelas XI MIPA..."
            className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 transition-colors"
          />
        </div>

        {/* Optional Category & Notes */}
        <div>
          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>{showOptionalFields ? '− Sembunyikan Kategori & Catatan' : '+ Tambah Kategori / Catatan Tindak Lanjut'}</span>
          </button>

          {showOptionalFields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Kategori Bidang</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
                >
                  <option value="Pembelajaran">Pembelajaran (KBM)</option>
                  <option value="Administrasi">Administrasi Guru / Modul</option>
                  <option value="Bimbingan Siswa">Bimbingan Siswa / Remedial</option>
                  <option value="Tugas Tambahan">Tugas Tambahan / Rapat</option>
                  <option value="Pengembangan Diri">Pengembangan Diri / Pelatihan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Tambahan / Kendala (Opsional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Dilanjutkan pertemuan Kamis depan"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm shadow-sky-500/20 transition-all hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Simpan ke Jurnal Harian</span>
          </button>
        </div>
      </form>
    </div>
  );
};
