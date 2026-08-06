"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserProgress } from "@/context/UserProgressContext";
import { getCourseById } from "@/lib/courses";
import { getCourseQuestions } from "@/lib/courses";
import QuestionCard from "@/components/QuestionCard";
import PointBadge from "@/components/PointBadge";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

type Question = {
  id: string;
  correctAnswer: string;
  courseId: string;
  options: string[];
  points: number;
  prompt: string;
  tags: string[];
  type: string;
};

type Course = {
  id: string;
  title?: string;
};

const ExamPage = ({ params }: { params: Promise<{ course: string }> }) => {
  const { uid } = useAuth();
  const { addPoints } = useUserProgress();
  const [questions, setQuestions] = useState<Question[]>([]);
  const { course } = React.use(params);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State for tracking answered questions
  const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: string }>({});
  const [isCorrectMap, setIsCorrectMap] = useState<{ [index: number]: boolean }>({});
  
  const [courseData, setCourseData] = useState<Course>();
  const [loading, setLoading] = useState(true);

  // Use useMemo so we don't need to manually sync state when questions array changes
  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);

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
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [course]);

  const handleAnswerClick = (selected: string) => {
    // If already answered correctly, don't do anything (prevent double points)
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
      // Gamification: Add points
      addPoints(currentQuestion.points || 1);
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
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center font-bold text-slate-500 text-xl">Loading Quiz...</div>;
  }

  if (questions.length === 0) {
    return <div className="flex h-full items-center justify-center flex-col gap-4">
      <div className="text-6xl">🤔</div>
      <h2 className="text-2xl font-bold text-slate-700">Kuis Belum Tersedia</h2>
      <p className="text-slate-500">Materi ini belum punya pertanyaan.</p>
    </div>;
  }

  const answeredCorrectly = isCorrectMap[currentIndex];
  const answeredWrong = isCorrectMap[currentIndex] === false;

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full min-h-[80vh] rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Quiz Header */}
      <div className="flex justify-between items-center p-6 bg-white border-b border-slate-100 z-10">
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-800">
          {courseData?.title || "Kuis Interaktif"}
        </h1>
        <PointBadge />
      </div>

      {/* Main Quiz Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-8 relative">
        
        {/* Feedback visual for correct/wrong */}
        {answeredCorrectly && (
          <div className="absolute top-10 flex items-center gap-2 bg-green-100 text-green-700 px-6 py-2 rounded-full font-bold animate-bounce z-20 shadow-sm border border-green-200">
            <CheckCircle className="w-5 h-5" /> Hebat! Jawabanmu Benar!
          </div>
        )}
        {answeredWrong && (
          <div className="absolute top-10 flex items-center gap-2 bg-red-100 text-red-600 px-6 py-2 rounded-full font-bold animate-pulse z-20 shadow-sm border border-red-200">
            <XCircle className="w-5 h-5" /> Ups! Coba lagi ya.
          </div>
        )}

        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion.prompt}
            options={currentQuestion.options}
            answer={currentQuestion.correctAnswer}
            selected={selectedAnswers[currentIndex] || null}
            imageUrl=""
            audioUrl=""
            onOptionClick={handleAnswerClick}
          />
        )}
      </div>

      {/* Footer Navigation */}
      <div className="bg-white p-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
        <button 
          type="button" 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" /> Sebelumnya
        </button>
        
        {/* Progress Tracker Bubbles */}
        <div className="flex flex-wrap gap-3 justify-center">
          {questions.map((_, idx) => {
            const isCurrent = idx === currentIndex;
            const isCorrect = isCorrectMap[idx] === true;
            const isWrong = isCorrectMap[idx] === false;
            
            let bubbleClass = "bg-slate-100 text-slate-400 border-slate-200";
            if (isCurrent) bubbleClass = "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-110";
            else if (isCorrect) bubbleClass = "bg-green-100 text-green-600 border-green-300";
            else if (isWrong) bubbleClass = "bg-red-100 text-red-500 border-red-300";
            
            return (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-12 h-12 rounded-full border-2 font-extrabold text-lg flex items-center justify-center transition-all duration-200 hover:scale-105 ${bubbleClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <button 
          type="button" 
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
          className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Selanjutnya <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ExamPage;
