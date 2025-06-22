"use client";

import { JSX, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function dashboard() {
  const { uid } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!uid) {
      router.push("/login");
    } else {
      router.push("/dashboard/profile");
    }
  }, [uid, router]);

  return <></>;
}
