import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  increment,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Reward, RewardSchema, RedeemRequest, RedeemRequestSchema } from "@/types/schema";
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
  reward: Reward,
  userName: string = "Santri"
): Promise<{ success: boolean; newPoints?: number; error?: string }> => {
  const check = validateRedeemAffordability(userPoints, reward.pointsRequired);
  if (!check.canRedeem) {
    return { success: false, error: check.error };
  }

  try {
    const docRef = await addDoc(collection(db, "redeem_requests"), {
      userId,
      userName,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsRequired: reward.pointsRequired,
      cost: reward.pointsRequired,
      status: "PENDING",
      createdAt: serverTimestamp(),
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
      docRef.id || reward.id,
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

/**
 * Mengambil seluruh klaim hadiah santri yang berstatus PENDING.
 * Digunakan pada antrean Ustadz untuk persetujuan.
 */
export const getPendingRedeemRequests = async (): Promise<RedeemRequest[]> => {
  try {
    const q = query(
      collection(db, "redeem_requests"),
      where("status", "in", ["PENDING", "pending"]),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => RedeemRequestSchema.parse({ id: d.id, ...d.data() }));
  } catch (error) {
    // Resilient fallback jika composite index belum aktif di Firestore
    try {
      const fallbackQ = query(
        collection(db, "redeem_requests"),
        where("status", "in", ["PENDING", "pending"])
      );
      const snap = await getDocs(fallbackQ);
      return snap.docs
        .map((d) => RedeemRequestSchema.parse({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis
            ? a.createdAt.toMillis()
            : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.toMillis
            ? b.createdAt.toMillis()
            : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
    } catch (fallbackError) {
      console.error("Error fetching pending redeem requests:", fallbackError);
      return [];
    }
  }
};

/**
 * Mengambil seluruh riwayat klaim hadiah santri (PENDING, APPROVED, REJECTED).
 */
export const getAllRedeemRequests = async (
  limitCount: number = 50
): Promise<RedeemRequest[]> => {
  try {
    const q = query(
      collection(db, "redeem_requests"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => RedeemRequestSchema.parse({ id: d.id, ...d.data() }));
  } catch (error) {
    try {
      const snap = await getDocs(collection(db, "redeem_requests"));
      return snap.docs
        .map((d) => RedeemRequestSchema.parse({ id: d.id, ...d.data() }))
        .slice(0, limitCount);
    } catch (fallbackErr) {
      console.error("Error fetching all redeem requests:", fallbackErr);
      return [];
    }
  }
};

/**
 * Mengambil riwayat klaim hadiah santri tertentu.
 */
export const getUserRedeemRequests = async (
  userId: string
): Promise<RedeemRequest[]> => {
  try {
    const q = query(
      collection(db, "redeem_requests"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => RedeemRequestSchema.parse({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const timeA = a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  } catch (error) {
    console.error("Error fetching user redeem requests:", error);
    return [];
  }
};

/**
 * Menyetujui permohonan penukaran hadiah santri oleh Ustadz.
 * Memvalidasi status PENDING dan menandai serah terima hadiah tanpa memotong koin kembali.
 */
export const approveRedeemRequest = async (
  requestId: string,
  ustadzId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const requestRef = doc(db, "redeem_requests", requestId);
    const requestSnap = await getDoc(requestRef);

    if (!requestSnap.exists()) {
      return { success: false, error: "Permintaan klaim hadiah tidak ditemukan." };
    }

    const data = requestSnap.data();
    const currentStatus = String(data.status || "").toUpperCase();

    if (currentStatus !== "PENDING") {
      return {
        success: false,
        error: `Permintaan sudah diproses sebelumnya (Status saat ini: ${currentStatus}).`,
      };
    }

    await updateDoc(requestRef, {
      status: "APPROVED",
      ustadzId,
      resolvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error approving redeem request:", error);
    return { success: false, error: error?.message || "Gagal menyetujui klaim hadiah." };
  }
};

/**
 * Menolak permohonan penukaran hadiah santri oleh Ustadz.
 * Mengembalikan koin santri secara atomik dan mencatat transaksi REWARD_REFUND.
 */
export const rejectRedeemRequest = async (
  requestId: string,
  ustadzId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    let refundInfo: { userId: string; points: number; rewardName: string } | null = null;

    // Eksekusi transaksi atomik Firestore untuk menjamin integritas data
    await runTransaction(db, async (tx) => {
      const requestRef = doc(db, "redeem_requests", requestId);
      const requestSnap = await tx.get(requestRef);

      if (!requestSnap.exists()) {
        throw new Error("Permintaan klaim hadiah tidak ditemukan.");
      }

      const data = requestSnap.data();
      const currentStatus = String(data.status || "").toUpperCase();

      if (currentStatus !== "PENDING") {
        throw new Error(`Permintaan sudah diproses sebelumnya (${currentStatus}).`);
      }

      const pointsToRefund = data.pointsRequired ?? data.cost ?? 0;
      const targetUserId = data.userId;
      const rewardName = data.rewardName || "Hadiah Santri";

      refundInfo = { userId: targetUserId, points: pointsToRefund, rewardName };

      // 1. Perbarui status dokumen klaim ke REJECTED
      tx.update(requestRef, {
        status: "REJECTED",
        ustadzId,
        rejectionReason: reason?.trim() || "Penukaran hadiah ditolak oleh Ustadz",
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Kembalikan total poin ke akun santri secara atomik
      const userRef = doc(db, "users", targetUserId);
      tx.update(userRef, {
        totalPoint: increment(pointsToRefund),
      });
    });

    // 3. Catat audit ledger koin setelah transaksi database berhasil
    if (refundInfo) {
      const { userId, points, rewardName } = refundInfo;
      await recordCoinTransaction(
        userId,
        points,
        "EARNED",
        "REWARD_REFUND",
        requestId,
        `Pengembalian koin: Penukaran hadiah "${rewardName}" ditolak (${reason?.trim() || "Ditolak Ustadz"})`
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error rejecting redeem request:", error);
    return { success: false, error: error?.message || "Gagal menolak klaim hadiah." };
  }
};

/**
 * Menambahkan item hadiah baru ke katalog (khusus Ustadz / Admin)
 */
export const createReward = async (
  rewardData: Omit<Reward, "id">
): Promise<Reward> => {
  // Validasi Zod schema
  const parsed = RewardSchema.omit({ id: true }).parse(rewardData);

  const docRef = await addDoc(collection(db, "rewards"), {
    ...parsed,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...parsed,
  };
};

/**
 * Menghapus hadiah dari katalog (khusus Ustadz / Admin)
 */
export const deleteReward = async (rewardId: string): Promise<void> => {
  const rewardRef = doc(db, "rewards", rewardId);
  await deleteDoc(rewardRef);
};

/**
 * Memperbarui jumlah stok hadiah (khusus Ustadz / Admin)
 */
export const updateRewardStock = async (
  rewardId: string,
  newStock: number
): Promise<void> => {
  if (newStock < 0) {
    throw new Error("Stok tidak boleh bernilai negatif.");
  }
  const rewardRef = doc(db, "rewards", rewardId);
  await updateDoc(rewardRef, {
    stock: newStock,
    updatedAt: serverTimestamp(),
  });
};
