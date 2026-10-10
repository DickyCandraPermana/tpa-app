"use client";

import React, { useEffect, useState, useMemo } from "react";
import CourseCard from "@/components/CourseCard";
import { getCourses, Course } from "@/lib/courses";
import { CourseProvider } from "@/context/CourseContext";
import ArabicText from "@/components/ui/ArabicText";
import { BookOpen, Sparkles, Search, X, RotateCcw } from "lucide-react";

const CATEGORIES = ["Semua", "Hijaiyah", "Tahsin", "Tajwid", "Adab"] as const;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const query = searchQuery.trim().toLowerCase();

      // 1. Category filter
      const matchesCategory =
        selectedCategory === "Semua" ||
        (course.category &&
          course.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (course.title &&
          course.title.toLowerCase().includes(selectedCategory.toLowerCase()));

      // 2. Search query filter
      const matchesQuery =
        query === "" ||
        course.title.toLowerCase().includes(query) ||
        (course.description &&
          course.description.toLowerCase().includes(query)) ||
        (course.category &&
          course.category.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [courses, selectedCategory, searchQuery]);

  const handleResetFilter = () => {
    setSelectedCategory("Semua");
    setSearchQuery("");
  };

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

        {/* Filter Controls: Search & Category Chips */}
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari modul materi..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#F3E8D6] rounded-2xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-700 text-white shadow-xs border border-emerald-800"
                      : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 border border-[#F3E8D6]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
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
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-3xl border border-[#F3E8D6] p-8 shadow-xs">
            <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">Tidak Ada Modul Ditemukan</h3>
            <p className="text-slate-500 text-xs font-medium mt-1 max-w-xs">
              Tidak ada modul yang cocok dengan kata kunci &quot;{searchQuery || selectedCategory}&quot;.
            </p>
            <button
              type="button"
              onClick={handleResetFilter}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </CourseProvider>
  );
}
