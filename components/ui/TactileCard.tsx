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
      className={`bg-white dark:bg-[#000000] text-slate-800 dark:text-neutral-100 rounded-3xl border border-[#F3E8D6] dark:border-neutral-800 shadow-sm dark:shadow-none p-6 ${
        hoverEffect
          ? "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
