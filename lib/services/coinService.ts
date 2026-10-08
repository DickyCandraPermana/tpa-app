import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CoinTransaction, CoinTransactionSchema } from "@/types/schema";

export const formatCoinTransactionPayload = (
  userId: string,
  amount: number,
  type: "EARNED" | "SPENT",
  source: "QUIZ" | "REWARD_REDEEM" | "MANUAL_ADJUSTMENT" | "DAILY_BONUS",
  referenceId?: string,
  description?: string
): Omit<CoinTransaction, "id"> => {
  return {
    userId,
    amount,
    type,
    source,
    referenceId,
    description: description || "",
    createdAt: new Date().toISOString(),
  };
};

export const recordCoinTransaction = async (
  userId: string,
  amount: number,
  type: "EARNED" | "SPENT",
  source: "QUIZ" | "REWARD_REDEEM" | "MANUAL_ADJUSTMENT" | "DAILY_BONUS",
  referenceId?: string,
  description?: string
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const payload = formatCoinTransactionPayload(
      userId,
      amount,
      type,
      source,
      referenceId,
      description
    );

    const docRef = await addDoc(collection(db, "coin_transactions"), {
      ...payload,
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error recording coin transaction:", error);
    return { success: false, error: error?.message || "Failed to record transaction" };
  }
};

export const getUserTransactions = async (
  userId: string,
  maxItems: number = 20
): Promise<CoinTransaction[]> => {
  try {
    const q = query(
      collection(db, "coin_transactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(maxItems)
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return CoinTransactionSchema.parse({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      });
    });
  } catch (error) {
    console.error("Error getting user transactions:", error);
    return [];
  }
};
