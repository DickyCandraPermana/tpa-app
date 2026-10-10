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
    <div className="min-h-screen w-full bg-[#FDFBF7] dark:bg-[#000000] flex justify-center items-start antialiased text-slate-800 dark:text-neutral-100 transition-colors duration-150">
      {/* Responsive Container (Mobile-First: max-w-md on mobile, expanding to max-w-4xl on tablet and max-w-5xl on desktop) */}
      <div className="w-full max-w-md md:max-w-4xl lg:max-w-5xl min-h-screen bg-[#FDFBF7] dark:bg-[#000000] md:border-x md:border-[#F3E8D6] dark:md:border-neutral-800 relative flex flex-col z-10 pb-24">
        {showTopBar && <AdaptiveTopBar />}
        <main className="flex-1 w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6">{children}</main>
        {showBottomNav && <AdaptiveBottomNav role={role} />}
      </div>
    </div>
  );
}
