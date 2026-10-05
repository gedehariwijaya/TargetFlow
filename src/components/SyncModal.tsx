import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownUp,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Key,
  Laptop,
  Lock,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  X,
} from 'lucide-react';
import { SyncConfig } from '../types/journal';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncConfig: SyncConfig;
  onUpdateSyncConfig: (updated: Partial<SyncConfig>) => void;
  onTriggerSyncNow: () => Promise<void>;
  onPullFromCloudNow: (customKey: string, customPass: string) => Promise<void>;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncConfig,
  onUpdateSyncConfig,
  onTriggerSyncNow,
  onPullFromCloudNow,
}) => {
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form for connecting existing device
  const [connectSyncKey, setConnectSyncKey] = useState('');
  const [connectPassphrase, setConnectPassphrase] = useState('');
  const [showConnectForm, setShowConnectForm] = useState(false);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(syncConfig.syncKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyPass = () => {
    navigator.clipboard.writeText(syncConfig.passphrase);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleManualSync = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSyncing(true);
    try {
      await onTriggerSyncNow();
      setSuccessMsg('Berhasil mengunggah & menyinkronkan data terenkripsi ke awan!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectSyncKey.trim() || !connectPassphrase.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSyncing(true);

    try {
      await onPullFromCloudNow(connectSyncKey.trim(), connectPassphrase.trim());
      setSuccessMsg('Berhasil menghubungkan dan memuat jurnal terenkripsi dari awan!');
      setShowConnectForm(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sinkronisasi Awan & Multi-Perangkat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data jurnal tersimpan dengan enkripsi ujung-ke-ujung (AES-256)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Encryption Badge Explainer */}
          <div className="p-3.5 bg-sky-50/80 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-800/80 flex items-start gap-3 text-xs text-sky-900 dark:text-sky-200">
            <Lock className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Keamanan Tanpa Kompromi (Zero-Knowledge)</span>
              Target kegiatan dan catatan Anda dienkripsi di peramban Anda menggunakan sandi rahasia sebelum diunggah ke awan. Server hanya menyimpan teks sandi acak dan tidak dapat melihat isinya.
            </div>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Device Sync Credentials */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Kredensial Sinkronisasi Perangkat Anda
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Terakhir sinkron: {syncConfig.lastSyncedAt ? new Date(syncConfig.lastSyncedAt).toLocaleTimeString('id-ID') : 'Belum'}
              </span>
            </div>

            {/* Sync ID */}
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                ID Sinkronisasi (Sync ID):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={syncConfig.syncKey}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm font-semibold text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-medium flex items-center gap-1 shrink-0 text-slate-800 dark:text-slate-100"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey ? 'Disalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Passphrase / Kunci Sandi */}
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Kunci Sandi Enkripsi (Passphrase):
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={syncConfig.passphrase}
                    onChange={(e) => onUpdateSyncConfig({ passphrase: e.target.value })}
                    className="w-full px-3 py-2 pr-9 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPass}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-medium flex items-center gap-1 shrink-0 text-slate-800 dark:text-slate-100"
                >
                  {copiedPass ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPass ? 'Disalin' : 'Salin'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan kunci sandi ini di HP atau laptop kedua Anda untuk membuka dekripsi jurnal.
              </p>
            </div>

            {/* Auto-Sync Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${syncConfig.autoSync ? 'text-emerald-500 animate-spin-slow' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Sinkronisasi Otomatis
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Otomatis perbarui awan setiap Anda menambah atau mengubah target
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncConfig.autoSync}
                  onChange={(e) => onUpdateSyncConfig({ autoSync: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
          </div>

          {/* Sync Trigger Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm shadow-sm transition-all cursor-pointer"
            >
              <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>

          {/* How to access on other devices */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span>Cara Mengakses di Smartphone atau Laptop Lain:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed">
              <li>Buka TargetFlow di peramban HP atau perangkat kedua Anda.</li>
              <li>Klik tab <strong>"Perangkat & Awan"</strong>.</li>
              <li>Pilih <strong>"Hubungkan Perangkat Lain"</strong> di bawah.</li>
              <li>Masukkan <strong>Sync ID</strong> dan <strong>Kunci Sandi</strong> yang tertera di atas.</li>
              <li>Semua target & jurnal Anda akan otomatis terisi dan selalu sinkron!</li>
            </ol>
          </div>

          {/* Switch / Connect Another Device Section */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowConnectForm(!showConnectForm)}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>
                {showConnectForm
                  ? 'Batal hubungkan perangkat'
                  : 'Ingin mengambil data dari perangkat lain? Klik di sini'}
              </span>
            </button>

            {showConnectForm && (
              <form onSubmit={handleConnectDevice} className="mt-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Masukkan Kredensial dari Perangkat Pertama:
                </span>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Sync ID dari HP/Laptop Pertama:
                  </label>
                  <input
                    type="text"
                    required
                    value={connectSyncKey}
                    onChange={(e) => setConnectSyncKey(e.target.value)}
                    placeholder="Contoh: TF-7892-BALI"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Kunci Sandi Enkripsi:
                  </label>
                  <input
                    type="password"
                    required
                    value={connectPassphrase}
                    onChange={(e) => setConnectPassphrase(e.target.value)}
                    placeholder="Masukkan sandi rahasia"
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{isSyncing ? 'Mendekripsi...' : 'Hubungkan & Ambil Data'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
