"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  BookOpen,
  Target,
  Gift,
  User,
  Users,
  BookMarked,
  ShieldCheck,
  Settings,
} from "lucide-react";

export interface AdaptiveBottomNavProps {
  role?: string | null;
  activePath?: string;
}

export default function AdaptiveBottomNav({
  role = "santri",
  activePath,
}: AdaptiveBottomNavProps) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname ?? "/dashboard";

  const isUstaz = role === "ustaz" || role === "admin";

  const santriNav = [
    { label: "Peta", href: "/dashboard", icon: Map },
    { label: "Materi", href: "/dashboard/courses", icon: BookOpen },
    { label: "Kuis", href: "/dashboard/courses", icon: Target },
    { label: "Toko", href: "/dashboard/exchange", icon: Gift },
    { label: "Profil", href: "/dashboard/profile", icon: User },
  ];

  const ustazNav = [
    { label: "Progres", href: "/dashboard", icon: Users },
    { label: "Modul", href: "/dashboard/courses", icon: BookMarked },
    { label: "Klaim", href: "/dashboard/exchange", icon: ShieldCheck },
    { label: "Akun", href: "/dashboard/profile", icon: Settings },
  ];

  const navItems = isUstaz ? ustazNav : santriNav;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full z-40 bg-white/95 backdrop-blur-md border-t border-[#F3E8D6] rounded-t-3xl shadow-lg px-2 py-2 flex items-center justify-around">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive =
          currentPath === item.href ||
          (item.href !== "/dashboard" && currentPath.startsWith(item.href));

        return (
          <Link
            key={idx}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isActive
                ? "text-emerald-700 font-extrabold scale-105"
                : "text-slate-400 hover:text-slate-600 font-semibold"
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-colors ${
                isActive ? "bg-emerald-50 text-emerald-700" : ""
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
