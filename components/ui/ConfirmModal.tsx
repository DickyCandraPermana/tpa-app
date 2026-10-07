"use client";

import React from "react";
import { Gift, X, Check, AlertCircle } from "lucide-react";
import { Reward } from "@/types/schema";

interface ConfirmModalProps {
  isOpen: boolean;
  reward: Reward | null;
  userPoints: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  reward,
  userPoints,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen || !reward) return null;

  const remaining = userPoints - reward.pointsRequired;
  const isAffordable = remaining >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gift Badge */}
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-200/50 mb-5">
          <Gift className="w-10 h-10 text-amber-900" />
        </div>

        <h3 className="text-2xl font-extrabold text-slate-800 mb-2">
          Tukar Hadiah Ini?
        </h3>
        <p className="text-slate-500 font-medium mb-6">
          Kamu akan menukarkan poinmu untuk mendapatkan barang seru ini!
        </p>

        {/* Reward Details Box */}
        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2 mb-6 text-left">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500">Hadiah:</span>
            <span className="text-base font-extrabold text-slate-800">{reward.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500">Biaya Poin:</span>
            <span className="text-base font-extrabold text-amber-600">-{reward.pointsRequired} Poin</span>
          </div>
          <div className="border-t border-slate-200/80 pt-2 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500">Sisa Poinmu:</span>
            <span className={`text-base font-extrabold ${isAffordable ? "text-emerald-600" : "text-rose-600"}`}>
              {remaining} Poin
            </span>
          </div>
        </div>

        {!isAffordable && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-xl mb-6 w-full text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Poinmu belum cukup nih, kumpulkan poin lagi lewat kuis ya!</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3.5 px-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!isAffordable || isLoading}
            className="flex-1 py-3.5 px-4 font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Ya, Tukar!</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
