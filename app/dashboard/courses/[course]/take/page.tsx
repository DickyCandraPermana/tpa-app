"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCourseQuestions, getCourseById } from "@/lib/services/courseService";
import { addPoints, markCourseCompleted } from "@/lib/services/userService";
import { useAuth } from "@/context/AuthContext";
import { useQuizSession } from "@/hooks/useQuizSession";
import { Course, Question } from "@/types/schema";
import QuestionCard from "@/components/QuestionCard";
import ScoreCelebration from "@/components/features/ScoreCelebration";
import TactileButton from "@/components/ui/TactileButton";
import TactileCard from "@/components/ui/TactileCard";
import GoldBadge from "@/components/ui/GoldBadge";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export default function TakeCoursePage({
  params,
}: {
  params: Promise<{ course: string }>;
}) {
  const { course } = React.use(params);
  const router = useRouter();
  const { uid, totalPoint, setTotalPoint } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedQuestions, fetchedCourse] = await Promise.all([
          getCourseQuestions(course),
          getCourseById(course),
        ]);

        if (fetchedQuestions?.length > 0) {
          setQuestions(fetchedQuestions);
        }
        if (fetchedCourse) {
          setCourseData(fetchedCourse);
        }
      } catch (error) {
        console.error("Error fetching course quiz data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [course]);

  const quiz = useQuizSession({
    questions,
    onAddPoints: async (pts) => {
      if (uid) {
        await addPoints(uid, pts);
        if (typeof totalPoint === "number") {
          setTotalPoint(totalPoint + pts);
        }
      }
    },
    onCompleteCourse: async () => {
      if (uid && course) {
        await markCourseCompleted(uid, course);
      }
    },
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-bold">Memuat arena kuis berkah...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6 bg-white rounded-3xl border-2 border-[#F3E8D6] shadow-xs max-w-sm mx-auto my-8">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-800">Belum Ada Soal Kuis</h2>
        <p className="text-slate-500 text-xs font-medium">
          Materi ini belum memiliki soal latihan. Coba pilih materi lain ya!
        </p>
        <TactileButton
          variant="primary"
          size="md"
          onClick={() => router.push("/dashboard/courses")}
        >
          Kembali ke Modul
        </TactileButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full select-none pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border-2 border-[#F3E8D6] shadow-xs">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/courses/${course}`)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <h1 className="text-xs sm:text-sm font-extrabold text-slate-800 text-center truncate max-w-[160px] sm:max-w-xs">
          {courseData?.title || "Latihan Kuis"}
        </h1>

        <GoldBadge type="coin" value={totalPoint || 0} size="sm" />
      </div>

      {/* Progress Bubbles Bar */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap bg-white p-2.5 rounded-2xl border border-[#F3E8D6]">
        {questions.map((_, idx) => {
          const isAnswered = quiz.selectedAnswers[idx] !== undefined;
          const isCorrect = quiz.isCorrectMap[idx];
          const isCurrent = idx === quiz.currentIndex;

          let bubbleStyle = "bg-slate-50 text-slate-400 border-slate-200";
          if (isCurrent) {
            bubbleStyle = "bg-amber-400 text-amber-950 border-b-2 border-amber-600 ring-2 ring-amber-300 scale-105 font-black";
          } else if (isAnswered) {
            bubbleStyle = isCorrect
              ? "bg-emerald-600 text-white border-emerald-800"
              : "bg-rose-500 text-white border-rose-700";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => quiz.setCurrentIndex(idx)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-extrabold text-xs border flex items-center justify-center transition-all cursor-pointer ${bubbleStyle}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      {quiz.currentQuestion && (
        <QuestionCard
          question={quiz.currentQuestion}
          currentIndex={quiz.currentIndex}
          totalQuestions={quiz.totalQuestions}
          onOptionClick={quiz.handleAnswerClick}
          selected={quiz.selectedAnswers[quiz.currentIndex] || null}
          isAnswered={quiz.isCurrentAnswered}
          isCorrect={quiz.isCurrentCorrect}
        />
      )}

      {/* Bottom Footer Navigation */}
      <div className="flex items-center justify-between gap-3 mt-1">
        <TactileButton
          variant="secondary"
          size="sm"
          onClick={quiz.handlePrev}
          disabled={quiz.currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </TactileButton>

        {quiz.isLastQuestion ? (
          <TactileButton
            variant="accent"
            size="md"
            onClick={quiz.handleFinishQuiz}
            disabled={quiz.isSubmitting}
          >
            {quiz.isSubmitting ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <span>Kumpulkan</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </TactileButton>
        ) : (
          <TactileButton
            variant="primary"
            size="md"
            onClick={quiz.handleNext}
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </TactileButton>
        )}
      </div>

      {/* Score Celebration Modal */}
      <ScoreCelebration
        isOpen={quiz.isQuizCompleted}
        scorePercent={quiz.results.scorePercent}
        correctCount={quiz.results.correctCount}
        totalQuestions={quiz.totalQuestions}
        sessionPoints={quiz.sessionPoints}
        onRestart={quiz.handleRestartQuiz}
        onContinue={() => router.push("/dashboard")}
      />
    </div>
  );
}
