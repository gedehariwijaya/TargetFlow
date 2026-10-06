import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Building,
  Check,
  FileSignature,
  Save,
  Volume2,
  X,
  User,
  Smartphone,
} from 'lucide-react';
import { NotificationSettings, SchoolSettings } from '../types/journal';
import {
  playReminderSound,
  requestNotificationPermission,
  sendBrowserNotification,
} from '../services/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SchoolSettings;
  onSaveSettings: (settings: SchoolSettings) => void;
  notificationSettings: NotificationSettings;
  onSaveNotificationSettings: (notif: NotificationSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  notificationSettings,
  onSaveNotificationSettings,
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [notifData, setNotifData] = useState<NotificationSettings>({ ...notificationSettings });
  const [activeSubTab, setActiveSubTab] = useState<'reminder' | 'kop' | 'signer'>('reminder');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  if (!isOpen) return null;

  const handleChange = (field: keyof SchoolSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onSaveNotificationSettings(notifData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      sendBrowserNotification('TargetFlow Aktif', {
        body: 'Pengingat harian berhasil diaktifkan!',
      });
      playReminderSound();
    }
  };

  const handleTestSoundAndNotification = () => {
    playReminderSound();
    if (permissionState === 'granted') {
      sendBrowserNotification('Pengingat Target Harian TargetFlow', {
        body: 'Jangan lupa periksa dan tuntaskan target harian Anda hari ini!',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pengaturan TargetFlow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pengingat harian, kop surat sekolah, dan data penandatangan resmi
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

        {/* Sub Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-2 bg-slate-50/50 dark:bg-slate-800/30 gap-2">
          <button
            onClick={() => setActiveSubTab('reminder')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeSubTab === 'reminder'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Pengingat Harian</span>
          </button>

          <button
            onClick={() => setActiveSubTab('kop')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeSubTab === 'kop'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Kop Surat Sekolah</span>
          </button>

          <button
            onClick={() => setActiveSubTab('signer')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeSubTab === 'signer'
                ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>Penandatangan & NIP</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm flex-1">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Pengaturan berhasil disimpan!</span>
            </div>
          )}

          {/* TAB 1: PENGINGAT HARIAN */}
          {activeSubTab === 'reminder' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BellRing className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block text-sm">
                        Notifikasi Pengingat Target Harian
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Bantu Anda konsisten mengisi dan menuntaskan target setiap hari
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifData.enabled}
                      onChange={(e) => setNotifData({ ...notifData, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                  </label>
                </div>
              </div>

              {/* Reminder Time Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Waktu Pengingat Setiap Hari
                  </label>
                  <input
                    type="time"
                    value={notifData.time}
                    onChange={(e) => setNotifData({ ...notifData, time: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Disarankan menjelang akhir jam kerja sekolah (misal 15:30 atau 16:00).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Izin Notifikasi Peramban
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {permissionState === 'granted' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                        <Check className="w-3.5 h-3.5" />
                        Izin Aktif
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestPermission}
                        className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-medium transition-colors"
                      >
                        Minta Izin Notifikasi
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleTestSoundAndNotification}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Uji Suara & Notif</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KOP SURAT SEKOLAH */}
          {activeSubTab === 'kop' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pemerintah Daerah / Provinsi
                </label>
                <input
                  type="text"
                  value={formData.provinceName}
                  onChange={(e) => handleChange('provinceName', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Dinas / Instansi
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => handleChange('serviceName', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nama Sekolah / Unit Kerja
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Lengkap
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Website / Laman Resmi
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    E-Mail Resmi
                  </label>
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NPSN
                  </label>
                  <input
                    type="text"
                    value={formData.npsn}
                    onChange={(e) => handleChange('npsn', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NSS
                  </label>
                  <input
                    type="text"
                    value={formData.nss}
                    onChange={(e) => handleChange('nss', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Telp
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PENANDATANGAN & NIP */}
          {activeSubTab === 'signer' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Kepala Sekolah / Pejabat Pengesah (Sesuai Gambar Dokumen)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Kota / Tempat Surat
                    </label>
                    <input
                      type="text"
                      value={formData.place}
                      onChange={(e) => handleChange('place', e.target.value)}
                      placeholder="Tejakula"
                      className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Tanggal Tanda Tangan
                    </label>
                    <input
                      type="text"
                      value={formData.signDate}
                      onChange={(e) => handleChange('signDate', e.target.value)}
                      placeholder="1 Oktober 2026"
                      className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Kepala Sekolah Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    value={formData.principalName}
                    onChange={(e) => handleChange('principalName', e.target.value)}
                    placeholder="Nyoman Sukrada, S.Pd., M.Pd."
                    className="w-full px-3 py-1.5 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={formData.principalNip}
                    onChange={(e) => handleChange('principalNip', e.target.value)}
                    placeholder="19680105 199103 1 020"
                    className="w-full px-3 py-1.5 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Data Guru */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Identitas Guru / Pengguna
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Nama Guru
                    </label>
                    <input
                      type="text"
                      value={formData.teacherName}
                      onChange={(e) => handleChange('teacherName', e.target.value)}
                      placeholder="Gede Wijaya, S.Pd."
                      className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      NIP Guru
                    </label>
                    <input
                      type="text"
                      value={formData.teacherNip}
                      onChange={(e) => handleChange('teacherNip', e.target.value)}
                      placeholder="19860514 201101 1 012"
                      className="w-full px-3 py-1.5 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
