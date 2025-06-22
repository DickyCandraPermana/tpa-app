"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type CourseContextType = {
  activeCourse: string | null;
  setCourse: React.Dispatch<React.SetStateAction<any>>;
};

const CourseContext = createContext<CourseContextType | null>(null);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [activeCourse, setActiveCourse] = useState<string | null>(null);

  return (
    <CourseContext.Provider
      value={{
        activeCourse,
        setCourse: setActiveCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourse must be used inside <AuthProvider>");
  return ctx;
};
