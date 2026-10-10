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
      notes: notes.trim() || '',
    });

    if (status === 'tuntas') {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 },
      });
    }

    setTarget('');
    setNotes('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs transition-colors">
      {/* Form Header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <span>Isi Target Kegiatan</span>
        </h2>

        {/* Quick Suggestion Button */}
        <button
          type="button"
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="min-h-[44px] px-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 hover:bg-sky-100 rounded-xl transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showSuggestions ? 'Tutup' : 'Contoh'}</span>
        </button>
      </div>

      {/* Suggestion Chips */}
      {showSuggestions && (
        <div className="mb-3.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TARGET_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTarget(item);
                  setShowSuggestions(false);
                }}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-400 text-slate-700 dark:text-slate-200 text-left transition-all text-xs"
              >
                + {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {/* Hari & Tanggal (Full width, stacked on mobile) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Hari & Tanggal
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full h-12 pl-10 pr-3 text-base sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
            />
            <Calendar className="w-5 h-5 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Target / Kegiatan Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Uraian Target / Kegiatan <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
            rows={2}
            placeholder="Masukkan kegiatan target Anda..."
            className="w-full p-3.5 text-base sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Status Capaian Toggle: Big touch-friendly buttons >= 44px */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Status Capaian
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus('tuntas')}
              className={`min-h-[48px] flex items-center justify-center gap-2 px-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                status === 'tuntas'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tuntas</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('belum_tuntas')}
              className={`min-h-[48px] flex items-center justify-center gap-2 px-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                status === 'belum_tuntas'
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Belum Tuntas</span>
            </button>
          </div>
        </div>

        {/* Optional Category & Notes */}
        <div>
          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="min-h-[44px] text-xs font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1 cursor-pointer"
          >
            <span>{showOptionalFields ? '− Tutup Kategori / Catatan' : '+ Tambah Kategori / Catatan (Opsional)'}</span>
          </button>

          {showOptionalFields && (
            <div className="flex flex-col gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Kategori Kegiatan
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 px-3 text-base sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  <option value="Pembelajaran">Pembelajaran (KBM)</option>
                  <option value="Administrasi">Administrasi Guru / Modul</option>
                  <option value="Bimbingan Siswa">Bimbingan Siswa / Remedial</option>
                  <option value="Tugas Tambahan">Tugas Tambahan / Rapat</option>
                  <option value="Pengembangan Diri">Pengembangan Diri / Pelatihan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Catatan Kendala / Tindak Lanjut
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Dilanjutkan pertemuan berikutnya"
                  className="w-full h-12 px-3 text-base sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Big Touch-Friendly Submit Button */}
        <button
          type="submit"
          className="w-full h-12 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-sky-500/20 active:scale-[0.99] transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Simpan ke Jurnal Harian</span>
        </button>
      </form>
    </div>
  );
};
