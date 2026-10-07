"use client";

import React from "react";
import { Question } from "@/lib/courses";
import { CheckCircle2, XCircle } from "lucide-react";

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

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">
          Pertanyaan {currentIndex + 1}
        </h2>
        <span className="text-sm font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          {currentIndex + 1} dari {totalQuestions}
        </span>
      </div>

      {question.imageUrl && (
        <div className="flex justify-center p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/60 max-w-sm mx-auto">
          <img
            src={question.imageUrl}
            alt="Ilustrasi Soal"
            className="max-h-48 object-contain rounded-xl"
          />
        </div>
      )}

      <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm">
        <p className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-relaxed text-center py-2">
          {questionText}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {question.options.map((opt: string, i: number) => {
          const isThisSelected = opt === selected;
          const isThisCorrectAnswer = opt === question.correctAnswer;

          let optionStyle =
            "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-700 hover:shadow-md";
          let icon = null;

          if (isThisSelected) {
            if (isCorrect) {
              optionStyle =
                "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-md ring-2 ring-emerald-400/20 font-bold";
              icon = <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />;
            } else {
              optionStyle =
                "bg-rose-50 border-rose-500 text-rose-800 shadow-md ring-2 ring-rose-400/20 font-bold";
              icon = <XCircle className="w-6 h-6 text-rose-600 shrink-0" />;
            }
          } else if (isAnswered && !isCorrect && isThisCorrectAnswer) {
            optionStyle =
              "bg-emerald-50/70 border-2 border-dashed border-emerald-400 text-emerald-800 font-semibold";
            icon = <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />;
          }

          return (
            <button
              key={i}
              type="button"
              disabled={isAnswered && isCorrect}
              onClick={() => onOptionClick(opt)}
              className={`p-5 min-h-[4.5rem] border-2 rounded-2xl text-left font-bold transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default text-lg md:text-xl ${optionStyle}`}
            >
              <span>{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
            isCorrect
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          {isCorrect ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">Maa Syaa Allah! Jawabanmu benar! (+{question.points || 1} Poin)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-bold">Kurang tepat nih, perhatikan jawaban yang benar di atas ya!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
