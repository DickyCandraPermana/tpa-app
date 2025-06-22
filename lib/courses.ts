import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const getCourses = async () => {
  const snapshot = await getDocs(collection(db, "courses"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

import { doc, getDoc } from "firebase/firestore";

export const getCourseById = async (id: string) => {
  const courseDoc = await getDoc(doc(db, "courses", id));
  if (courseDoc.exists()) {
    return { id: courseDoc.id, ...courseDoc.data() };
  } else {
    return null;
  }
};

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

export const getCourseQuestions = async (
  course: string
): Promise<Question[]> => {
  const q = query(collection(db, "questions"), where("courseId", "==", course));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Question)
  );
};
