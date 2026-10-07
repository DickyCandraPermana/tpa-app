import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Course {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  imageUrl?: string;
  totalQuestions?: number;
}

export interface Question {
  id: string;
  correctAnswer: string;
  courseId: string;
  options: string[];
  points?: number;
  prompt?: string;
  question?: string;
  imageUrl?: string;
  audioUrl?: string;
  tags?: string[];
  type?: string;
}

export const getCourses = async (): Promise<Course[]> => {
  const snapshot = await getDocs(collection(db, "courses"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  const courseDoc = await getDoc(doc(db, "courses", id));
  if (courseDoc.exists()) {
    return { id: courseDoc.id, ...courseDoc.data() } as Course;
  }
  return null;
};

export const getCourseQuestions = async (
  courseId: string
): Promise<Question[]> => {
  const q = query(collection(db, "questions"), where("courseId", "==", courseId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() } as Question)
  );
};
