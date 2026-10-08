import { collection, addDoc, doc, updateDoc, increment, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Reward, RewardSchema, RedeemRequest } from "@/types/schema";
import { recordCoinTransaction } from "@/lib/services/coinService";

export const DEFAULT_REWARDS: Reward[] = [
  { id: "r1", name: "Buku Tulis", pointsRequired: 5 },
  { id: "r2", name: "Pensil Warna", pointsRequired: 10 },
  { id: "r3", name: "Penghapus Lucu", pointsRequired: 3 },
  { id: "r4", name: "Mainan Bola", pointsRequired: 25 },
  { id: "r5", name: "Stiker Bintang", pointsRequired: 1 },
  { id: "r6", name: "Buku Cerita Nabi", pointsRequired: 50 },
];

export const validateRedeemAffordability = (
  userPoints: number,
  cost: number
): { canRedeem: boolean; remainingPoints: number; error?: string } => {
  if (userPoints < cost) {
    return {
      canRedeem: false,
      remainingPoints: userPoints,
      error: "Poin tidak mencukupi untuk menukar hadiah ini.",
    };
  }
  return {
    canRedeem: true,
    remainingPoints: userPoints - cost,
  };
};

export const getRewards = async (): Promise<Reward[]> => {
  try {
    const snap = await getDocs(collection(db, "rewards"));
    if (snap.empty) {
      return DEFAULT_REWARDS;
    }
    return snap.docs.map((d) => {
      return RewardSchema.parse({ id: d.id, ...d.data() });
    });
  } catch (error) {
    console.warn("Using default rewards fallback:", error);
    return DEFAULT_REWARDS;
  }
};

export const redeemReward = async (
  userId: string,
  userPoints: number,
  reward: Reward
): Promise<{ success: boolean; newPoints?: number; error?: string }> => {
  const check = validateRedeemAffordability(userPoints, reward.pointsRequired);
  if (!check.canRedeem) {
    return { success: false, error: check.error };
  }

  try {
    await addDoc(collection(db, "redeem_requests"), {
      userId,
      rewardId: reward.id,
      rewardName: reward.name,
      cost: reward.pointsRequired,
      status: "pending",
      timestamp: new Date(),
    });

    await updateDoc(doc(db, "users", userId), {
      totalPoint: increment(-reward.pointsRequired),
    });

    await recordCoinTransaction(
      userId,
      -reward.pointsRequired,
      "SPENT",
      "REWARD_REDEEM",
      reward.id,
      `Penukaran hadiah: ${reward.name}`
    );

    return {
      success: true,
      newPoints: check.remainingPoints,
    };
  } catch (error: any) {
    console.error("Firestore error while redeeming reward:", error);
    return {
      success: false,
      error: error?.message || "Gagal menukar hadiah di server. Silakan coba lagi.",
    };
  }
};
