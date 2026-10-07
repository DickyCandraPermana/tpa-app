"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCourseQuestions, getCourseById, Course, Question } from "@/lib/courses";
import QuestionCard from "@/components/QuestionCard";
import PointBadge from "@/components/PointBadge";
import { useUserProgress } from "@/context/UserProgressContext";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Trophy,
  RotateCcw,
  BookOpen,
  User,
  Sparkles,
} from "lucide-react";

export default function TakeCoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course } = React.use(params);
  const router = useRouter();
  const { addPoints, completeCourse } = useUserProgress();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Gamification & Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isCorrectMap, setIsCorrectMap] = useState<{ [key: number]: boolean }>({});
  const [sessionPoints, setSessionPoints] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedQuestions, fetchedCourse] = await Promise.all([
          getCourseQuestions(course as string),
          getCourseById(course as string),
        ]);

        if (fetchedQuestions?.length > 0) {
          setQuestions(fetchedQuestions);
        }
        if (fetchedCourse) setCourseData(fetchedCourse);
      } catch (error) {
        console.error("Error fetching course quiz data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [course]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold">Memuat soal-soal seru...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-lg mx-auto mt-12">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Belum Ada Soal</h2>
        <p className="text-slate-500">Materi ini belum memiliki soal latihan. Coba pilih materi lain ya!</p>
        <button
          onClick={() => router.push("/dashboard/courses")}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md"
        >
          Kembali ke Daftar Materi
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCurrentAnswered = selectedAnswers[currentIndex] !== undefined;
  const isCurrentCorrect = !!isCorrectMap[currentIndex];

  const handleAnswerClick = (selected: string) => {
    // If already correctly answered, prevent duplicate points
    if (isCorrectMap[currentIndex]) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: selected,
    }));

    const isCorrect = selected === currentQuestion.correctAnswer;
    if (isCorrect) {
      setIsCorrectMap((prev) => ({
        ...prev,
        [currentIndex]: true,
      }));
      const points = currentQuestion.points || 1;
      setSessionPoints((prev) => prev + points);
      addPoints(points);
    } else {
      setIsCorrectMap((prev) => ({
        ...prev,
        [currentIndex]: false,
      }));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleFinishQuiz = async () => {
    setIsSubmitting(true);
    try {
      if (course) {
        await completeCourse(course as string);
      }
      setIsQuizCompleted(true);
    } catch (error) {
      console.error("Failed to complete course:", error);
      setIsQuizCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsCorrectMap({});
    setSessionPoints(0);
    setIsQuizCompleted(false);
  };

  const totalQuestions = questions.length;
  const correctCount = Object.values(isCorrectMap).filter(Boolean).length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  // Result Summary View
  if (isQuizCompleted) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-10 px-4 animate-fade-in">
        <div className="w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Trophy Icon */}
          <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-3xl flex items-center justify-center shadow-lg shadow-amber-200/50 mb-6 animate-bounce">
            <Trophy className="w-12 h-12 text-amber-900" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-extrabold rounded-full border border-emerald-200 mb-3">
            <Sparkles className="w-4 h-4" /> Materi Selesai!
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2">
            Alhamdulillah, Hebat Sekali!
          </h1>
          <p className="text-slate-500 font-medium mb-8 max-w-md">
            Kamu telah menyelesaikan latihan materi <span className="font-bold text-slate-700">{courseData?.title || "ini"}</span> dengan sangat baik!
          </p>

          {/* Score Card */}
          <div className="grid grid-cols-3 gap-4 w-full mb-8">
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Nilai</span>
              <span className="text-2xl md:text-3xl font-extrabold text-indigo-600">{scorePercent}%</span>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Benar</span>
              <span className="text-2xl md:text-3xl font-extrabold text-emerald-700">{correctCount} / {totalQuestions}</span>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">Poin Baru</span>
              <span className="text-2xl md:text-3xl font-extrabold text-amber-700">+{sessionPoints} ⭐</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={handleRestartQuiz}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" /> Ulangi Soal
            </button>
            <button
              onClick={() => router.push("/dashboard/courses")}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all cursor-pointer"
            >
              <BookOpen className="w-5 h-5" /> Materi Lain
            </button>
            <button
              onClick={() => router.push("/dashboard/profile")}
              className="flex items-center justify-center gap-2 py-3.5 px-5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-200 transition-all cursor-pointer"
            >
              <User className="w-5 h-5" /> Profil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 py-6 px-4">
      {/* Top Header: Navigation & Realtime Points */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <button
          onClick={() => router.push(`/dashboard/courses/${course}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Kembali ke Detail</span>
        </button>

        <h1 className="text-lg md:text-xl font-extrabold text-slate-800 text-center truncate max-w-xs md:max-w-md">
          {courseData?.title || "Latihan Materi"}
        </h1>

        <PointBadge />
      </div>

      {/* Question Progress Bubbles */}
      <div className="flex items-center justify-center gap-2 flex-wrap bg-white p-4 rounded-2xl border border-slate-100">
        {questions.map((_, idx) => {
          const isAnswered = selectedAnswers[idx] !== undefined;
          const isCorrect = isCorrectMap[idx];
          const isCurrent = idx === currentIndex;

          let bubbleStyle = "bg-slate-100 text-slate-500 border-slate-200";
          if (isCurrent) {
            bubbleStyle = "bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-100 scale-110";
          } else if (isAnswered) {
            bubbleStyle = isCorrect
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-rose-500 text-white border-rose-500";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`w-9 h-9 rounded-xl font-bold text-sm border flex items-center justify-center transition-all cursor-pointer ${bubbleStyle}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Card Component */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <QuestionCard
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={totalQuestions}
          onOptionClick={handleAnswerClick}
          selected={selectedAnswers[currentIndex] || null}
          isAnswered={isCurrentAnswered}
          isCorrect={isCurrentCorrect}
        />
      </div>

      {/* Bottom Footer Navigation */}
      <div className="flex items-center justify-between gap-4 mt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" /> Sebelumnya
        </button>

        {isLastQuestion ? (
          <button
            type="button"
            onClick={handleFinishQuiz}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3.5 font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <span>Selesai & Kumpulkan</span>
                <CheckCircle2 className="w-5 h-5" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-2xl transition-all cursor-pointer"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
