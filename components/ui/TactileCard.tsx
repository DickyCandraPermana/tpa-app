"use client";

import React from "react";

export interface TactileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export default function TactileCard({
  children,
  className = "",
  onClick,
  hoverEffect = false,
}: TactileCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-3xl border border-[#F3E8D6] shadow-sm p-6 ${
        hoverEffect
          ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
