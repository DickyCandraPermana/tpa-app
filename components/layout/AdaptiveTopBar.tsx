"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import GoldBadge from "@/components/ui/GoldBadge";
import { GraduationCap, Gift } from "lucide-react";

export interface AdaptiveTopBarProps {
  halaqahName?: string;
  pendingClaimsCount?: number;
}

export default function AdaptiveTopBar({
  halaqahName = "Halaqah Abu Bakar",
  pendingClaimsCount = 2,
}: AdaptiveTopBarProps) {
  const { username, role, totalPoint, avatarURL } = useAuth();
  const isUstaz = role === "ustaz" || role === "admin";

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md px-4 py-3 border-b border-[#F3E8D6]/60 flex items-center justify-between select-none">
      {isUstaz ? (
        // Ustadz Top Bar
        <>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                Pembina Halaqah
              </p>
              <h2 className="text-sm font-extrabold text-slate-800 leading-tight">
                {halaqahName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-bold text-amber-900 shadow-xs">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>{pendingClaimsCount} Klaim Pending</span>
            </div>
          </div>
        </>
      ) : (
        // Santri Top Bar
        <>
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-full ring-2 ring-emerald-500/30 overflow-hidden bg-white shadow-xs">
              <Image
                src={avatarURL || "/assets/profile_picture_placeholder.png"}
                alt="Avatar"
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                Santri Hebat
              </p>
              <h2 className="text-sm font-extrabold text-slate-800 leading-tight truncate max-w-[130px]">
                {username || "Santri"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <GoldBadge type="coin" value={totalPoint || 0} size="sm" />
            <GoldBadge type="lantern" value="3" size="sm" />
          </div>
        </>
      )}
    </header>
  );
}
