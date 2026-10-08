"use client";

import React, { useState } from "react";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import GoldBadge from "@/components/ui/GoldBadge";
import { RedeemRequest } from "@/types/schema";
import {
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Check,
  X,
  Send,
} from "lucide-react";

export interface ClaimApprovalCardProps {
  request: RedeemRequest;
  onApprove: (requestId: string) => Promise<void> | void;
  onReject: (requestId: string, reason: string) => Promise<void> | void;
  isProcessing?: boolean;
}

const QUICK_REASONS = [
  "Stok Habis di Lemari TPA",
  "Klaim Dobel",
  "Santri Berubah Pikiran",
  "Poin Belum Cukup",
];

export default function ClaimApprovalCard({
  request,
  onApprove,
  onReject,
  isProcessing = false,
}: ClaimApprovalCardProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const formatRequestDate = (rawDate: any): string => {
    if (!rawDate) return "Hari ini";
    try {
      const date = rawDate?.toDate
        ? rawDate.toDate()
        : rawDate?.toMillis
        ? new Date(rawDate.toMillis())
        : new Date(rawDate);
      if (isNaN(date.getTime())) return "Hari ini";
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Hari ini";
    }
  };

  const handleConfirmReject = () => {
    const finalReason = rejectReason.trim() || "Penukaran ditolak oleh Ustadz";
    if (request.id) {
      onReject(request.id, finalReason);
    }
  };

  const initials = (request.userName || "Santri")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <TactileCard className="p-5 flex flex-col gap-3.5 transition-all">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
            {initials}
          </div>
          <div className="flex flex-col">
            <h4 className="font-extrabold text-slate-800 text-base leading-tight">
              {request.userName || "Santri"}
            </h4>
            <span className="text-[11px] text-slate-400 font-bold mt-0.5">
              {formatRequestDate(request.createdAt || request.timestamp)}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {request.status === "PENDING" && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full text-xs font-extrabold shrink-0 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Menunggu</span>
          </div>
        )}
        {request.status === "APPROVED" && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-extrabold shrink-0 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Disetujui</span>
          </div>
        )}
        {request.status === "REJECTED" && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-full text-xs font-extrabold shrink-0 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Ditolak</span>
          </div>
        )}
      </div>

      {/* Reward Details Box */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <span className="font-black text-slate-800 text-sm truncate">
            {request.rewardName || "Hadiah Santri"}
          </span>
        </div>

        <GoldBadge
          type="coin"
          value={`${request.pointsRequired} Poin`}
          size="sm"
        />
      </div>

      {/* Rejection Reason Alert (if Rejected) */}
      {request.status === "REJECTED" && request.rejectionReason && (
        <div className="p-3 bg-rose-50 border border-rose-200/70 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-rose-900">Alasan Penolakan:</span>
            <span>{request.rejectionReason}</span>
          </div>
        </div>
      )}

      {/* Interactive Actions for Pending Status */}
      {request.status === "PENDING" && (
        <div className="flex flex-col gap-2.5 pt-1 border-t border-slate-100">
          {!isRejecting ? (
            <div className="flex items-center justify-end gap-2.5">
              <TactileButton
                size="sm"
                variant="coral"
                disabled={isProcessing}
                onClick={() => setIsRejecting(true)}
              >
                <X className="w-3.5 h-3.5" />
                <span>Tolak</span>
              </TactileButton>

              <TactileButton
                size="sm"
                variant="primary"
                disabled={isProcessing}
                onClick={() => request.id && onApprove(request.id)}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Setujui</span>
              </TactileButton>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 animate-fadeIn">
              <label className="text-xs font-extrabold text-rose-900">
                Alasan Penolakan (Koin santri akan dikembalikan):
              </label>

              {/* Quick Choice Chips */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectReason(reason)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all border ${
                      rejectReason === reason
                        ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                        : "bg-white text-rose-800 border-rose-200 hover:bg-rose-100/50"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {/* Input field */}
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Alasan penolakan (misal: stok habis di lemari TPA)..."
                className="w-full text-xs font-semibold px-3 py-2 bg-white rounded-xl border border-rose-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-400 placeholder:text-slate-400"
              />

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2 mt-1">
                <TactileButton
                  size="sm"
                  variant="ghost"
                  disabled={isProcessing}
                  onClick={() => {
                    setIsRejecting(false);
                    setRejectReason("");
                  }}
                >
                  <span>Batal</span>
                </TactileButton>

                <TactileButton
                  size="sm"
                  variant="coral"
                  disabled={isProcessing}
                  onClick={handleConfirmReject}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Konfirmasi Tolak</span>
                </TactileButton>
              </div>
            </div>
          )}
        </div>
      )}
    </TactileCard>
  );
}