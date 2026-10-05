import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed, hide or show installed badge
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>TargetFlow sudah terpasang sebagai aplikasi di perangkat ini.</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions for browsers where beforeinstallprompt isn't fired yet
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer ${className}`}
          title="Pasang aplikasi TargetFlow di Layar Utama HP / Komputer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install di HP</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {variant === 'card' && (
        <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 rounded-2xl border border-sky-200 dark:border-sky-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                Pasang TargetFlow di Layar Utama HP (Android & iOS)
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                Akses cepat seperti aplikasi native tanpa perlu membuka peramban web setiap saat.
              </span>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Sekarang</span>
          </button>
        </div>
      )}

      {variant === 'banner' && (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 w-full p-2.5 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 rounded-xl border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200 text-xs font-medium transition-colors ${className}`}
        >
          <Smartphone className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="text-left flex-1 font-semibold">
            Install TargetFlow ke Layar Utama HP
          </span>
          <Download className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Guided Modal for iOS Safari / Mobile installation instructions */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-sm shadow-2xl p-6 text-slate-900 dark:text-white animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base">Cara Install di HP</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              TargetFlow dapat langsung dipasang di layar utama smartphone Anda seperti aplikasi Play Store / App Store:
            </p>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 mb-5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  Di peramban HP Anda (Safari / Chrome), ketuk ikon{' '}
                  <strong>Menu (titik tiga)</strong> atau tombol{' '}
                  <strong>Bagikan (Share <Share className="inline w-3 h-3 mx-0.5" />)</strong>.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  Gulir ke bawah dan pilih{' '}
                  <strong className="text-sky-700 dark:text-sky-400">
                    "Tambahkan ke Layar Utama" (Add to Home Screen <PlusSquare className="inline w-3 h-3 mx-0.5" />)
                  </strong>.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-sky-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span className="text-slate-700 dark:text-slate-200">
                  Ketuk <strong>Tambah</strong>. Icon TargetFlow akan langsung muncul di menu HP Anda!
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl text-xs hover:opacity-90 transition-opacity"
            >
              Mengerti, Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
