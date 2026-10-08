"use client";

import React from "react";

export interface TactileButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "ghost" | "coral";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export default function TactileButton({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  type = "button",
  fullWidth = false,
}: TactileButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-xl",
    md: "px-5 py-3 text-base rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
  }[size];

  const variantClasses = {
    primary: disabled
      ? "bg-emerald-600 text-white border-emerald-850"
      : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-800 shadow-md shadow-emerald-900/10",
    secondary: disabled
      ? "bg-white text-slate-400 border-[#F3E8D6]"
      : "bg-white hover:bg-emerald-50/50 text-emerald-900 border-[#F3E8D6] shadow-sm",
    accent: disabled
      ? "bg-amber-500 text-white border-amber-700"
      : "bg-amber-500 hover:bg-amber-600 text-white border-amber-700 shadow-md shadow-amber-900/10",
    coral: disabled
      ? "bg-rose-500 text-white border-rose-700"
      : "bg-rose-500 hover:bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-900/10",
    ghost: "bg-transparent hover:bg-emerald-50/60 text-slate-700 border-transparent shadow-none",
  }[variant];

  const tactileClasses = disabled
    ? "opacity-50 cursor-not-allowed border-b-2 active:border-b-2 active:translate-y-0"
    : "border-b-4 active:border-b-0 active:translate-y-1 cursor-pointer";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`font-extrabold select-none transition-all inline-flex items-center justify-center gap-2 ${sizeClasses} ${variantClasses} ${tactileClasses} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}
