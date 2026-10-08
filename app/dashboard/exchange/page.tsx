"use client";

import { useState, useEffect } from "react";
import RewardCard from "@/components/features/RewardCard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ToastNotification, { ToastType } from "@/components/ui/ToastNotification";
import TactileCard from "@/components/ui/TactileCard";
import ArabicText from "@/components/ui/ArabicText";
import GoldBadge from "@/components/ui/GoldBadge";
import { useAuth } from "@/context/AuthContext";
import { getRewards, redeemReward } from "@/lib/services/rewardService";
import { Reward } from "@/types/schema";
import { Gift, Sparkles, CheckCircle2 } from "lucide-react";

export default function ExchangePage() {
  const { totalPoint, setTotalPoint, uid, role } = useAuth();
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
    const result = await redeemReward(uid, totalPoint || 0, selectedReward);

    if (result.success) {
      if (typeof result.newPoints === "number") {
        setTotalPoint(result.newPoints); // Optimistic UI
      }
      setSelectedReward(null);
      setToast({
        message: "Alhamdulillah! Klaim hadiah berhasil dikirim ke Ustadz!",
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

  const isUstadz = role === "ustadz";

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
              {isUstadz ? "Katalog & Klaim Hadiah Santri" : "Tukar Koin Berkah"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {isUstadz
                ? "Pantau barang hadiah dan setujui penukaran koin santri binaan"
                : "Tukarkan koin berkah hasil belajar dengan hadiah pilihanmu!"}
            </p>
          </div>

          <div className="self-start sm:self-auto">
            <GoldBadge type="coin" value={`${totalPoint || 0} Poin`} size="md" />
          </div>
        </div>
      </TactileCard>

      {/* Rewards Catalog */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-bold">Memuat katalog hadiah berkah...</p>
        </div>
      ) : rewards.length === 0 ? (
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
}
