"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

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

export default function QuestionCard({ courseId }: { courseId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      const q = query(
        collection(db, "questions"),
        where("courseId", "==", courseId)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[];
      setQuestions(data);
    };

    fetchQuestions();
  }, [courseId]);

  const handleSelect = (questionId: string, option: string) => {
    setSelected((prev) => ({ ...prev, [questionId]: option }));
  };

  return (
    <div className="grid grid-cols-1  gap-6">
      {questions.map((q) => (
        <div key={q.id} className="p-6 bg-gray-200 shadow-md rounded-xl">
          <img
            src={q.prompt}
            alt="Soal"
            className="object-contain w-32 h-32 mb-4"
          />
          <p>{q.prompt}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isSelected = selected[q.id] === opt;
              const isCorrect = q.correctAnswer === opt;

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(q.id, opt)}
                  className={`block w-full text-left p-3 rounded-md border transition
                    ${
                      isSelected
                        ? isCorrect
                          ? "bg-green-100 border-green-500"
                          : "bg-red-100 border-red-500"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }
                  `}
                  disabled={!!selected[q.id]}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
