"use client";

import React, { useState } from "react";
import ArabicText from "@/components/ui/ArabicText";
import TactileCard from "@/components/ui/TactileCard";
import { Volume2, VolumeX } from "lucide-react";

export interface HijaiyahCardProps {
  arabic: string;
  transliteration: string;
  description?: string;
  audioUrl?: string;
  makhrajInfo?: string;
}

export default function HijaiyahCard({
  arabic,
  transliteration,
  description = "",
  audioUrl,
  makhrajInfo,
}: HijaiyahCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    if (!audioUrl) return;
    try {
      setIsPlaying(true);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <TactileCard className="flex flex-col items-center justify-center text-center p-8 relative overflow-hidden bg-white">
      {/* Decorative background circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-50/70 rounded-full blur-xl pointer-events-none" />

      {/* Audio pronunciation button */}
      {audioUrl && (
        <button
          type="button"
          onClick={handlePlayAudio}
          className={`absolute top-4 right-4 w-12 h-12 rounded-full border-b-4 border-amber-700 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-md active:border-b-0 active:translate-y-1 transition-all cursor-pointer ${
            isPlaying ? "animate-pulse" : ""
          }`}
          title="Dengarkan Pelafalan"
        >
          {isPlaying ? (
            <Volume2 className="w-6 h-6 animate-bounce" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Massive Arabic Text */}
      <div className="py-6 z-10">
        <ArabicText text={arabic} size="2xl" className="text-emerald-900" />
      </div>

      {/* Transliteration badge */}
      <div className="mt-2 z-10">
        <span className="px-4 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-800 font-extrabold text-lg shadow-xs">
          {transliteration}
        </span>
      </div>

      {/* Description / Makhraj info */}
      {(description || makhrajInfo) && (
        <div className="mt-4 max-w-xs text-xs text-slate-500 font-medium z-10">
          {makhrajInfo && (
            <p className="font-bold text-slate-700 mb-1">Makhraj: {makhrajInfo}</p>
          )}
          {description && <p>{description}</p>}
        </div>
      )}
    </TactileCard>
  );
}
