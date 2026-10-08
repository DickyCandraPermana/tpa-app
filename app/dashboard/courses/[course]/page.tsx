"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourseById, Course } from "@/lib/courses";
import TactileCard from "@/components/ui/TactileCard";
import TactileButton from "@/components/ui/TactileButton";
import GoldBadge from "@/components/ui/GoldBadge";
import ArabicText from "@/components/ui/ArabicText";
import { ArrowLeft, BookOpen, Layers, PlayCircle, Sparkles } from "lucide-react";
import Image from "next/image";

export default function CourseDetail({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course } = React.use(params);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { uid, completedCourse } = useAuth();
  const router = useRouter();

  const handleTakeExam = () => {
    if (uid) {
      router.push(`/dashboard/courses/${course}/take`);
    } else {
      router.push("/login");
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const fetchedCourse = await getCourseById(course);
        if (fetchedCourse) {
          setCourseData(fetchedCourse);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [course]);

  if (loading || !courseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-bold">Memuat detail materi...</p>
      </div>
    );
  }

  const isCompleted = completedCourse?.includes(course);
  const imageUrl =
    courseData.imageUrl &&
    (courseData.imageUrl.startsWith("http://") || courseData.imageUrl.startsWith("https://"))
      ? courseData.imageUrl
      : "/assets/missing_image.png";

  return (
    <div className="flex flex-col gap-5 w-full select-none pb-12">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.push("/dashboard/courses")}
        className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Daftar Materi</span>
      </button>

      <TactileCard className="overflow-hidden bg-white p-0">
        {/* Cover Image Banner */}
        <div className="w-full h-48 sm:h-56 relative bg-emerald-50 overflow-hidden border-b border-[#F3E8D6]">
          <Image
            src={imageUrl}
            alt={courseData.title || "Course Cover"}
            fill
            className="object-cover"
          />

          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-white/95 rounded-full border border-emerald-200/80 shadow-xs">
              {courseData.level || "Dasar"}
            </span>
          </div>

          {isCompleted && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 text-xs font-black bg-emerald-600 text-white rounded-full shadow-xs">
                ✓ Sudah Lulus
              </span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {courseData.category || "Tahsin / Hijaiyah"}
              </span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 mt-1">
              {courseData.title || "Materi Pembelajaran"}
            </h1>
          </div>

          <p className="text-slate-600 text-sm leading-relaxed font-medium">
            {courseData.description ||
              "Pelajari materi ini dengan saksama dan jawab pertanyaan kuis interaktif untuk mengumpulkan poin berkah!"}
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#F3E8D6]">
            <div className="p-3 bg-[#FDFBF7] border border-[#F3E8D6] rounded-2xl flex flex-col items-center text-center">
              <BookOpen className="w-4 h-4 text-emerald-700 mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Soal</span>
              <span className="text-sm font-black text-slate-800">
                {courseData.totalQuestions || "5"} Soal
              </span>
            </div>

            <div className="p-3 bg-[#FDFBF7] border border-[#F3E8D6] rounded-2xl flex flex-col items-center text-center">
              <Sparkles className="w-4 h-4 text-amber-600 mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Hadiah</span>
              <span className="text-sm font-black text-amber-700">
                +{(courseData.totalQuestions || 5) * 2} 🪙
              </span>
            </div>

            <div className="p-3 bg-[#FDFBF7] border border-[#F3E8D6] rounded-2xl flex flex-col items-center text-center">
              <Layers className="w-4 h-4 text-emerald-700 mb-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tingkat</span>
              <span className="text-sm font-black text-slate-800">
                {courseData.level || "Santri"}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <TactileButton
              fullWidth
              variant="primary"
              size="lg"
              onClick={handleTakeExam}
            >
              <PlayCircle className="w-5 h-5" />
              <span>{isCompleted ? "Ulangi & Uji Kemampuan" : "Mulai Belajar & Kerjakan Kuis"}</span>
            </TactileButton>
          </div>
        </div>
      </TactileCard>
    </div>
  );
}
