"use client";

import React, { useEffect, useState } from "react";
import CourseCard from "@/components/CourseCard";
import { getCourses, Course } from "@/lib/courses";
import { CourseProvider } from "@/context/CourseContext";
import ArabicText from "@/components/ui/ArabicText";
import { BookOpen, Sparkles } from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await getCourses();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <CourseProvider>
      <div className="flex flex-col gap-6 w-full select-none pb-12">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-extrabold text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Modul Iqro &amp; Tajwid</span>
            </div>
            <ArabicText text="اقْرَأْ" size="sm" className="text-emerald-900" />
          </div>

          <h1 className="text-2xl font-black text-slate-900">
            Ruang Belajar Santri
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Pilih modul materi yang ingin kamu pelajari dan taklukkan kuisnya!
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-xs font-bold">Memuat daftar materi...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border-2 border-[#F3E8D6] p-8 shadow-xs">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-800">Belum Ada Modul Materi</h3>
            <p className="text-slate-500 text-xs font-medium mt-1">
              Materi pembelajaran sedang dipersiapkan oleh Ustadz/Ustazah.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </CourseProvider>
  );
}
