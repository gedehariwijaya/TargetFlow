import React, { useState } from 'react';
import {
  Download,
  Printer,
  Settings,
  Calendar,
  FileCheck,
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { JournalEntry, SchoolSettings } from '../types/journal';
import { OfficialKopSuratSmansaka } from './OfficialLogos';
import { generateWordDocument, downloadBlob } from '../services/wordExport';

interface OfficialReportViewProps {
  entries: JournalEntry[];
  settings: SchoolSettings;
  onOpenSettings: () => void;
}

export const OfficialReportView: React.FC<OfficialReportViewProps> = ({
  entries,
  settings,
  onOpenSettings,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'october' | 'today'>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Filter entries for the report
  const displayEntries = React.useMemo(() => {
    if (filterPeriod === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return entries.filter((e) => e.date === today);
    }
    if (filterPeriod === 'october') {
      return entries.filter((e) => e.date.startsWith('2026-10'));
    }
    return entries;
  }, [entries, filterPeriod]);

  // Export to Word (.docx)
  const handleExportWord = async () => {
    try {
      setIsExporting(true);
      const periodLabel =
        filterPeriod === 'october'
          ? 'Oktober 2026'
          : filterPeriod === 'today'
          ? 'Harian'
          : undefined;

      const blob = await generateWordDocument(displayEntries, settings, periodLabel);
      const safeSchoolName = settings.schoolName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `TargetFlow_Jurnal_${safeSchoolName}_${new Date().toISOString().slice(0, 10)}.docx`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Word export error:', err);
      alert('Terjadi kesalahan saat membuat file Word: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExporting(false);
    }
  };

  // Direct Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Export Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Format Laporan Resmi Sesuai Standar Sekolah</span>
          </h2>
        </div>

        {/* Buttons (touch-friendly on mobile) */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter Period */}
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as any)}
            className="min-h-[44px] flex-1 sm:flex-none text-xs px-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">Semua Tanggal ({entries.length} data)</option>
            <option value="october">Bulan Oktober 2026</option>
            <option value="today">Hari Ini Saja</option>
          </select>

          {/* Edit Kop & Signer */}
          <button
            onClick={onOpenSettings}
            className="min-h-[44px] px-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Ubah Kop Surat, Nama Kepala Sekolah, NIP"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Kop / NIP</span>
          </button>

          {/* Cetak / PDF */}
          <button
            onClick={handlePrint}
            className="min-h-[44px] px-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Cetak langsung atau simpan sebagai PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>

          {/* Primary Word (.docx) Export Button */}
          <button
            onClick={handleExportWord}
            disabled={isExporting}
            className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer"
            title="Unduh laporan dalam format Microsoft Word resmi (.docx)"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Membuat Word...' : 'Export Word (.docx)'}</span>
          </button>
        </div>
      </div>

      {/* Official Document Sheet Preview (Contained in horizontal scroll area for mobile) */}
      <div className="overflow-x-auto w-full pb-4">
        <div className="min-w-[650px] sm:min-w-0 bg-white text-black p-6 sm:p-12 rounded-2xl shadow-md border border-slate-300 max-w-4xl mx-auto font-serif print:p-0 print:border-none print:shadow-none print:max-w-none print:min-w-0">
        {/* 1. KOP SURAT RESMI (Matched exactly to kop smansaka baru) */}
        <OfficialKopSuratSmansaka />

        {/* 2. Format Title / Note (matching "*Contoh format jurnal") */}
        <div className="mb-3">
          <p className="text-xs sm:text-sm italic font-serif text-black font-medium">
            {settings.reportNote || '*Contoh format jurnal'}
          </p>
        </div>

        {/* 3. Official Journal Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse border border-black text-xs sm:text-sm font-serif">
            <thead>
              <tr className="border border-black bg-slate-50/50">
                <th className="border border-black py-2 px-2 w-12 text-center font-bold">
                  No
                </th>
                <th className="border border-black py-2 px-3 w-40 text-center font-bold">
                  Hari/Tgl
                </th>
                <th className="border border-black py-2 px-4 text-center font-bold">
                  Target/Kegiatan
                </th>
                <th className="border border-black py-2 px-3 w-44 text-center font-bold">
                  Keterangan
                  <span className="block font-normal text-xs">tuntas/belum tuntas</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayEntries.length === 0 ? (
                <>
                  <tr className="border border-black h-12">
                    <td className="border border-black text-center">1</td>
                    <td className="border border-black"></td>
                    <td className="border border-black"></td>
                    <td className="border border-black"></td>
                  </tr>
                  <tr className="border border-black h-12">
                    <td className="border border-black text-center">2</td>
                    <td className="border border-black"></td>
                    <td className="border border-black"></td>
                    <td className="border border-black"></td>
                  </tr>
                  <tr className="border border-black h-12">
                    <td className="border border-black text-center">3</td>
                    <td className="border border-black"></td>
                    <td className="border border-black"></td>
                    <td className="border border-black"></td>
                  </tr>
                </>
              ) : (
                displayEntries.map((item, index) => {
                  const statusLabel = item.status === 'tuntas' ? 'tuntas' : 'belum tuntas';

                  return (
                    <tr key={item.id} className="border border-black min-h-[3rem]">
                      {/* No */}
                      <td className="border border-black py-2 px-2 text-center align-middle font-medium">
                        {index + 1}
                      </td>

                      {/* Hari/Tgl */}
                      <td className="border border-black py-2 px-3 align-middle text-left whitespace-nowrap">
                        {item.formattedDate || `${item.dayName}, ${item.date}`}
                      </td>

                      {/* Target/Kegiatan */}
                      <td className="border border-black py-2 px-4 align-middle text-left leading-relaxed">
                        <span>{item.target}</span>
                        {item.notes && (
                          <span className="block text-[11px] text-slate-600 italic mt-0.5">
                            (Ket: {item.notes})
                          </span>
                        )}
                      </td>

                      {/* Keterangan: tuntas / belum tuntas */}
                      <td className="border border-black py-2 px-3 text-center align-middle">
                        <span
                          className={`font-semibold capitalize ${
                            item.status === 'tuntas'
                              ? 'text-black'
                              : 'text-black'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* "dst" bottom row indicator if matching image */}
              {displayEntries.length > 0 && (
                <tr className="border border-black">
                  <td className="border border-black py-1.5 px-2 text-center italic text-xs">
                    dst
                  </td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                  <td className="border border-black"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Signature Section */}
        <div className="flex justify-end pt-6">
          <div className="w-72 text-left space-y-1">
            <p className="text-xs sm:text-sm text-black">
              {settings.place}, {settings.signDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs sm:text-sm text-black underline">
              {settings.signTitle1}
            </p>
            <p className="text-xs sm:text-sm text-black font-medium">
              {settings.signTitle2}
            </p>

            {/* Ruang Tanda Tangan & Cap Sekolah */}
            <div className="h-20 sm:h-24"></div>

            {/* Principal Name & NIP */}
            <div className="pt-1">
              <p className="text-sm font-bold text-black font-serif underline">
                {settings.principalName}
              </p>
              <p className="text-xs text-black font-serif">
                NIP. {settings.principalNip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
