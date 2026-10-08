import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SetoranLog, SetoranLogSchema } from "@/types/schema";
import { recordCoinTransaction } from "@/lib/services/coinService";

export interface SantriProgressItem {
  id: string;
  name: string;
  jilid: string;
  page: number;
  totalPages: number;
  completed: number;
  totalPoint?: number;
  lastSetoranDate?: string;
}

export const DEFAULT_SANTRI_LIST: SantriProgressItem[] = [
  {
    id: "s1",
    name: "Ahmad Dahlan",
    jilid: "Jilid 3",
    page: 14,
    totalPages: 30,
    completed: 14,
    totalPoint: 45,
  },
  {
    id: "s2",
    name: "Fathimah Az-Zahra",
    jilid: "Jilid 2",
    page: 28,
    totalPages: 30,
    completed: 28,
    totalPoint: 60,
  },
  {
    id: "s3",
    name: "Salman Al-Farisi",
    jilid: "Jilid 1",
    page: 12,
    totalPages: 30,
    completed: 12,
    totalPoint: 20,
  },
  {
    id: "s4",
    name: "Khadijah Azzahra",
    jilid: "Jilid 4",
    page: 5,
    totalPages: 30,
    completed: 5,
    totalPoint: 80,
  },
];

/**
 * Mengambil daftar santri dalam halaqah dari Firestore.
 * Jika kosong atau offline, mengembalikan daftar default sebagai fallback aman.
 */
export const getHalaqahSantriList = async (
  halaqahId?: string
): Promise<SantriProgressItem[]> => {
  try {
    const q = halaqahId
      ? query(
          collection(db, "users"),
          where("role", "==", "santri"),
          where("halaqahId", "==", halaqahId)
        )
      : query(collection(db, "users"), where("role", "==", "santri"));

    const snap = await getDocs(q);
    if (snap.empty) {
      return DEFAULT_SANTRI_LIST;
    }

    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      const page = typeof data.currentPage === "number" ? data.currentPage : 1;
      const totalPages = typeof data.totalPages === "number" ? data.totalPages : 30;
      return {
        id: docSnap.id,
        name: data.username || data.name || "Santri",
        jilid: data.jilid || "Jilid 1",
        page,
        totalPages,
        completed: page,
        totalPoint: data.totalPoint || 0,
        lastSetoranDate: data.lastSetoranDate,
      };
    });
  } catch (err) {
    console.warn("Using fallback halaqah santri list:", err);
    return DEFAULT_SANTRI_LIST;
  }
};

export type SetoranInput = {
  santriId: string;
  santriName: string;
  jilid: string;
  page: number;
  kelancaran: "LANCAR" | "CUKUP" | "MENGULANG";
  bonusCoin?: number;
  notes?: string;
  ustadzId: string;
};

/**
 * Mencatat setoran harian mengaji santri oleh Ustadz,
 * memperbarui capaian progres santri, dan memberikan reward koin berkah.
 */
export const recordSantriSetoran = async (
  input: SetoranInput
): Promise<{ success: boolean; logId?: string; error?: string }> => {
  try {
    const bonus = typeof input.bonusCoin === "number" ? input.bonusCoin : 1;
    const validated = SetoranLogSchema.parse({
      ...input,
      bonusCoin: bonus,
    });

    // 1. Simpan rekaman setoran ke koleksi setoran_logs
    const logRef = await addDoc(collection(db, "setoran_logs"), {
      ...validated,
      createdAt: serverTimestamp(),
    });

    // 2. Perbarui progres capaian santri di koleksi users
    const userRef = doc(db, "users", input.santriId);
    await updateDoc(userRef, {
      jilid: input.jilid,
      currentPage: input.page,
      lastSetoranDate: new Date().toISOString(),
      ...(bonus > 0 ? { totalPoint: increment(bonus) } : {}),
    });

    // 3. Catat transaksi koin berkah jika ada bonus yang diberikan
    if (bonus > 0) {
      await recordCoinTransaction(
        input.santriId,
        bonus,
        "EARNED",
        "MANUAL_ADJUSTMENT",
        logRef.id,
        `Apresiasi setoran mengaji ${input.jilid} hal ${input.page} (${input.kelancaran})`
      );
    }

    return { success: true, logId: logRef.id };
  } catch (error: any) {
    console.error("Error recording santri setoran:", error);
    return {
      success: false,
      error: error?.message || "Gagal mencatat setoran santri.",
    };
  }
};

/**
 * Mengambil riwayat setoran seorang santri.
 */
export const getSantriSetoranLogs = async (
  santriId: string,
  limitCount: number = 20
): Promise<SetoranLog[]> => {
  try {
    const q = query(
      collection(db, "setoran_logs"),
      where("santriId", "==", santriId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => SetoranLogSchema.parse({ id: d.id, ...d.data() }));
  } catch (error) {
    try {
      const fallbackQ = query(
        collection(db, "setoran_logs"),
        where("santriId", "==", santriId)
      );
      const snap = await getDocs(fallbackQ);
      return snap.docs
        .map((d) => SetoranLogSchema.parse({ id: d.id, ...d.data() }))
        .slice(0, limitCount);
    } catch (fallbackErr) {
      console.error("Error fetching setoran logs:", fallbackErr);
      return [];
    }
  }
};