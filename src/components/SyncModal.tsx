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
  Mail,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  User,
  Users,
  X,
  Radio,
} from 'lucide-react';
import { SyncConfig } from '../types/journal';
import { PWAInstallButton } from './PWAInstallButton';
import { registerAccount, loginAccount } from '../services/cloudSync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncConfig: SyncConfig;
  onUpdateSyncConfig: (updated: Partial<SyncConfig>) => void;
  onTriggerSyncNow: () => Promise<void>;
  onPullFromCloudNow: (customKey: string, customPass: string) => Promise<void>;
  onAccountLoginSuccess: (email: string, syncId: string, passphrase: string, bundle?: any) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncConfig,
  onUpdateSyncConfig,
  onTriggerSyncNow,
  onPullFromCloudNow,
  onAccountLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'syncKey'>('account');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email & Password Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState(syncConfig.userEmail || 'gedewijaya86@guru.sma.belajar.id');
  const [passwordInput, setPasswordInput] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);

  // Direct Sync ID connection
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
    setIsProcessing(true);
    try {
      await onTriggerSyncNow();
      setSuccessMsg('Berhasil menyinkronkan data terenkripsi ke awan dan perangkat lain!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      if (authMode === 'register') {
        await registerAccount(emailInput.trim(), passwordInput.trim(), syncConfig.syncKey);
        // Also update local passphrase to match account password for zero-knowledge decryption
        onUpdateSyncConfig({
          userEmail: emailInput.trim().toLowerCase(),
          passphrase: passwordInput.trim(),
        });
        setSuccessMsg(`Akun ${emailInput.trim()} berhasil didaftarkan dan terhubung dengan Sync ID ini!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        const result = await loginAccount(emailInput.trim(), passwordInput.trim());
        onAccountLoginSuccess(result.email, result.syncId, passwordInput.trim(), result.bundle);
        setSuccessMsg(`Berhasil masuk sebagai ${result.email}! Semua data otomatis tersinkronisasi.`);
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConnectBySyncKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectSyncKey.trim() || !connectPassphrase.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      await onPullFromCloudNow(connectSyncKey.trim(), connectPassphrase.trim());
      setSuccessMsg('Berhasil menghubungkan dan memuat jurnal terenkripsi dari awan!');
      setShowConnectForm(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
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
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Real-Time Cloud Synchronization
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  WebSocket Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pembaruan instan di HP, laptop, dan tablet dengan enkripsi AES-256
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Akun Pengguna vs Kunci Sync ID */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 px-5 pt-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-1.5 px-3 py-2 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Sistem Akun (Email & Password)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('syncKey')}
            className={`flex items-center gap-1.5 px-3 py-2 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'syncKey'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Kunci Sync ID & Sandi</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {/* Real-time Presence & Connected Devices Indicator */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-sky-50 dark:from-emerald-950/30 dark:to-sky-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  Status Sinkronisasi Real-Time
                </span>
                <span className="text-slate-600 dark:text-slate-300">
                  {syncConfig.connectedDevices && syncConfig.connectedDevices > 1
                    ? `${syncConfig.connectedDevices} perangkat sedang aktif bersamaan (Real-time live)`
                    : '1 perangkat aktif — buka di HP/tablet untuk melihat perubahan instan'}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg text-[11px]">
              {syncConfig.realtimeStatus === 'connected' ? 'Terhubung' : 'Menghubungkan...'}
            </span>
          </div>

          {/* Messages */}
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

          {/* TAB 1: SISTEM AKUN (Email & Password) */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {syncConfig.userEmail ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Masuk sebagai: {syncConfig.userEmail}
                      </span>
                    ) : (
                      'Masuk / Hubungkan dengan Email & Password'
                    )}
                  </span>
                  {!syncConfig.userEmail && (
                    <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className={`px-2 py-0.5 rounded-md font-medium ${
                          authMode === 'login'
                            ? 'bg-white dark:bg-slate-900 text-sky-600 font-bold shadow-xs'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className={`px-2 py-0.5 rounded-md font-medium ${
                          authMode === 'register'
                            ? 'bg-white dark:bg-slate-900 text-sky-600 font-bold shadow-xs'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Daftar Baru
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Alamat Email (misal akun @belajar.id atau email pribadi):
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="nama@guru.sma.belajar.id"
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Kata Sandi (Password Akun & Kunci Enkripsi):
                    </label>
                    <div className="relative">
                      <input
                        type={showAuthPassword ? 'text' : 'password'}
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Masukkan password rahasia Anda"
                        className="w-full pl-9 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowAuthPassword(!showAuthPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                      Kata sandi Anda digunakan langsung untuk mendekripsi jurnal di sisi klien (Zero-Knowledge).
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span>
                      {isProcessing
                        ? 'Memproses...'
                        : authMode === 'login'
                        ? 'Masuk & Sinkronkan Perangkat Ini'
                        : 'Daftarkan Akun & Tautkan Data'}
                    </span>
                  </button>
                </form>
              </div>

              {/* Instructions */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-100 block">
                  💡 Kemudahan Sinkronisasi Antar Perangkat:
                </span>
                <p>
                  Setelah mendaftar, buka <strong>TargetFlow</strong> di smartphone atau laptop lain, lalu cukup lakukan <strong>Login dengan Email & Password</strong> yang sama. Seluruh target dan jurnal Anda otomatis tersinkronisasi dan langsung terbarui tanpa refresh manual!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: KUNCI SYNC ID & PASSPHRASE */}
          {activeTab === 'syncKey' && (
            <div className="space-y-4">
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Kredensial Sync Key Perangkat
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Terakhir: {syncConfig.lastSyncedAt ? new Date(syncConfig.lastSyncedAt).toLocaleTimeString('id-ID') : 'Belum'}
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
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-medium flex items-center gap-1 shrink-0 text-slate-800 dark:text-slate-100 cursor-pointer"
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
                      className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl text-xs font-medium flex items-center gap-1 shrink-0 text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      {copiedPass ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPass ? 'Disalin' : 'Salin'}</span>
                    </button>
                  </div>
                </div>

                {/* Auto-Sync Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${syncConfig.autoSync ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        Sinkronisasi Otomatis
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Otomatis kirim update real-time saat target ditambah/diubah/dihapus
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
              <button
                onClick={handleManualSync}
                disabled={isProcessing}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm shadow-sm transition-all cursor-pointer"
              >
                <UploadCloud className={`w-4 h-4 ${isProcessing ? 'animate-bounce' : ''}`} />
                <span>{isProcessing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
              </button>

              {/* Switch / Connect Another Device Section */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectForm(!showConnectForm)}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowDownUp className="w-3.5 h-3.5" />
                  <span>
                    {showConnectForm
                      ? 'Batal hubungkan perangkat'
                      : 'Ingin memasukkan Sync ID dari HP lain? Klik di sini'}
                  </span>
                </button>

                {showConnectForm && (
                  <form onSubmit={handleConnectBySyncKey} className="mt-3 p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Masukkan Kredensial dari HP/Laptop Pertama:
                    </span>
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Sync ID dari Perangkat Pertama:
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
                        Kunci Sandi Enkripsi (Passphrase):
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
                      disabled={isProcessing}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isProcessing ? 'Mendekripsi...' : 'Hubungkan & Ambil Data'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* In-App Mobile Install Card */}
          <PWAInstallButton variant="card" />
        </div>
      </div>
    </div>
  );
};
