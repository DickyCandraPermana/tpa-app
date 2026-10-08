"use client";

import React from "react";

export interface ArabicTextProps {
  text?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export default function ArabicText({
  text = "",
  size = "lg",
  className = "",
}: ArabicTextProps) {
  const sizeClasses = {
    sm: "text-2xl leading-relaxed",
    md: "text-3xl leading-relaxed",
    lg: "text-4xl leading-loose",
    xl: "text-5xl leading-loose",
    "2xl": "text-6xl md:text-7xl leading-loose",
  }[size];

  return (
    <span
      dir="rtl"
      lang="ar"
      className={`font-amiri font-bold select-none text-slate-900 inline-block text-center ${sizeClasses} ${className}`}
    >
      {text}
    </span>
  );
}
