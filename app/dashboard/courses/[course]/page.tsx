"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourseById, Course } from "@/lib/courses";
import { ChevronLeft, BookOpen, Layers, Award, PlayCircle } from "lucide-react";

const CourseDetail = ({ params }: { params: Promise<{ course: string }> }) => {
  const { course } = React.use(params);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const { uid } = useAuth();
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
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Memuat detail materi...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 py-6 px-4">
      <button
        onClick={() => router.push("/dashboard/courses")}
        className="self-start flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
        <span>Kembali ke Daftar Materi</span>
      </button>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col">
        {/* Cover Image */}
        <div className="w-full h-64 md:h-80 relative bg-slate-100 overflow-hidden">
          <img
            src={courseData.imageUrl || "https://placehold.co/800x400/indigo/white?text=Materi+SibaQ"}
            alt={courseData.title || "Course Cover"}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <span className="px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 backdrop-blur-md rounded-full shadow-sm">
              {courseData.level || "Dasar"}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 md:p-10 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-indigo-600 uppercase tracking-wide">
              {courseData.category || "Tahsin / Hijaiyah"}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              {courseData.title || "Materi Pembelajaran"}
            </h1>
          </div>

          <p className="text-slate-600 leading-relaxed text-base md:text-lg">
            {courseData.description || "Pelajari materi ini dengan saksama dan jawab pertanyaan kuis interaktif untuk mengumpulkan poin!"}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Soal</p>
                <p className="text-base font-bold text-slate-800">{courseData.totalQuestions || "5"} Soal</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Reward</p>
                <p className="text-base font-bold text-slate-800">Poin Hadiah</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl col-span-2 sm:col-span-1">
              <Layers className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Tingkat</p>
                <p className="text-base font-bold text-slate-800">{courseData.level || "Santri Awal"}</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleTakeExam}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all cursor-pointer"
            >
              <PlayCircle className="w-6 h-6" />
              <span>Mulai Belajar & Kerjakan Kuis</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
