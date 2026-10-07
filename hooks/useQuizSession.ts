"use client";

import { useState, useCallback } from "react";
import { Question } from "@/types/schema";

export interface QuizResults {
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  isPerfectScore: boolean;
}

export function calculateQuizResults(
  isCorrectMap: { [key: number]: boolean },
  totalQuestions: number
): QuizResults {
  const correctCount = Object.values(isCorrectMap).filter(Boolean).length;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  return {
    correctCount,
    totalQuestions,
    scorePercent,
    isPerfectScore: scorePercent === 100,
  };
}

interface UseQuizSessionProps {
  questions: Question[];
  onAddPoints: (points: number) => Promise<void>;
  onCompleteCourse: () => Promise<void>;
}

export function useQuizSession({
  questions,
  onAddPoints,
  onCompleteCourse,
}: UseQuizSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [isCorrectMap, setIsCorrectMap] = useState<{ [key: number]: boolean }>({});
  const [sessionPoints, setSessionPoints] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || null;
  const isCurrentAnswered = selectedAnswers[currentIndex] !== undefined;
  const isCurrentCorrect = !!isCorrectMap[currentIndex];
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleAnswerClick = useCallback(
    (selected: string) => {
      if (!currentQuestion) return;
      // Prevent duplicate points if already answered correctly
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
        onAddPoints(points);
      } else {
        setIsCorrectMap((prev) => ({
          ...prev,
          [currentIndex]: false,
        }));
      }
    },
    [currentQuestion, currentIndex, isCorrectMap, onAddPoints]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFinishQuiz = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onCompleteCourse();
    } catch (err) {
      console.error("Error completing course:", err);
    } finally {
      setIsSubmitting(false);
      setIsQuizCompleted(true);
    }
  }, [onCompleteCourse]);

  const handleRestartQuiz = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsCorrectMap({});
    setSessionPoints(0);
    setIsQuizCompleted(false);
  }, []);

  const results = calculateQuizResults(isCorrectMap, totalQuestions);

  return {
    currentIndex,
    setCurrentIndex,
    currentQuestion,
    totalQuestions,
    isCurrentAnswered,
    isCurrentCorrect,
    isLastQuestion,
    selectedAnswers,
    isCorrectMap,
    sessionPoints,
    isQuizCompleted,
    isSubmitting,
    results,
    handleAnswerClick,
    handleNext,
    handlePrev,
    handleFinishQuiz,
    handleRestartQuiz,
  };
}
