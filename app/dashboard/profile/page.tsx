"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import GoldBadge from "@/components/ui/GoldBadge";
import ArabicText from "@/components/ui/ArabicText";
import AvatarUploadModal from "@/components/features/AvatarUploadModal";
import {
  BookOpen,
  Gift,
  LogOut,
  Award,
  User,
  Sparkles,
  Camera,
  Settings,
  History,
  Coins,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import Link from "next/link";
import { logoutUser } from "@/lib/auth";
import { getSantriSetoranLogs } from "@/lib/services/halaqahService";
import { getUserTransactions } from "@/lib/services/coinService";
import { SetoranLog, CoinTransaction } from "@/types/schema";

export default function ProfilePage() {
  const { uid, username, email, avatarURL, totalPoint, completedCourse, role, setUid } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [optimisticAvatar, setOptimisticAvatar] = useState<string | null>(null);
  const [historyTab, setHistoryTab] = useState<"setoran" | "coins">("setoran");
  const [setoranLogs, setSetoranLogs] = useState<SetoranLog[]>([]);
  const [coinTransactions, setCoinTransactions] = useState<CoinTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!uid) {
        setLoadingHistory(false);
        return;
      }
      setLoadingHistory(true);
      try {
        const [logs, txs] = await Promise.all([
          getSantriSetoranLogs(uid, 10),
          getUserTransactions(uid, 10),
        ]);
        if (isMounted) {
          setSetoranLogs(logs);
          setCoinTransactions(txs);
        }
      } catch (err) {
        console.error("Error loading user history:", err);
      } finally {
        if (isMounted) {
          setLoadingHistory(false);
        }
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [uid]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUid("");
      router.push("/auth");
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const isUstadz = role === "ustadz" || role === "ustaz" || role === "admin";
  const currentAvatar = optimisticAvatar || avatarURL || "/assets/profile_picture_placeholder.png";

  return (
    <div className="flex flex-col w-full gap-6 select-none pb-12">
      {/* Profile Card Banner */}
      <TactileCard className="p-6 bg-emerald-900 text-white relative overflow-hidden border border-emerald-800 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <ArabicText text="بَارَكَ اللَّهُ فِيكَ" size="sm" className="text-emerald-200" />
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-700/80 text-emerald-100 border border-emerald-600">
            {isUstadz ? "Ustadz Pembimbing" : "Santri Teladan"}
          </span>
        </div>

        <div className="flex items-center gap-4 z-10">
          <div
            onClick={() => setIsUploadModalOpen(true)}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-1 bg-white/20 backdrop-blur-xs relative shrink-0 cursor-pointer group transition-transform hover:scale-105 active:scale-95"
            title="Klik untuk ganti foto profil"
            role="button"
            aria-label="Ubah foto profil"
            data-testid="avatar-edit-button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsUploadModalOpen(true);
              }
            }}
          >
            <Image
              src={currentAvatar}
              alt="Avatar"
              fill
              className="rounded-full object-cover border-2 border-white group-hover:brightness-95 transition-all"
            />
            <div
              className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full shadow-md border-2 border-white group-hover:bg-emerald-500 transition-colors"
              title="Ganti Foto"
            >
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <h1 className="text-xl sm:text-2xl font-black truncate">
              {username || "Santri Hebat"}
            </h1>
            <p className="text-emerald-200 text-xs font-medium truncate">{email}</p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-emerald-700/60">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-emerald-300">
              Koin Berkah
            </span>
            <span className="text-lg font-black text-amber-300">
              {totalPoint || 0} 🪙
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-emerald-300">
              Modul Selesai
            </span>
            <span className="text-lg font-black text-white">
              {completedCourse?.length || 0} Materi ⭐
            </span>
          </div>
        </div>
      </TactileCard>

      {/* Activity & History Section */}
      <TactileCard className="p-5 flex flex-col gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center justify-between border-b border-[#F3E8D6] pb-3" role="tablist">
          <div className="flex gap-2">
            <button
              role="tab"
              aria-selected={historyTab === "setoran"}
              onClick={() => setHistoryTab("setoran")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                historyTab === "setoran"
                  ? "bg-emerald-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Riwayat Setoran</span>
            </button>
            <button
              role="tab"
              aria-selected={historyTab === "coins"}
              onClick={() => setHistoryTab("coins")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                historyTab === "coins"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Riwayat Koin</span>
            </button>
          </div>
          <span className="text-[10px] font-bold uppercase text-slate-400">
            {historyTab === "setoran" ? `${setoranLogs.length} Catatan` : `${coinTransactions.length} Mutasi`}
          </span>
        </div>

        {/* Tab Content */}
        {loadingHistory ? (
          <div className="py-6 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Clock className="w-5 h-5 animate-spin" />
            <span className="text-xs font-medium">Memuat riwayat...</span>
          </div>
        ) : historyTab === "setoran" ? (
          setoranLogs.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
              <BookOpen className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">Belum ada catatan setoran mengaji</p>
              <p className="text-[11px] text-slate-400">Mulai setoran hafalan kepada Ustadz pembimbing.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {setoranLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800">
                        {log.jilid} • Hal {log.page}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          log.kelancaran === "LANCAR"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : log.kelancaran === "CUKUP"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                        }`}
                      >
                        {log.kelancaran}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-slate-500 text-[11px] font-medium italic truncate">
                        &quot;{log.notes}&quot;
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-1 font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200/60">
                    <span>+{log.bonusCoin} 🪙</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          coinTransactions.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
              <Coins className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">Belum ada riwayat mutasi koin</p>
              <p className="text-[11px] text-slate-400">Dapatkan koin dari kuis dan setoran mengaji.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {coinTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === "EARNED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {tx.type === "EARNED" ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-800 truncate">
                        {tx.description || tx.source}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        {tx.source}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-black shrink-0 ${
                      tx.type === "EARNED" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {tx.type === "EARNED" ? `+${tx.amount} 🪙` : `-${tx.amount} 🪙`}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </TactileCard>

      {/* Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/dashboard/courses">
          <TactileCard className="p-5 flex items-center gap-4 hover:border-emerald-500/50 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                Ruang Modul
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Buka materi &amp; latihan soal
              </p>
            </div>
          </TactileCard>
        </Link>

        <Link href="/dashboard/exchange">
          <TactileCard className="p-5 flex items-center gap-4 hover:border-amber-500/50 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                Toko Berkah
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tukar poin dengan hadiah
              </p>
            </div>
          </TactileCard>
        </Link>

        <Link href="/dashboard/settings" className="sm:col-span-2">
          <TactileCard className="p-5 flex items-center gap-4 hover:border-slate-400/50 transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                Pengaturan Akun
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Ganti kata sandi, preferensi audio &amp; aplikasi
              </p>
            </div>
          </TactileCard>
        </Link>
      </div>

      {/* Logout button */}
      <div className="pt-2">
        <TactileButton
          fullWidth
          variant="secondary"
          size="md"
          onClick={handleLogout}
          className="text-rose-600 hover:text-rose-700"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun (Logout)</span>
        </TactileButton>
      </div>

      {/* Cloudinary Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isUploadModalOpen}
        currentAvatarUrl={currentAvatar}
        userId={uid || ""}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(newUrl) => {
          setOptimisticAvatar(newUrl);
        }}
      />
    </div>
  );
}
