"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { changeUserPassword } from "@/lib/auth";
import {
  getLocalSettings,
  fetchRemoteSettings,
  persistSettings,
} from "@/lib/services/settingsService";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import ToastNotification, { ToastType } from "@/components/ui/ToastNotification";
import ArabicText from "@/components/ui/ArabicText";
import {
  KeyRound,
  ShieldCheck,
  Bell,
  Volume2,
  ArrowLeft,
  Info,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const { email, role, uid } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preference toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  useEffect(() => {
    // 1. Initial render from L1 localStorage
    const local = getLocalSettings();
    setSoundEnabled(local.soundEnabled);
    setNotificationEnabled(local.notificationEnabled);

    // 2. Sync with remote Firestore if authenticated
    if (uid) {
      fetchRemoteSettings(uid).then((remote) => {
        setSoundEnabled(remote.soundEnabled);
        setNotificationEnabled(remote.notificationEnabled);
      });
    }
  }, [uid]);

  const handleToggleSound = async () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    await persistSettings(uid ?? null, { soundEnabled: nextVal });
  };

  const handleToggleNotification = async () => {
    const nextVal = !notificationEnabled;
    setNotificationEnabled(nextVal);
    await persistSettings(uid ?? null, { notificationEnabled: nextVal });
  };

  // Toast
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(
    null
  );

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changeUserPassword(newPassword);
      if (res.success) {
        setToast({
          message: "Kata sandi berhasil diperbarui!",
          type: "success",
        });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMessage(res.message || "Gagal mengubah kata sandi.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 select-none pb-14">
      {/* Top Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Profil</span>
          </Link>
          <ArabicText text="الأَمَانُ" size="sm" className="text-emerald-900" />
        </div>

        <h1 className="text-2xl font-black text-slate-900">Pengaturan Akun</h1>
        <p className="text-xs text-slate-500 font-medium">
          Kelola keamanan kata sandi dan preferensi aplikasi Sibaq
        </p>
      </div>

      {/* Account Info Pill */}
      <TactileCard className="p-4 bg-emerald-50 border-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800">{email || "Akun Santri"}</p>
            <p className="text-[11px] text-emerald-800 font-bold capitalize">
              Role: {role || "Santri"}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-emerald-200/60 text-emerald-900 rounded-full text-[10px] font-black uppercase tracking-wider">
          Aktif
        </span>
      </TactileCard>

      {/* Change Password Section */}
      <TactileCard className="p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800">
              Ganti Kata Sandi
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              Pastikan kata sandi baru sulit ditebak dan terjaga kerahasiaannya
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="newPassword"
              className="text-xs font-black text-slate-700"
            >
              Kata Sandi Baru
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all pl-9"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="confirmPassword"
              className="text-xs font-black text-slate-700"
            >
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all pl-9"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="pt-2">
            <TactileButton
              fullWidth
              variant="primary"
              size="md"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Kata Sandi"}
            </TactileButton>
          </div>
        </form>
      </TactileCard>

      {/* App Preferences */}
      <TactileCard className="p-5 flex flex-col gap-3">
        <h2 className="text-sm font-black text-slate-800 pb-1 border-b border-slate-100">
          Preferensi Aplikasi
        </h2>

        {/* Efek Suara */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Efek Suara Gamifikasi</p>
              <p className="text-[10px] text-slate-400">
                Suara kuis benar, perolehan bintang, dan animasi tactile
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Toggle Efek Suara"
            onClick={handleToggleSound}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              soundEnabled ? "bg-emerald-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                soundEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Notifikasi Setoran */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">Notifikasi Jadwal</p>
              <p className="text-[10px] text-slate-400">
                Pengingat waktu setoran halaqah harian
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Toggle Notifikasi"
            onClick={handleToggleNotification}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              notificationEnabled ? "bg-emerald-600" : "bg-slate-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                notificationEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </TactileCard>

      {/* App Info Footer */}
      <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium pt-2">
        <Info className="w-3.5 h-3.5" />
        <span>Sibaq TPA Platform • Versi 1.2.0 (Emerald Oasis)</span>
      </div>

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
