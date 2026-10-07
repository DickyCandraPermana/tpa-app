"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string | null;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function ToastNotification({
  message,
  type = "success",
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  let bg = "bg-emerald-600 text-white";
  let icon = <CheckCircle2 className="w-5 h-5 shrink-0" />;

  if (type === "error") {
    bg = "bg-rose-600 text-white";
    icon = <AlertCircle className="w-5 h-5 shrink-0" />;
  } else if (type === "info") {
    bg = "bg-indigo-600 text-white";
    icon = <Info className="w-5 h-5 shrink-0" />;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-md ${bg}`}
      >
        {icon}
        <span className="font-bold text-sm md:text-base">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
