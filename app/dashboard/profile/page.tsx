"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import GoldBadge from "@/components/ui/GoldBadge";
import ArabicText from "@/components/ui/ArabicText";
import { BookOpen, Gift, LogOut, Award, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { logoutUser } from "@/lib/auth";

export default function ProfilePage() {
  const { username, email, avatarURL, totalPoint, completedCourse, role, setUid } = useAuth();
  const router = useRouter();

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

  return (
    <div className="flex flex-col w-full gap-6 select-none pb-12">
      {/* Profile Card Banner */}
      <TactileCard className="p-6 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white relative overflow-hidden border-emerald-900 shadow-xl">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4">
          <ArabicText text="بَارَكَ اللَّهُ فِيكَ" size="sm" className="text-emerald-200" />
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-700/80 text-emerald-100 border border-emerald-600">
            {isUstadz ? "Ustadz Pembimbing" : "Santri Teladan"}
          </span>
        </div>

        <div className="flex items-center gap-4 z-10">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-1 bg-white/20 backdrop-blur-xs relative shrink-0">
            <Image
              src={avatarURL || "/assets/profile_picture_placeholder.png"}
              alt="Avatar"
              fill
              className="rounded-full object-cover border-2 border-white"
            />
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
    </div>
  );
}
