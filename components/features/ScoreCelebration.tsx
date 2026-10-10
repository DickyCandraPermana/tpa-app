"use client";

import React from "react";
import TactileButton from "@/components/ui/TactileButton";
import { Sparkles, Trophy, RotateCcw, ArrowRight } from "lucide-react";

export interface ScoreCelebrationProps {
  isOpen: boolean;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  sessionPoints: number;
  onRestart: () => void;
  onContinue: () => void;
}

export default function ScoreCelebration({
  isOpen,
  scorePercent,
  correctCount,
  totalQuestions,
  sessionPoints,
  onRestart,
  onContinue,
}: ScoreCelebrationProps) {
  if (!isOpen) return null;

  // Star logic
  let stars = 0;
  if (scorePercent === 100) stars = 3;
  else if (scorePercent >= 60) stars = 2;
  else if (scorePercent > 0) stars = 1;

  // Title & description logic
  let title = "Tetap Semangat! Ayo Belajar & Coba Lagi!";
  let subtitle = "Jangan patah arang, setiap huruf hijaiyah bernilai 10 pahala kebaikan!";
  if (scorePercent === 100) {
    title = "Mumtaz! Kamu Hebat!";
    subtitle = "Maa Syaa Allah! Semua soal berhasil kamu jawab dengan sempurna!";
  } else if (scorePercent >= 60) {
    title = "Alhamdulillah! Bagus Sekali!";
    subtitle = "Usaha yang luar biasa! Terus tingkatkan hafalan dan pemahamanmu!";
  } else if (scorePercent > 0) {
    title = "Bagus! Kamu Sudah Berusaha!";
    subtitle = "Sedikit lagi menuju sempurna, yuk ulangi sekali lagi!";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-fadeIn">
      <div className="bg-[#FDFBF7] rounded-3xl border-2 border-[#F3E8D6] shadow-2xl p-6 sm:p-8 max-w-sm w-full flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-300/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-300/20 rounded-full blur-2xl" />

        {/* Trophy icon */}
        <div className="w-20 h-20 bg-amber-100 border-2 border-amber-300 rounded-3xl flex items-center justify-center shadow-xs mb-4 animate-bounce">
          <Trophy className="w-10 h-10 text-amber-800" />
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-3 text-3xl">
          {[1, 2, 3].map((starIdx) => (
            <span
              key={starIdx}
              className={`transition-all ${
                starIdx <= stars ? "opacity-100 scale-110" : "opacity-30 grayscale"
              }`}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-xl font-extrabold text-slate-800 mb-1 leading-snug">
          {title}
        </h2>
        <p className="text-xs text-slate-500 font-medium mb-6">{subtitle}</p>

        {/* Stat badges */}
        <div className="grid grid-cols-3 gap-2.5 w-full mb-6">
          <div className="p-2.5 bg-white border border-[#F3E8D6] rounded-2xl flex flex-col items-center shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400">Nilai</span>
            <span className="text-lg font-extrabold text-emerald-700">
              {scorePercent}%
            </span>
          </div>

          <div className="p-2.5 bg-white border border-[#F3E8D6] rounded-2xl flex flex-col items-center shadow-xs">
            <span className="text-[10px] font-bold uppercase text-slate-400">Benar</span>
            <span className="text-lg font-extrabold text-slate-800">
              {correctCount}/{totalQuestions}
            </span>
          </div>

          <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col items-center shadow-xs">
            <span className="text-[10px] font-bold uppercase text-amber-600">Poin</span>
            <span className="text-lg font-extrabold text-amber-800">
              +{sessionPoints} 🪙
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <TactileButton fullWidth variant="primary" onClick={onContinue} size="md">
            <span>Lanjut Materi</span>
            <ArrowRight className="w-4 h-4" />
          </TactileButton>

          <TactileButton fullWidth variant="secondary" onClick={onRestart} size="sm">
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Soal</span>
          </TactileButton>
        </div>
      </div>
    </div>
  );
}
