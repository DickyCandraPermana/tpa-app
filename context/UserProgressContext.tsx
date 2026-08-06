"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
// import { db } from "@/lib/firebase"; // will be used to sync to firestore later

type UserProgressContextType = {
  isAnimating: boolean;
  addPoints: (amount: number) => void;
  recentAddedPoints: number;
};

const UserProgressContext = createContext<UserProgressContextType | null>(null);

export const UserProgressProvider = ({ children }: { children: ReactNode }) => {
  const { totalPoint, setTotalPoint, uid } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [recentAddedPoints, setRecentAddedPoints] = useState(0);

  const addPoints = useCallback((amount: number) => {
    // Optimistic UI Update
    const newTotal = (totalPoint || 0) + amount;
    setTotalPoint(newTotal);
    
    // Trigger animation state
    setRecentAddedPoints(amount);
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 1500); // Animation duration

    // TODO: Sync to Firestore
    if (uid) {
      // updateDoc(doc(db, "users", uid), { totalPoint: newTotal });
    }
  }, [totalPoint, setTotalPoint, uid]);

  return (
    <UserProgressContext.Provider value={{ isAnimating, addPoints, recentAddedPoints }}>
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const ctx = useContext(UserProgressContext);
  if (!ctx) throw new Error("useUserProgress must be used inside <UserProgressProvider>");
  return ctx;
};
