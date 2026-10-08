"use client";

import React from "react";
import { Question } from "@/types/schema";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  onOptionClick: (selected: string) => void;
  selected: string | null;
  isAnswered?: boolean;
  isCorrect?: boolean;
}

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  onOptionClick,
  selected,
  isAnswered = false,
  isCorrect = false,
}: QuestionCardProps) {
  const questionText = question.prompt || question.question || "Pilihlah jawaban yang benar:";
  const isArabicQuestion = /[\u0600-\u06FF]/.test(questionText);

  return (
    <div className="flex flex-col gap-5 w-full select-none">
      {/* Header status */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Soal {currentIndex + 1}</span>
        </h2>
        <span className="text-xs font-extrabold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
          {currentIndex + 1} dari {totalQuestions}
        </span>
      </div>

      {/* Image if available */}
      {question.imageUrl && (
        <div className="flex justify-center p-3 bg-amber-50/50 rounded-2xl border border-amber-100 max-w-xs mx-auto">
          <img
            src={question.imageUrl}
            alt="Ilustrasi Soal"
            className="max-h-40 object-contain rounded-xl"
          />
        </div>
      )}

      {/* Question Prompt */}
      <div className="p-5 bg-white border-2 border-[#F3E8D6] rounded-3xl shadow-xs">
        <p
          dir={isArabicQuestion ? "rtl" : "ltr"}
          className={`font-extrabold text-slate-800 text-center leading-relaxed ${
            isArabicQuestion
              ? "font-amiri text-4xl py-3 text-emerald-900"
              : "text-xl md:text-2xl"
          }`}
        >
          {questionText}
        </p>
      </div>

      {/* Option Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt: string, i: number) => {
          const isThisSelected = opt === selected;
          const isThisCorrectAnswer = opt === question.correctAnswer;
          const isOptArabic = /[\u0600-\u06FF]/.test(opt);

          let optionStyle =
            "bg-white border-b-4 border-[#E2D4BE] hover:border-emerald-600 hover:bg-emerald-50/40 text-slate-700 active:border-b-0 active:translate-y-1 shadow-xs";
          let icon = null;

          if (isThisSelected) {
            if (isCorrect) {
              optionStyle =
                "bg-emerald-50 border-b-4 border-emerald-800 text-emerald-900 shadow-md font-extrabold ring-2 ring-emerald-500/20";
              icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
            } else {
              optionStyle =
                "bg-rose-50 border-b-4 border-rose-800 text-rose-900 shadow-md font-extrabold ring-2 ring-rose-500/20";
              icon = <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
            }
          } else if (isAnswered && !isCorrect && isThisCorrectAnswer) {
            optionStyle =
              "bg-emerald-50/80 border-2 border-dashed border-emerald-500 text-emerald-800 font-bold";
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
          }

          return (
            <button
              key={i}
              type="button"
              disabled={isAnswered && isCorrect}
              onClick={() => onOptionClick(opt)}
              className={`p-4 min-h-[4.2rem] rounded-2xl text-left font-bold transition-all flex items-center justify-between gap-2.5 cursor-pointer disabled:cursor-default text-base ${
                isOptArabic ? "font-amiri text-2xl text-right" : ""
              } ${optionStyle}`}
            >
              <span className="truncate">{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {isAnswered && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-2.5 transition-all text-xs sm:text-sm font-bold ${
            isCorrect
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          {isCorrect ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Maa Syaa Allah! Jawabanmu benar! (+{question.points || 1} Poin)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>Belum tepat nih. Perhatikan jawaban yang benar ya!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
