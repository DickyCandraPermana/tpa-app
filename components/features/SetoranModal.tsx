"use client";

import React, { useState, useEffect } from "react";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import GoldBadge from "@/components/ui/GoldBadge";
import { SantriProgressItem, recordSantriSetoran } from "@/lib/services/halaqahService";
import { BookOpen, X, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export interface SetoranModalProps {
  isOpen: boolean;
  santri: SantriProgressItem | null;
  ustadzId: string;
  onClose: () => void;
  onSuccess: (updatedSantri: SantriProgressItem, bonusCoin: number) => void;
}

const JILID_OPTIONS = [
  "Jilid 1",
  "Jilid 2",
  "Jilid 3",
  "Jilid 4",
  "Jilid 5",
  "Jilid 6",
  "Al-Qur'an",
];

export default function SetoranModal({
  isOpen,
  santri,
  ustadzId,
  onClose,
  onSuccess,
}: SetoranModalProps) {
  const [jilid, setJilid] = useState("Jilid 1");
  const [page, setPage] = useState(1);
  const [kelancaran, setKelancaran] = useState<"LANCAR" | "CUKUP" | "MENGULANG">("LANCAR");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (santri) {
      setJilid(santri.jilid || "Jilid 1");
      setPage(santri.page || 1);
      setKelancaran("LANCAR");
      setNotes("");
      setErrorMessage("");
    }
  }, [santri, isOpen]);

  if (!isOpen || !santri) return null;

  const bonusCoin =
    kelancaran === "LANCAR" ? 2 : kelancaran === "CUKUP" ? 1 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!santri || isSubmitting) return;

    if (page < 1) {
      setErrorMessage("Nomor halaman minimal 1");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await recordSantriSetoran({
        santriId: santri.id,
        santriName: santri.name,
        jilid,
        page: Number(page),
        kelancaran,
        bonusCoin,
        notes: notes.trim(),
        ustadzId,
      });

      if (res.success) {
        onSuccess(
          {
            ...santri,
            jilid,
            page: Number(page),
            completed: Number(page),
            totalPoint: (santri.totalPoint || 0) + bonusCoin,
          },
          bonusCoin
        );
        onClose();
      } else {
        setErrorMessage(res.error || "Gagal menyimpan setoran.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = santri.name.slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-[#F3E8D6] shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">
                Catat Setoran Mengaji
              </h3>
              <p className="text-xs text-emerald-200 font-medium">
                Pembaruan progres & apresiasi koin santri
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Santri Header Badge */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
                {initials}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-800 text-sm">
                  {santri.name}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold">
                  Sebelumnya: {santri.jilid} • Hal {santri.page}
                </p>
              </div>
            </div>

            <GoldBadge type="coin" value={`+${bonusCoin} Koin`} size="sm" />
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Jilid & Page Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-700">
                Tingkat / Jilid
              </label>
              <select
                value={jilid}
                onChange={(e) => setJilid(e.target.value)}
                className="w-full text-xs font-extrabold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {JILID_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black text-slate-700">
                Halaman Capaian
              </label>
              <input
                type="number"
                min={1}
                max={604}
                value={page}
                onChange={(e) => setPage(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs font-extrabold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Kelancaran Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-700">
              Tingkat Kelancaran & Koin Apresiasi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setKelancaran("LANCAR")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  kelancaran === "LANCAR"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-1 ring-emerald-500"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-xs font-black">Lancar ✨</span>
                <span className="text-[10px] font-bold text-emerald-700 mt-0.5">
                  +2 Koin
                </span>
              </button>

              <button
                type="button"
                onClick={() => setKelancaran("CUKUP")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  kelancaran === "CUKUP"
                    ? "bg-amber-50 border-amber-500 text-amber-800 shadow-xs ring-1 ring-amber-500"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-xs font-black">Cukup 👍</span>
                <span className="text-[10px] font-bold text-amber-700 mt-0.5">
                  +1 Koin
                </span>
              </button>

              <button
                type="button"
                onClick={() => setKelancaran("MENGULANG")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                  kelancaran === "MENGULANG"
                    ? "bg-slate-100 border-slate-400 text-slate-800 shadow-xs ring-1 ring-slate-400"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="text-xs font-black">Mengulang 🔄</span>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                  +0 Koin
                </span>
              </button>
            </div>
          </div>

          {/* Notes Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-slate-700">
              Catatan / Evaluasi Ustadz
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Makhraj huruf qalqalah sudah sangat baik..."
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 mt-2 pt-3 border-t border-slate-100">
            <TactileButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
            >
              <span>Batal</span>
            </TactileButton>

            <TactileButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Setoran"}</span>
            </TactileButton>
          </div>
        </form>
      </div>
    </div>
  );
}