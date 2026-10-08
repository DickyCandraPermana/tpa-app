"use client";

import React from "react";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import { BookOpen, CheckCircle2 } from "lucide-react";

export interface SantriProgressCardProps {
  santriName: string;
  jilid: string;
  page: number;
  totalPages?: number;
  completedCount?: number;
  onUpdateProgress?: () => void;
}

export default function SantriProgressCard({
  santriName,
  jilid,
  page,
  totalPages = 30,
  completedCount = 0,
  onUpdateProgress,
}: SantriProgressCardProps) {
  const percent = Math.min(100, Math.round((page / totalPages) * 100));

  return (
    <TactileCard className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
            {santriName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="font-extrabold text-slate-800 text-base leading-tight">
              {santriName}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {jilid} • Hal {page} / {totalPages}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{completedCount} Tuntas</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full mt-1">
        <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
          <span>Progres Jilid</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Action */}
      <div className="mt-2 flex justify-end">
        <TactileButton
          size="sm"
          variant="secondary"
          onClick={onUpdateProgress}
          className="text-xs"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Update Setoran</span>
        </TactileButton>
      </div>
    </TactileCard>
  );
}
