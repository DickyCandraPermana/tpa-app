"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LearningMapNode from "@/components/features/LearningMapNode";
import SantriProgressCard from "@/components/features/SantriProgressCard";
import TactileButton from "@/components/ui/TactileButton";
import TactileCard from "@/components/ui/TactileCard";
import ArabicText from "@/components/ui/ArabicText";
import GoldBadge from "@/components/ui/GoldBadge";
import { getCourses, Course } from "@/lib/courses";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Gift,
  CheckCircle2,
  Users,
  Compass,
} from "lucide-react";

interface PathNode {
  level: number;
  id: string;
  title: string;
  arabic?: string;
  align: "left" | "center" | "right";
}

const DEFAULT_PATH_NODES: PathNode[] = [
  {
    level: 1,
    id: "hijaiyah-dasar",
    title: "Huruf Hijaiyah Alif - Ya",
    arabic: "ا ب ت",
    align: "center",
  },
  {
    level: 2,
    id: "harakat-dasar",
    title: "Harakat Fathah & Kasrah",
    arabic: "َ ِ ُ",
    align: "left",
  },
  {
    level: 3,
    id: "tanwin-sukun",
    title: "Tanwin & Sukun",
    arabic: "ً ٍ ٌ",
    align: "right",
  },
  {
    level: 4,
    id: "tasydid-nun-mati",
    title: "Tasydid & Nun Mati",
    arabic: "ّ نْ",
    align: "left",
  },
  {
    level: 5,
    id: "mad-qalqalah",
    title: "Mad & Qalqalah",
    arabic: "ق ط ب",
    align: "right",
  },
  {
    level: 6,
    id: "ayat-pendek",
    title: "Membaca Ayat Pendek",
    arabic: "اقْرَأْ",
    align: "center",
  },
];

export default function DashboardPage() {
  const { uid, username, role, totalPoint, completedCourse } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [ustadzNotice, setUstadzNotice] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoursesList = async () => {
      try {
        const fetched = await getCourses();
        setCourses(fetched);
      } catch (e) {
        console.error("Error fetching courses:", e);
      }
    };
    fetchCoursesList();
  }, []);

  const isUstadz = role === "ustadz" || role === "ustaz" || role === "admin";

  // Mock santri list for Ustadz monitoring view
  const santriList = [
    { id: "s1", name: "Muhammad Faris", jilid: "Jilid 2", page: 18, totalPages: 30, completed: 18 },
    { id: "s2", name: "Aisyah Humaira", jilid: "Jilid 3", page: 24, totalPages: 30, completed: 24 },
    { id: "s3", name: "Salman Al-Farisi", jilid: "Jilid 1", page: 12, totalPages: 30, completed: 12 },
    { id: "s4", name: "Khadijah Azzahra", jilid: "Jilid 4", page: 5, totalPages: 30, completed: 5 },
  ];

  if (isUstadz) {
    return (
      <div className="flex flex-col gap-6 w-full select-none pb-8">
        {/* Header Ustadz */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Halaqah Abu Bakar Ash-Shiddiq
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Pantau progres mengaji santri dan verifikasi klaim hadiah koin berkah
          </p>
        </div>

        {ustadzNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{ustadzNotice}</span>
          </div>
        )}

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <TactileCard className="p-4 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Santri Aktif</span>
            <span className="text-2xl font-black text-emerald-800">4 Santri</span>
          </TactileCard>

          <TactileCard className="p-4 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Klaim Menunggu</span>
            <span className="text-2xl font-black text-amber-600">2 Hadiah</span>
          </TactileCard>
        </div>

        {/* Action Shortcuts */}
        <div className="grid grid-cols-2 gap-3">
          <TactileButton
            variant="secondary"
            size="sm"
            onClick={() => router.push("/dashboard/courses")}
          >
            <BookOpen className="w-4 h-4" />
            <span>Modul Ajar</span>
          </TactileButton>

          <TactileButton
            variant="accent"
            size="sm"
            onClick={() => router.push("/dashboard/exchange")}
          >
            <Gift className="w-4 h-4" />
            <span>Klaim Hadiah</span>
          </TactileButton>
        </div>

        {/* Daftar Santri Progres */}
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Pemantauan Progres Santri</span>
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {santriList.map((santri) => (
              <SantriProgressCard
                key={santri.id}
                santriName={santri.name}
                jilid={santri.jilid}
                page={santri.page}
                totalPages={santri.totalPages}
                completedCount={santri.completed}
                onUpdateProgress={() =>
                  setUstadzNotice(`Progres santri ${santri.name} berhasil diperbarui!`)
                }
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SANTRI VIEW (Gamified Learning Map)
  return (
    <div className="flex flex-col gap-6 w-full select-none pb-12">
      {/* Hero Greetings Card */}
      <TactileCard className="p-5 bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <ArabicText text="أَهْلًا بِكَ" size="sm" className="text-emerald-900" />
          <GoldBadge type="star" value={`${completedCourse?.length || 0} Selesai`} />
        </div>

        <h1 className="text-xl font-black text-slate-900 mb-1">
          Assalamu’alaikum, {username || "Sobat Santri"}! 🌿
        </h1>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Ayo lanjutkan petualangan mengaji hari ini! Kumpulkan lentera istiqomah dan raih koin berkah sebanyak-banyaknya.
        </p>

        <div className="mt-4 pt-3 border-t border-[#F3E8D6] flex items-center justify-between text-xs font-bold text-emerald-800">
          <span>Koin Berkah Kamu:</span>
          <span className="text-base font-extrabold text-amber-700">{totalPoint || 0} 🪙</span>
        </div>
      </TactileCard>

      {/* Map Section Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Peta Petualangan Mengaji</span>
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Selesaikan tiap level untuk membuka maqam berikutnya!
          </p>
        </div>

        <TactileButton
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/courses")}
          className="text-xs"
        >
          <span>Daftar Modul</span>
        </TactileButton>
      </div>

      {/* Gamified Curved Map Container */}
      <div className="relative py-4 flex flex-col items-center gap-8 w-full">
        {/* Curving dashed guideline behind nodes */}
        <div className="absolute top-10 bottom-10 w-0 border-r-4 border-dashed border-[#E2D4BE] pointer-events-none z-0" />

        {DEFAULT_PATH_NODES.map((node, index) => {
          const isDone = completedCourse?.includes(node.id) || index === 0;
          // Determine status
          let status: "completed" | "current" | "locked" = "locked";
          if (completedCourse?.includes(node.id)) {
            status = "completed";
          } else if (index === 0 || (completedCourse && completedCourse.includes(DEFAULT_PATH_NODES[index - 1]?.id))) {
            status = "current";
          } else if (index === 1 && (!completedCourse || completedCourse.length === 0)) {
            // First pending
            status = "current";
          }

          const targetCourseId = courses[index]?.id || courses[0]?.id || "jilid-1";

          return (
            <div key={node.id} className="w-full flex justify-center z-10">
              <LearningMapNode
                level={node.level}
                title={node.title}
                arabic={node.arabic}
                status={status}
                stars={status === "completed" ? 3 : 0}
                align={node.align}
                onClick={() => {
                  if (status !== "locked") {
                    router.push(`/dashboard/courses/${targetCourseId}/take`);
                  }
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
