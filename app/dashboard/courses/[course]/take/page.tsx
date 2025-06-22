"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getCourseById } from "@/lib/courses";
import { getCourseQuestions } from "@/lib/courses";
import QuestionCard from "@/components/QuestionCard";

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
  imageUrl?: string;
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  totalQuestions?: number;
};

const ExamPage = ({ params }: { params: Promise<{ course: string }> }) => {
  const { uid } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const { course } = React.use(params);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    questions[currentIndex]
  );
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [index: number]: string;
  }>({});
  const [courseData, setCourseData] = useState<Course>();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleAnswerClick = (selected: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: selected,
    }));
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? questions.length - 1 : prevIndex - 1;
      return newIndex;
    });
    setSelectedAnswer(null);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex === questions.length - 1 ? 0 : prevIndex + 1;
      return newIndex;
    });
    setSelectedAnswer(null);
  };

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
      }
    };

    fetchData();
  }, [course]);

  return (
    <>
      <div className="flex justify-between my-4">
        <button type="button" onClick={handlePrev}>
          <i className="fa fa-arrow-left">Left</i>
        </button>
        <div> {courseData?.title} </div>
        <button type="button" onClick={handleNext}>
          <i className="fa fa-arrow-right">Right</i>
        </button>
      </div>

      {currentQuestion && (
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion.prompt}
          options={currentQuestion.options}
          answer={currentQuestion.correctAnswer}
          selected={selectedAnswers[currentIndex]}
          imageUrl=""
          audioUrl=""
          onOptionClick={handleAnswerClick}
        />
      )}

      <div className="mt-6 flex flex-wrap gap-2 justify-center">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setCurrentQuestion(questions[idx]);
              setSelectedAnswer(null);
            }}
            className={`
        w-10 h-10 rounded-full border
        ${idx === currentIndex ? "bg-blue-500 text-white" : ""}
        ${selectedAnswers[idx] ? "border-green-500" : "border-gray-300"}
      `}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </>
  );
};

export default ExamPage;
