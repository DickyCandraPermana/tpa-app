"use client";

import React from "react";
import { Check, Lock, Play } from "lucide-react";
import ArabicText from "@/components/ui/ArabicText";

export interface LearningMapNodeProps {
  level: number;
  title: string;
  arabic?: string;
  status: "completed" | "current" | "locked";
  stars?: number;
  onClick?: () => void;
  align?: "left" | "center" | "right";
}

export default function LearningMapNode({
  level,
  title,
  arabic,
  status,
  stars = 0,
  onClick,
  align = "center",
}: LearningMapNodeProps) {
  const isLocked = status === "locked";
  const isCurrent = status === "current";
  const isCompleted = status === "completed";

  let alignClass = "self-center";
  if (align === "left") alignClass = "self-start ml-8 sm:ml-12";
  if (align === "right") alignClass = "self-end mr-8 sm:mr-12";

  let circleStyle =
    "bg-slate-200 border-b-4 border-slate-300 text-slate-400 shadow-xs cursor-not-allowed";
  let content = <Lock className="w-8 h-8" />;

  if (isCompleted) {
    circleStyle =
      "bg-emerald-600 border-b-4 border-emerald-800 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:border-b-0 active:translate-y-1 cursor-pointer";
    content = arabic ? (
      <ArabicText text={arabic} size="md" className="text-white drop-shadow-xs" />
    ) : (
      <Check className="w-8 h-8 stroke-[3]" />
    );
  } else if (isCurrent) {
    circleStyle =
      "bg-amber-400 border-b-4 border-amber-600 text-amber-950 shadow-xl shadow-amber-400/40 hover:bg-amber-500 active:border-b-0 active:translate-y-1 ring-4 ring-amber-300/60 cursor-pointer animate-pulse";
    content = arabic ? (
      <ArabicText text={arabic} size="md" className="text-amber-950 font-black" />
    ) : (
      <Play className="w-8 h-8 fill-current ml-0.5" />
    );
  }

  const starString = isCompleted ? "⭐".repeat(Math.min(3, Math.max(1, stars))) : null;

  return (
    <div className={`flex flex-col items-center group select-none ${alignClass}`}>
      {/* Node Circle */}
      <button
        type="button"
        disabled={isLocked}
        onClick={isLocked ? undefined : onClick}
        className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center transition-all ${circleStyle}`}
      >
        {content}
      </button>

      {/* Stars if completed */}
      {starString && (
        <span className="text-xs -mt-2 z-10 bg-white/90 px-2 py-0.5 rounded-full border border-amber-200 shadow-xs">
          {starString}
        </span>
      )}

      {/* Level label & title */}
      <div className="mt-2 text-center max-w-[140px]">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Level {level}
        </p>
        <p
          className={`text-xs font-extrabold truncate ${
            isCurrent ? "text-amber-900" : isCompleted ? "text-emerald-900" : "text-slate-500"
          }`}
        >
          {title}
        </p>
      </div>
    </div>
  );
}
