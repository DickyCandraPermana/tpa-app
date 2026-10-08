"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import TactileButton from "@/components/ui/TactileButton";
import TactileCard from "@/components/ui/TactileCard";
import ArabicText from "@/components/ui/ArabicText";
import { Map, Target, Gift, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const { uid } = useAuth();

  return (
    <main className="min-h-screen w-full bg-[#FDFBF7] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden text-slate-800">
      {/* Subtle geometric & light ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-25 overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-amber-200/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center">
        {/* Basmalah & Dome Icon */}
        <div className="mb-4">
          <ArabicText
            text="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
            size="md"
            className="text-emerald-900 drop-shadow-xs"
          />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-extrabold text-emerald-800 shadow-xs mb-6">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Taman Belajar Santri Digital</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          Belajar Mengaji Asyik &amp; Berkah Bersama{" "}
          <span className="text-emerald-700 underline decoration-[#F59E0B] decoration-wavy decoration-2">
            SibaQ
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 font-medium mb-8 max-w-md">
          Jelajahi peta petualangan huruf hijaiyah, jawab kuis penuh pahala, kumpulkan lentera istiqomah, dan tukar koin berkah dengan hadiah nyata!
        </p>

        {/* Tactile Giant CTA */}
        <div className="w-full max-w-xs mb-10 flex flex-col gap-3">
          <Link href={uid ? "/dashboard" : "/auth"} className="w-full">
            <TactileButton fullWidth size="lg" variant="primary" className="text-lg">
              <span>{uid ? "Lanjut Petualangan" : "Mulai Petualangan Mengaji"}</span>
              <ArrowRight className="w-5 h-5" />
            </TactileButton>
          </Link>

          {uid && (
            <Link href="/dashboard/courses" className="w-full">
              <TactileButton fullWidth size="md" variant="secondary">
                Daftar Materi Kuis
              </TactileButton>
            </Link>
          )}
        </div>

        {/* 3 Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
          <TactileCard className="p-4 flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">
              Peta Jalur Iqro
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Petualangan level hijaiyah bertahap dan terstruktur.
            </p>
          </TactileCard>

          <TactileCard className="p-4 flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">
              Arena Kuis Pahala
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Latihan interaktif ramah anak tanpa rasa takut salah.
            </p>
          </TactileCard>

          <TactileCard className="p-4 flex flex-col items-center text-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">
              Toko Hadiah Santri
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Tukar koin berkah dengan hadiah nyata bersama ustadz.
            </p>
          </TactileCard>
        </div>
      </div>
    </main>
  );
}
