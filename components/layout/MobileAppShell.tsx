"use client";

import React from "react";
import AdaptiveTopBar from "@/components/layout/AdaptiveTopBar";
import AdaptiveBottomNav from "@/components/layout/AdaptiveBottomNav";
import { useAuth } from "@/context/AuthContext";

export interface MobileAppShellProps {
  children: React.ReactNode;
  showTopBar?: boolean;
  showBottomNav?: boolean;
}

export default function MobileAppShell({
  children,
  showTopBar = true,
  showBottomNav = true,
}: MobileAppShellProps) {
  const { role } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] flex justify-center items-start antialiased text-slate-800">
      {/* Decorative desktop backdrop glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block opacity-30 z-0">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
      </div>

      {/* Centered Mobile Container */}
      <div className="w-full max-w-md min-h-screen bg-[#FDFBF7] md:border-x md:border-[#F3E8D6] md:shadow-xl relative flex flex-col z-10 pb-24">
        {showTopBar && <AdaptiveTopBar />}
        <main className="flex-1 w-full px-4 py-4">{children}</main>
        {showBottomNav && <AdaptiveBottomNav role={role} />}
      </div>
    </div>
  );
}
