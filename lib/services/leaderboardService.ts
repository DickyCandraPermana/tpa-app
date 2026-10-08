import { collection, getDocs, query, orderBy, limit as limitQuery } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface LeaderboardEntry {
  rank: number;
  uid: string;
  username: string;
  totalPoint: number;
  avatarURL: string | null;
  completedCourseCount: number;
  role: string;
}

export const getLeaderboard = async (
  maxResults: number = 20
): Promise<LeaderboardEntry[]> => {
  try {
    const usersRef = collection(db, "users");
    // Ambil user berurutan berdasarkan totalPoint tertinggi
    // Catatan: Sorting in-memory juga diterapkan untuk menjamin keakuratan jika index belum selesai build
    const q = query(usersRef, orderBy("totalPoint", "desc"), limitQuery(50));
    const snap = await getDocs(q);

    if (snap.empty) {
      return [];
    }

    const rawList: LeaderboardEntry[] = [];

    snap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const role = String(data.role || "santri").toLowerCase();

      // Filter: Hanya tampilkan santri (kecualikan ustadz / admin)
      if (role === "ustadz" || role === "ustaz" || role === "admin") {
        return;
      }

      const completedCourses = Array.isArray(data.completedCourse)
        ? data.completedCourse
        : [];

      rawList.push({
        rank: 0, // diisi setelah sorting final
        uid: docSnap.id,
        username: data.username || data.name || "Santri",
        totalPoint: Number(data.totalPoint || 0),
        avatarURL: data.avatarURL || null,
        completedCourseCount: completedCourses.length,
        role: "santri",
      });
    });

    // Urutkan menurun berdasarkan totalPoint, lalu beri nomor peringkat
    rawList.sort((a, b) => b.totalPoint - a.totalPoint);

    const rankedList = rawList.slice(0, maxResults).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    return rankedList;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};
