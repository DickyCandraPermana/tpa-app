"use client";

import CourseCard from "@/components/CourseCard";
import { useEffect, useState } from "react";
import { getCourses, Course } from "@/lib/courses";
import { CourseProvider } from "@/context/CourseContext";
import { BookOpen } from "lucide-react";

const Courses = () => {
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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold text-slate-800">Materi Pembelajaran</h1>
          <p className="text-slate-500 font-medium">Pilih materi yang ingin kamu pelajari dan selesaikan tantangannya!</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Memuat daftar materi...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-slate-100 p-8">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Belum Ada Materi</h3>
            <p className="text-slate-500 text-sm mt-1">Materi pembelajaran sedang dipersiapkan oleh Ustaz/Ustazah.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </CourseProvider>
  );
};

export default Courses;
