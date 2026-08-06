"use client";

import { useAuth } from "@/context/AuthContext";

interface RewardItemProps {
  id: string;
  name: string;
  pointsRequired: number;
  imageUrl?: string;
  onRedeem: (id: string, cost: number) => void;
}

export default function RewardItem({ id, name, pointsRequired, imageUrl, onRedeem }: RewardItemProps) {
  const { totalPoint } = useAuth();
  const currentPoints = totalPoint || 0;
  const canAfford = currentPoints >= pointsRequired;

  return (
    <div className={`relative flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 ${
      canAfford 
        ? "bg-white border-amber-200 shadow-md hover:shadow-xl hover:-translate-y-1" 
        : "bg-slate-50 border-slate-200 opacity-80"
    }`}>
      {/* Gambar Barang */}
      <div className="flex-grow flex items-center justify-center p-4 bg-slate-100 rounded-2xl mb-4 h-40">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="object-contain max-h-full" />
        ) : (
          <div className="text-4xl">🎁</div>
        )}
      </div>

      <h3 className="text-xl font-bold text-slate-800 text-center mb-2">{name}</h3>
      
      <div className="flex justify-center items-center gap-1 mb-4">
        <span className="text-amber-500 font-extrabold text-2xl">{pointsRequired}</span>
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Poin</span>
      </div>

      <button
        disabled={!canAfford}
        onClick={() => onRedeem(id, pointsRequired)}
        className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${
          canAfford
            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        {canAfford ? "Tukar Sekarang" : "Poin Kurang"}
      </button>
    </div>
  );
}
