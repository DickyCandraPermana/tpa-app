"use client";

import { useState, useEffect } from "react";
import RewardItem from "@/components/RewardItem";
import PointBadge from "@/components/PointBadge";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ToastNotification, { ToastType } from "@/components/ui/ToastNotification";
import { useAuth } from "@/context/AuthContext";
import { getRewards, redeemReward } from "@/lib/services/rewardService";
import { Reward } from "@/types/schema";

const ExchangePage = () => {
  const { totalPoint, setTotalPoint, uid } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Dialog & Toast states
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const data = await getRewards();
        setRewards(data);
      } catch (err) {
        console.error("Error fetching rewards:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const handleOpenRedeemModal = (rewardId: string, cost: number) => {
    if (!uid) {
      setToast({
        message: "Silakan login terlebih dahulu untuk menukar hadiah!",
        type: "error",
      });
      return;
    }

    const found = rewards.find((r) => r.id === rewardId) || {
      id: rewardId,
      name: "Hadiah Istimewa",
      pointsRequired: cost,
    };
    setSelectedReward(found);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !uid) return;

    setIsRedeeming(true);
    const result = await redeemReward(uid, totalPoint || 0, selectedReward);

    if (result.success) {
      if (typeof result.newPoints === "number") {
        setTotalPoint(result.newPoints); // Optimistic UI
      }
      setSelectedReward(null);
      setToast({
        message: "Alhamdulillah! Hadiah berhasil ditukar. Tunjukkan ke Ustaz/Ustazah ya!",
        type: "success",
      });
    } else {
      setToast({
        message: result.error || "Gagal menukar hadiah. Silakan coba lagi.",
        type: "error",
      });
    }
    setIsRedeeming(false);
  };

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Toko Hadiah 🎁</h1>
          <p className="text-slate-500 font-medium">Tukarkan poin yang kamu kumpulkan dengan barang seru!</p>
        </div>
        <div className="mt-4 md:mt-0">
          <PointBadge />
        </div>
      </div>

      {/* Rewards Catalog */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Memuat katalog hadiah seru...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rewards.map((reward) => (
            <RewardItem
              key={reward.id}
              id={reward.id}
              name={reward.name}
              pointsRequired={reward.pointsRequired}
              onRedeem={handleOpenRedeemModal}
            />
          ))}
        </div>
      )}

      {/* Interactive Confirm Modal */}
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
};

export default ExchangePage;
