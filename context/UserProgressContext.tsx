"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";

type UserProgressContextType = {
  isAnimating: boolean;
  addPoints: (amount: number) => Promise<void>;
  completeCourse: (courseId: string) => Promise<void>;
  recentAddedPoints: number;
};

const UserProgressContext = createContext<UserProgressContextType | null>(null);

export const UserProgressProvider = ({ children }: { children: ReactNode }) => {
  const { totalPoint, setTotalPoint, completedCourse, setCompletedCourse, uid } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [recentAddedPoints, setRecentAddedPoints] = useState(0);

  const addPoints = useCallback(
    async (amount: number) => {
      // Optimistic UI Update
      const newTotal = (totalPoint || 0) + amount;
      setTotalPoint(newTotal);

      // Trigger animation state
      setRecentAddedPoints(amount);
      setIsAnimating(true);

      setTimeout(() => {
        setIsAnimating(false);
      }, 1500); // Animation duration

      // Sync to Firestore
      if (uid) {
        try {
          await updateDoc(doc(db, "users", uid), {
            totalPoint: increment(amount),
          });
        } catch (error) {
          console.error("Failed to sync points to Firestore:", error);
        }
      }
    },
    [totalPoint, setTotalPoint, uid]
  );

  const completeCourse = useCallback(
    async (courseId: string) => {
      const current = completedCourse || [];
      if (!current.includes(courseId)) {
        const updated = [...current, courseId];
        setCompletedCourse(updated);

        if (uid) {
          try {
            await updateDoc(doc(db, "users", uid), {
              completedCourse: arrayUnion(courseId),
            });
          } catch (error) {
            console.error("Failed to sync completed course to Firestore:", error);
          }
        }
      }
    },
    [completedCourse, setCompletedCourse, uid]
  );

  return (
    <UserProgressContext.Provider
      value={{
        isAnimating,
        addPoints,
        completeCourse,
        recentAddedPoints,
      }}
    >
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const ctx = useContext(UserProgressContext);
  if (!ctx) throw new Error("useUserProgress must be used inside <UserProgressProvider>");
  return ctx;
};
