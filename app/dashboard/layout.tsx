"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import MobileAppShell from "@/components/layout/MobileAppShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { uid, loading } = useAuth();

  useEffect(() => {
    if (!uid && !loading) {
      router.push("/login");
    }
  }, [uid, loading, router]);

  return <MobileAppShell>{children}</MobileAppShell>;
}
