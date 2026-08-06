"use client";

import { useAuth } from "@/context/AuthContext";
import { useUserProgress } from "@/context/UserProgressContext";
import { Star } from "lucide-react";

export default function PointBadge() {
  const { totalPoint } = useAuth();
  const { isAnimating, recentAddedPoints } = useUserProgress();

  return (
    <div className="relative flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-amber-100">
      <div className={`flex items-center justify-center p-1.5 rounded-full bg-amber-400 text-white ${isAnimating ? 'animate-pop' : ''}`}>
        <Star className="w-5 h-5 fill-current" />
      </div>
      <span className="font-bold text-slate-700 text-lg">
        {totalPoint || 0}
      </span>

      {isAnimating && (
        <div className="absolute -top-6 right-2 text-amber-500 font-bold animate-bounce">
          +{recentAddedPoints}
        </div>
      )}
    </div>
  );
}
