"use client";

import { useState, useEffect, useCallback } from "react";
import RewardCard from "@/components/features/RewardCard";
import ClaimApprovalCard from "@/components/features/ClaimApprovalCard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ToastNotification, { ToastType } from "@/components/ui/ToastNotification";
import TactileCard from "@/components/ui/TactileCard";
import ArabicText from "@/components/ui/ArabicText";
import GoldBadge from "@/components/ui/GoldBadge";
import { useAuth } from "@/context/AuthContext";
import {
  getRewards,
  redeemReward,
  getAllRedeemRequests,
  getUserRedeemRequests,
  approveRedeemRequest,
  rejectRedeemRequest,
} from "@/lib/services/rewardService";
import { Reward, RedeemRequest } from "@/types/schema";
import {
  Gift,
  CheckCircle2,
  Clock,
  XCircle,
  Inbox,
  Sparkles,
  ClipboardList,
} from "lucide-react";

export default function ExchangePage() {
  const { totalPoint, setTotalPoint, uid, role, userProfile } = useAuth();
  const isUstadz = role === "ustadz" || role === "ustaz" || role === "admin";

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [requests, setRequests] = useState<RedeemRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  // Active tab: ustadz defaults to "claims", santri defaults to "catalog"
  const [activeTab, setActiveTab] = useState<"catalog" | "claims">(
    isUstadz ? "claims" : "catalog"
  );
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");

  // Dialog & Toast states
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Sync default tab if role changes
  useEffect(() => {
    if (isUstadz) {
      setActiveTab("claims");
    } else {
      setActiveTab("catalog");
    }
  }, [isUstadz]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rewardData, requestData] = await Promise.all([
        getRewards(),
        isUstadz
          ? getAllRedeemRequests(50)
          : uid
          ? getUserRedeemRequests(uid)
          : Promise.resolve([]),
      ]);
      setRewards(rewardData);
      setRequests(requestData);
    } catch (err) {
      console.error("Error loading exchange data:", err);
    } finally {
      setLoading(false);
    }
  }, [isUstadz, uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Santri Redeem Flow
  const handleOpenRedeemModal = (reward: Reward) => {
    if (!uid) {
      setToast({
        message: "Silakan masuk terlebih dahulu untuk menukar hadiah!",
        type: "error",
      });
      return;
    }
    setSelectedReward(reward);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !uid) return;

    setIsRedeeming(true);
    const santriName = userProfile?.username || "Santri";
    const result = await redeemReward(uid, totalPoint || 0, selectedReward, santriName);

    if (result.success) {
      if (typeof result.newPoints === "number") {
        setTotalPoint(result.newPoints);
      }
      setSelectedReward(null);
      setToast({
        message: "Alhamdulillah! Klaim hadiah berhasil diajukan ke Ustadz!",
        type: "success",
      });
      // Refresh user requests
      if (uid) {
        const updated = await getUserRedeemRequests(uid);
        setRequests(updated);
      }
    } else {
      setToast({
        message: result.error || "Gagal menukar hadiah. Silakan coba lagi.",
        type: "error",
      });
    }
    setIsRedeeming(false);
  };

  // Ustadz Approval Flow
  const handleApproveClaim = async (requestId: string) => {
    if (!uid) return;
    setProcessingRequestId(requestId);

    const res = await approveRedeemRequest(requestId, uid);
    if (res.success) {
      // Optimistic update
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: "APPROVED" as const, ustadzId: uid }
            : r
        )
      );
      setToast({
        message: "Klaim hadiah berhasil disetujui! Silakan serahkan hadiah fisik ke santri.",
        type: "success",
      });
    } else {
      setToast({
        message: res.error || "Gagal menyetujui klaim hadiah.",
        type: "error",
      });
    }
    setProcessingRequestId(null);
  };

  // Ustadz Rejection Flow (with atomic refund)
  const handleRejectClaim = async (requestId: string, reason: string) => {
    if (!uid) return;
    setProcessingRequestId(requestId);

    const res = await rejectRedeemRequest(requestId, uid, reason);
    if (res.success) {
      // Optimistic update
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "REJECTED" as const,
                ustadzId: uid,
                rejectionReason: reason,
              }
            : r
        )
      );
      setToast({
        message: "Klaim berhasil ditolak. Koin santri telah dikembalikan secara otomatis.",
        type: "info",
      });
    } else {
      setToast({
        message: res.error || "Gagal menolak klaim hadiah.",
        type: "error",
      });
    }
    setProcessingRequestId(null);
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === "ALL") return true;
    return r.status === filterStatus;
  });

  return (
    <div className="flex flex-col w-full gap-6 select-none pb-12">
      {/* Header Banner */}
      <TactileCard className="p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-xs font-extrabold text-amber-800">
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>Toko Berkah Santri</span>
          </div>
          <ArabicText text="جَزَاكُمُ اللَّهُ خَيْرًا" size="sm" className="text-emerald-900" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {isUstadz ? "Panel Klaim & Hadiah TPA" : "Tukar Koin Berkah"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {isUstadz
                ? "Verifikasi dan setujui penukaran koin santri binaan secara real-time"
                : "Tukarkan koin berkah hasil belajar dengan hadiah pilihanmu!"}
            </p>
          </div>

          <div className="self-start sm:self-auto">
            <GoldBadge type="coin" value={`${totalPoint || 0} Poin`} size="md" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          {isUstadz ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("claims")}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border-b-2 active:border-b-0 cursor-pointer ${
                  activeTab === "claims"
                    ? "bg-emerald-600 text-white border-emerald-800 shadow-sm shadow-emerald-900/10"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60"
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span>Klaim Santri</span>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-black animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("catalog")}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border-b-2 active:border-b-0 cursor-pointer ${
                  activeTab === "catalog"
                    ? "bg-emerald-600 text-white border-emerald-800 shadow-sm shadow-emerald-900/10"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60"
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Katalog Hadiah TPA</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setActiveTab("catalog")}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border-b-2 active:border-b-0 cursor-pointer ${
                  activeTab === "catalog"
                    ? "bg-emerald-600 text-white border-emerald-800 shadow-sm shadow-emerald-900/10"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60"
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Tukar Hadiah</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("claims")}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all border-b-2 active:border-b-0 cursor-pointer ${
                  activeTab === "claims"
                    ? "bg-emerald-600 text-white border-emerald-800 shadow-sm shadow-emerald-900/10"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Riwayat Klaim Saya</span>
                {requests.length > 0 && (
                  <span className="px-2 py-0.5 text-[10px] bg-slate-200 text-slate-700 rounded-full font-black">
                    {requests.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </TactileCard>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-bold">Memuat data berkah...</p>
        </div>
      ) : activeTab === "claims" ? (
        /* Claims View */
        <div className="flex flex-col gap-4">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFilterStatus("ALL")}
              className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                filterStatus === "ALL"
                  ? "bg-slate-800 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Semua ({requests.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("PENDING")}
              className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === "PENDING"
                  ? "bg-amber-500 text-white border-amber-600"
                  : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Menunggu ({pendingCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("APPROVED")}
              className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === "APPROVED"
                  ? "bg-emerald-600 text-white border-emerald-700"
                  : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Disetujui ({approvedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus("REJECTED")}
              className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                filterStatus === "REJECTED"
                  ? "bg-rose-500 text-white border-rose-600"
                  : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Ditolak ({rejectedCount})</span>
            </button>
          </div>

          {/* List of Claims */}
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center bg-white rounded-3xl border-2 border-[#F3E8D6] p-8 shadow-xs">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-3">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-800">Tidak Ada Klaim Ditemukan</h3>
              <p className="text-slate-500 text-xs font-medium mt-1">
                {filterStatus === "PENDING"
                  ? "Semua permohonan santri telah selesai diproses."
                  : "Belum ada catatan riwayat klaim pada status ini."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((req) => (
                <ClaimApprovalCard
                  key={req.id}
                  request={req}
                  onApprove={isUstadz ? handleApproveClaim : () => {}}
                  onReject={isUstadz ? handleRejectClaim : () => {}}
                  isProcessing={processingRequestId === req.id}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Rewards Catalog View */
        rewards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border-2 border-[#F3E8D6] p-8 shadow-xs">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Katalog Belum Tersedia</h3>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Hadiah berkah sedang disiapkan oleh Ustadz dan pengurus TPA.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userPoints={totalPoint || 0}
                onRedeem={handleOpenRedeemModal}
                isRedeeming={isRedeeming}
              />
            ))}
          </div>
        )
      )}

      {/* Interactive Confirm Modal for Santri */}
      <ConfirmModal
        isOpen={selectedReward !== null}
        reward={selectedReward}
        userPoints={totalPoint || 0}
        isLoading={isRedeeming}
        onConfirm={handleConfirmRedeem}
        onCancel={() => setSelectedReward(null)}
      />

      {/* Modern Auto-dismiss Toast */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}