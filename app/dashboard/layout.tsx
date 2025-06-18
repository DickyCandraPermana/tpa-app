"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { uid } = useAuth();

  useEffect(() => {
    if (!uid) {
      router.push("/login");
    }
  }, [uid, router]);
  return <>{children}</>;
}
