"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import GoldBadge from "@/components/ui/GoldBadge";
import { BookOpen, ListChecks, Play } from "lucide-react";

export default function CourseCard({ course }: { course: any }) {
  const router = useRouter();
  const { uid, completedCourse } = useAuth();

  const handleCardClick = () => {
    if (uid) {
      router.push(`/dashboard/courses/${course.id}`);
    } else {
      router.push("/login");
    }
  };

  const imageUrl =
    course.imageUrl &&
    typeof course.imageUrl === "string" &&
    (course.imageUrl.startsWith("http://") || course.imageUrl.startsWith("https://"))
      ? course.imageUrl
      : "/assets/missing_image.png";

  const isCompleted = completedCourse?.includes(course.id);

  return (
    <TactileCard className="group flex flex-col overflow-hidden bg-white hover:border-emerald-500/50 transition-all">
      {/* Cover image */}
      <div className="relative h-40 w-full bg-emerald-50/50 overflow-hidden border-b border-[#F3E8D6]">
        <Image
          src={imageUrl}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Level badge overlay */}
        <div className="absolute top-3 right-3 z-10">
          <span className="px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider bg-white/95 text-emerald-800 rounded-full border border-emerald-200/80 shadow-xs">
            {course.level || "Pemula"}
          </span>
        </div>

        {isCompleted && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 text-xs font-black bg-emerald-600 text-white rounded-full shadow-xs">
              ✓ Selesai
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {course.title}
          </h2>
          <p className="text-slate-500 text-xs font-medium line-clamp-2 mt-1">
            {course.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F3E8D6]">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
            <ListChecks className="w-4 h-4 text-emerald-600" />
            <span>{course.totalQuestions || 0} Soal</span>
          </div>

          <GoldBadge type="coin" value={`${course.point || 10} Poin`} size="sm" />
        </div>

        <TactileButton
          fullWidth
          size="sm"
          variant={isCompleted ? "secondary" : "primary"}
          onClick={handleCardClick}
          className="mt-1"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{isCompleted ? "Pelajari Lagi" : "Mulai Belajar"}</span>
        </TactileButton>
      </div>
    </TactileCard>
  );
}
