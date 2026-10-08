"use client";

import React from "react";

export interface GoldBadgeProps {
  type: "coin" | "lantern" | "star";
  value: number | string;
  size?: "sm" | "md";
  className?: string;
}

export default function GoldBadge({
  type,
  value,
  size = "md",
  className = "",
}: GoldBadgeProps) {
  const icon = {
    coin: "🪙",
    lantern: "🏮",
    star: "⭐",
  }[type];

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3.5 py-1.5 text-sm gap-1.5",
  }[size];

  return (
    <div
      className={`inline-flex items-center font-extrabold text-amber-900 bg-amber-50/90 border border-amber-200/90 rounded-full shadow-xs select-none backdrop-blur-xs ${sizeClasses} ${className}`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{value}</span>
    </div>
  );
}
