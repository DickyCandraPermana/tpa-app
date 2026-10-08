"use client";

import React from "react";
import Image from "next/image";
import { Reward } from "@/types/schema";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import GoldBadge from "@/components/ui/GoldBadge";
import { Gift } from "lucide-react";

export interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: (reward: Reward) => void;
  isRedeeming?: boolean;
}

export default function RewardCard({
  reward,
  userPoints,
  onRedeem,
  isRedeeming = false,
}: RewardCardProps) {
  const canAfford = userPoints >= reward.pointsRequired;
  const missingPoints = Math.max(0, reward.pointsRequired - userPoints);

  return (
    <TactileCard className="flex flex-col justify-between gap-4 h-full">
      <div className="flex flex-col gap-3">
        {/* Reward Image / Icon Container */}
        <div className="w-full h-36 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-center justify-center overflow-hidden relative">
          {reward.imageUrl ? (
            <Image
              src={reward.imageUrl}
              alt={reward.name}
              fill
              sizes="(max-width: 640px) 100vw, 240px"
              className="object-contain p-2"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-amber-100/80 flex items-center justify-center text-amber-700">
              <Gift className="w-9 h-9" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <GoldBadge type="coin" value={reward.pointsRequired} size="sm" />
          </div>
        </div>

        {/* Reward Title */}
        <div>
          <h3 className="text-base font-extrabold text-slate-800 line-clamp-2">
            {reward.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Biaya: {reward.pointsRequired} Koin Berkah
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-2 w-full">
        <TactileButton
          fullWidth
          variant={canAfford ? "accent" : "secondary"}
          disabled={!canAfford || isRedeeming}
          onClick={() => onRedeem(reward)}
          size="sm"
        >
          {isRedeeming ? (
            <span>Memproses...</span>
          ) : canAfford ? (
            <>
              <Gift className="w-4 h-4" />
              <span>Tukar Hadiah</span>
            </>
          ) : (
            <span>Kurang {missingPoints} Poin</span>
          )}
        </TactileButton>
      </div>
    </TactileCard>
  );
}
