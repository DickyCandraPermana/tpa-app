"use client";

import { useState } from "react";
import RewardItem from "@/components/RewardItem";
import PointBadge from "@/components/PointBadge";
import { useAuth } from "@/context/AuthContext";
// import { addDoc, collection } from "firebase/firestore";
// import { db } from "@/lib/firebase";

const REWARDS = [
  { id: "r1", name: "Buku Tulis", pointsRequired: 5 },
  { id: "r2", name: "Pensil Warna", pointsRequired: 10 },
  { id: "r3", name: "Penghapus Lucu", pointsRequired: 3 },
  { id: "r4", name: "Mainan Bola", pointsRequired: 25 },
  { id: "r5", name: "Stiker Bintang", pointsRequired: 1 },
  { id: "r6", name: "Buku Cerita Nabi", pointsRequired: 50 },
];

const ExchangePage = () => {
  const { totalPoint, setTotalPoint, uid } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRedeem = async (rewardId: string, cost: number) => {
    if (!uid) return alert("Silakan login dulu!");
    if ((totalPoint || 0) < cost) return alert("Poin tidak cukup!");

    const confirmRedeem = confirm(`Tukar ${cost} poin untuk hadiah ini?`);
    if (!confirmRedeem) return;

    setLoading(true);
    try {
      const newTotal = (totalPoint || 0) - cost;
      setTotalPoint(newTotal); // Optimistic UI Update

      // TODO: Sinkronisasi Firestore
      // await addDoc(collection(db, "redeem_requests"), {
      //   userId: uid,
      //   rewardId,
      //   cost,
      //   status: "pending",
      //   timestamp: new Date()
      // });
      // await updateDoc(doc(db, "users", uid), { totalPoint: newTotal });

      alert("Berhasil ditukar! Tunjukkan ke Ustaz/Ustazah untuk ambil hadiahnya ya.");
    } catch (error) {
      console.error(error);
      alert("Gagal menukar poin. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-8">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Toko Hadiah 🎁</h1>
          <p className="text-slate-500 font-medium">Tukarkan poin yang kamu kumpulkan dengan barang seru!</p>
        </div>
        <div className="mt-4 md:mt-0">
          <PointBadge />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {REWARDS.map((reward) => (
          <RewardItem
            key={reward.id}
            id={reward.id}
            name={reward.name}
            pointsRequired={reward.pointsRequired}
            onRedeem={handleRedeem}
          />
        ))}
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-2xl font-bold text-indigo-600 animate-pulse">Memproses Penukaran...</div>
        </div>
      )}
    </div>
  );
};

export default ExchangePage;
